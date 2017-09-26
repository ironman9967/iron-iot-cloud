
import find from 'lodash/find'

import Wreck from 'wreck'

export const routeApi = logger => servicesUpdate => ({
	server,
	data: { registerService, getServices }
}) => {
	let srvs = []
	servicesUpdate.subscribe(newSrvs => srvs = newSrvs)
	server.route({
		method: 'GET',
		path: '/api/services',
		handler: (req, reply) => reply(getServices())
	})
	server.route({
		method: 'POST',
		path: '/api/services/register',
		config: { payload: { parse: true, allow: 'application/json' } },
		handler: ({ payload: { name, version, route, connection } }, reply) => {
			registerService({ name, version, route, connection })
			reply().statusCode = 201
		}
	})
	server.route({
		method: '*',
		path: '/api/{route*}',
		config: { payload: { parse: false } },
		handler: (req, reply) => {
			logger.next('trying to route')
			if (!req.params.route) {
				logger.next(['no route found', req.params])
				reply().statusCode = 400
				return
			}
			const api = req.params.route.split('/')[0]
			const srv = find(srvs, ({ route }) =>
				api && route.split('/')[0] == api)
			if (!srv) {
				logger.next(['service not registered', {route: req.params.route, api, srv}])
				reply().statusCode = 404
				return
			}
			const accept = `application/iron-iot.${api}-${srv.version}+json`
			if (accept == req.headers['accept-version']) {
				if (!srv.connection.protocol) {
					logger.next([
						`service connection missing protocol - defaulting to ${req.server.info.protocol}`,
						{ srv }
					])
					srv.connection.protocol = req.server.info.protocol
				}
				logger.next(['attempting to proxy', { headers: req.headers, srv }])

				req.headers['iron-iot-req-header-injection'] = 'test'

				reply.proxy(Object.assign({
					passThrough: true,
					xforward: true,
					onResponse: (err, res, req, reply, settings, ttl) => err
						? reply(err)
						: Wreck.read(res, { json: true }, (err, payload) => {
							reply(payload).headers = Object.assign({
								'iron-iot-res-header-injection': 'test'
							}, res.headers)
						})
				}, srv.connection))
			}
			else {
				logger.next(['accept-version does not match', req.headers])
				reply().statusCode = 412
			}
		}
	})
	return server
}
