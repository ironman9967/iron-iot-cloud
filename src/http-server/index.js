
import path from 'path'

import { Server } from 'hapi'
import Inert from 'inert'
import Good from 'good'
import h2o2 from 'h2o2'

export const createHttpServer = ({ port }) => {
	const server = new Server({
		connections: {
			routes: {
				files: {
					relativeTo: path.join(__dirname, 'public')
				}
			}
		}
	})
	server.connection({ port })
	return server.register(Inert)
		.then(() => server.register({
			register: Good,
			options: {
				reporters: {
					consoleReporter: [{
						module: 'good-squeeze',
						name: 'Squeeze',
						args: [{
							log: '*',
							response: '*'
						}]
					}, {
						module: 'good-console'
					}, 'stdout']
				}
			}
		}))
		.then(() => server.register({ register: h2o2 }))
		.then(() => server)
}
