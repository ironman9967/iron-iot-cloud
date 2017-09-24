
import redis, { createClient } from 'redis'
import map from 'lodash/map'

const createRedisClient = logger => new Promise(resolve => {
	logger.next(`connecting to redis`)
	const client = createClient(process.env.REDIS_HOST ? { host: process.env.REDIS_HOST } : void 0)
	client.once('ready', () => {
		logger.next(`redis client ready`)
		resolve(client)
	})
	client.on('error', err => {
		logger.next([`redis error`, err])
		process.exit(1)
	})
})

export const getDataInstance = (logger, servicesUpdate, keyPrefix = process.title) =>
	createRedisClient(logger)
		.then(client => {
			const subscriber = client.duplicate()

			const subToNewSrvs = () => {
				logger.next('subscribing to service updates')
				subscriber.subscribe(getKey('services-update'))
				subscriber.on('message', () => {
					logger.next('updated services available')
					getServices().then(srvs => servicesUpdate.next(srvs))
				})
			}
			const unsubToNewSrvs = () => subscriber.unsubscribe()

			const getKey = name => `${keyPrefix}.${name}`

			const deleteService = name => new Promise((resolve, reject) =>
				client.del(getKey(name), err => err ? reject(err) : resolve()))

			const clearServices = () =>
				new Promise((resolve, reject) => {
					logger.next('clearing services')
					client.keys(getKey('*'), (err, res) => err
						? reject(err)
						: resolve(Promise.all(map(res, deleteService))))
				})

			const getServices = () =>
				new Promise((resolve, reject) => {
					logger.next(`getServices called`)
					client.hgetall(getKey('services'), (err, res) => {
						if (err) {
							logger.next([`getServices error`, err])
							reject(err)
						}
						else {
							res !== null
								? resolve(map(res, r => JSON.parse(r)))
								: resolve([])
						}
					})
				})

			const registerService = ({ name, version, route, connection }) =>
				new Promise((resolve, reject) => {
					logger.next([`registering service`, { name, version, route, connection }])
					client.hset(getKey('services'), name, JSON.stringify({
						name,
						version,
						route,
						connection
					}), err => {
						if (err) {
							logger.next([`registerService error`, err])
							reject(err)
						}
						else {
							const key = getKey('services-update')
							logger.next('publishing update to services', { key })
							client.publish(key,
								JSON.stringify({ name, version, route, connection }))
							resolve()
						}
					})
				})

			const quit = () => {
				client.quit()
				subscriber.quit()
			}

			return {
				subToNewSrvs,
				unsubToNewSrvs,
				clearServices,
				getServices,
				registerService,
				deleteService,
				quit
			}
	})
