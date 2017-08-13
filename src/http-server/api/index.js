
import { createBinVersionsApi } from './bin/versions'
import { createBinPrebuildApi } from './bin/prebuild'

export const routeApi = (server, {
	deviceUpsert,
	prebuildNeeded
}) => {
	const { createRoute: binVersionsRoute } = createBinVersionsApi({
		deviceUpsert,
		prebuildNeeded
	})
	server.route(binVersionsRoute())

	const { createRoute: binPerbuilderRoute } = createBinPrebuildApi({
		deviceUpsert
	})
	server.route(binPerbuilderRoute())

	return server
}
