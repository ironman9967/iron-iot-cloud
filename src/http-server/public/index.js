
import path from 'path'

export const routePublic = server => {
	server.route({
		method: 'GET',
		path: '/{param*}',
		handler: {
			directory: {
				path: '.',
				redirectToSlash: true,
				index: true,
				listing: true
			}
		}
	})
	return server
}
