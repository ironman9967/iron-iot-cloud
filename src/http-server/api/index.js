
import { createBinVersionsApi } from './bin/versions'
import { createBinPrebuildApi } from './bin/prebuild'
import { createBinBuiltApi } from './bin/built'

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

	const { creatRoute: binBuiltRoute } = createBinBuiltApi({
		buildComplete
	})
	// server.route(binBuiltRoute())

	console.log(binBuiltRoute())

	return server
}
