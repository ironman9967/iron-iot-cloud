
import { createBinVersionsApi } from './bin/versions'
import { createBinPrebuildApi } from './bin/prebuild'
import { createGithubWebhookApi } from './github/webhook'

export const routeApi = ({
	logger,
	server,
	deviceUpsert,
	prebuildNeeded,
	selfUpdateReady
}) => {
	const { createRoute: binVersionsRoute } = createBinVersionsApi({
		logger,
		deviceUpsert,
		prebuildNeeded
	})
	server.route(binVersionsRoute())

	const { createRoute: binPrebuildRoute } = createBinPrebuildApi({
		logger
	})
	server.route(binPrebuildRoute())

	const { createRoute: githubWebhookRoute } = createGithubWebhookApi({
		logger,
		deviceUpsert,
		selfUpdateReady
	})
	server.route(githubWebhookRoute())

	return server
}
