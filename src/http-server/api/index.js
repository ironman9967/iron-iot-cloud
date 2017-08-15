
import { createBinVersionsApi } from './bin/versions'
import { createBinPrebuildApi } from './bin/prebuild'

export const routeApi = (server, {
	deviceUpsert,
	prebuildNeeded,
	buildComplete
}) => {
	const { createRoute: binVersionsRoute } = createBinVersionsApi({
		deviceUpsert,
		prebuildNeeded
	})
	server.route(binVersionsRoute())

	const { createRoute: binPrebuildRoute } = createBinPrebuildApi({
		deviceUpsert
	})
	server.route(binPrebuildRoute())

	return server
}
