
import { Server } from 'hapi'
import Good from 'good'
import Inert from 'inert'

const server = new Server()

const port = 9967

server.connection({ port })

server.register(Inert)
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
	.then(() => {
		server.start(err => {
			if (err) {
				throw err
			}
			server.log(`server up on ${port}`)
		})
	})
