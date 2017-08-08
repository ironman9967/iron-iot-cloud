
import { createVersionsApi } from './bin/versions'

export const routeApi = (server, devices) => {
	const { createVersionsRoute } = createVersionsApi(devices)
	server.route(createVersionsRoute())
	return server
}
