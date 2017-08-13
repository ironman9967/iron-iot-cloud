
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
	server.route(binVersionsRoute())

	const { createRoute: binDownloaderRoute } = createBinDownloaderApi({
		deviceUpsert
	})
	server.route(binDownloaderRoute())

	return server
}
