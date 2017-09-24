
import each from 'lodash/fp/each'
import { createSubject as Subject } from 'create-subject-with-filter'

import { getDataInstance } from './data'
import { createHttpServer } from './http-server'
import { routeApi } from './http-server/api'
import { routePublic } from './http-server/static-files'

import { name, version } from '../package.json'
process.title = `${name}@${version}`

const port = process.env.PORT

const logger = new Subject()
const servicesUpdate = new Subject()

createHttpServer({ logger, port })
	.then(server => {
		logger.subscribe(arg => {
			const { message, data } =
				typeof arg == 'string' ? { message: arg } :
				Array.isArray(arg) ? { message: arg[0], data: arg[1] } :
				arg
			server.log(message, data)
		})
		return server
	})
	.then(server => getDataInstance(logger, servicesUpdate)
		.then(data => {
			data.subToNewSrvs()
			return { server, data }
		}))
	.then(routePublic)
	.then(routeApi(logger)(servicesUpdate))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		logger.next(`${process.title} started`)
		logger.next(`server up on ${port}`)
	}))
	.catch(console.error)
