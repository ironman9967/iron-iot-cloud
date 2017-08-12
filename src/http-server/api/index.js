
import { createBinVersionsApi } from './bin/versions'
import { createBinDownloaderApi } from './bin/downloader'

export const routeApi = (server, {
	deviceUpsert,
	prebuildNeeded
}) => {
	const { createRoute: binVersionsRoute } = createBinVersionsApi({
		deviceUpsert,
		prebuildNeeded
	})
	const { createRoute: binDownloaderRoute } = createBinDownloaderApi()
	server.route(binVersionsRoute())
	server.route(binDownloaderRoute())
	return server
}
