
export const routePublic = ({ server, data }) => {
	//TODO - how are we going to server ui/public files?
	// server.route({
	// 	method: 'GET',
	// 	path: '/{param*}',
	// 	handler: {
	// 		directory: {
	// 			path: '.',
	// 			redirectToSlash: true,
	// 			index: true,
	// 			listing: true
	// 		}
	// 	}
	// })
	return { server, data }
}
