
import { createBinVersionsApi } from './bin/versions'
import { createBinPrebuildApi } from './bin/prebuild'

export const routeApi = ({
	logger,
	server,
	deviceUpsert,
	prebuildNeeded
}) => {
	const { createRoute: binVersionsRoute } = createBinVersionsApi({
		logger,
		deviceUpsert,
		prebuildNeeded
	})
	server.route(binVersionsRoute())

	const { createRoute: binPrebuildRoute } = createBinPrebuildApi({
		logger,
		deviceUpsert
	})
	server.route(binPrebuildRoute())

	return server
}
