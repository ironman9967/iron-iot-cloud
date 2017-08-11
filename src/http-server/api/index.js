
import { createBinVersionsApi } from './bin/versions'
import { createBinDownloaderApi } from './bin/downloader'

export const routeApi = (server, staticFilePublicUrl, devices) => {
	const { createRoute: binVersionsRoute } =
		createBinVersionsApi(staticFilePublicUrl, devices)
	const { createRoute: binDownloaderRoute } =
		createBinDownloaderApi()
	server.route(binVersionsRoute())
	server.route(binDownloaderRoute())
	return server
}
