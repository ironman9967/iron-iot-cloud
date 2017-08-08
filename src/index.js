
import { createHttpServer } from './http-server'
import { routeApi } from './http-server/api'

const devices = [{
	model: 'phub',
	iteration: 1,
	app: { version: "v0.0.1" }
}, {
	model: 'mose',
	iteration: 1,
	firmware: { version: 1 },
	app: { version: "v0.0.1" }
}]

const port = 9967

createHttpServer(port)
	.then(server => routeApi(server, devices))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		server.log(`server up on ${port}`)
	}))
