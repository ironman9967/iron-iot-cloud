
import { Server } from 'hapi'
import Good from 'good'
import Inert from 'inert'

export const createHttpServer = port => {
	const server = new Server()
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
}
