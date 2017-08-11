
import { createBinDownloader} from './bin-downloader'

import { createHttpServer } from './http-server'
import { routeApi } from './http-server/api'
import { routeStaticFiles } from './http-server/static-files'

const devices = [{
	model: 'phub',
	iteration: 1,
	app: { version: "v0.0.1" }
}, {
	model: 'armb',
	iteration: 1,
	app: { version: "v0.0.1" }
}]

const port = 9967

const { update: updateBin } = createBinDownloader(devices)

updateBin()
	.then(() => createHttpServer(port))
	.then(server => routeApi(server, '', devices))
	.then(server => routeStaticFiles(server))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		server.log(`server up on ${port}`)
	}))
