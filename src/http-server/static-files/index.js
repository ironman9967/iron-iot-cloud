
import path from 'path'
import {
	emptyDirSync,
	createWriteStream,
	removeSync
} from 'fs-extra'

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

export const routeBuiltPost = server => {
	const route = 'bin/devices/builds'
	const prebuildFolderPath = path.resolve('./dist/http-server/public/prebuilds')
	server.route({
		method: 'POST',
		path: `/${route}/{model}/{iteration}/app/{filename}`,
		config: {
			payload: {
				maxBytes: 1024000000,
				output: 'stream',
				parse: true
			}
		},
		handler: ({
			payload,
			params: {
				model,
				iteration,
				filename
			}
		}, reply) => {
			const builtFolderPath = path.resolve(
				path.join('./dist/http-server/public', route, `${model}/${iteration}/app`)
			)
			emptyDirSync(builtFolderPath)
			payload.pipe(
				createWriteStream(path.join(builtFolderPath, filename))
			)
			removeSync(path.join(prebuildFolderPath,
				`prebuild_${filename.substring('built_'.length)}`))
			reply().statusCode = 201
		}
	})
	return server
}
