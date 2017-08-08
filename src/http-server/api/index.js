
import { createVersionsApi } from './bin/versions'

export const routeApi = (server, devices) => {
	const { versionsRoute } = createVersionsApi(devices)
	server.route(versionsRoute())
	return server
}
