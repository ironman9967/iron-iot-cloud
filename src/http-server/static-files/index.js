
import path from 'path'
import {
	emptyDirSync,
	createWriteStream,
	removeSync
} from 'fs-extra'

export const routePublic = ({ server }) => {
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

export const routeBuiltPost = ({
	logger,
	server,
	buildComplete
}) => {
	const route = 'bin/devices/builds'
	const prebuildFolderPath =
		path.resolve(`${process.env.APP_PATH}/dist/http-server/public/bin/devices/prebuilds`)
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
			const selfUpdate = model == 'cloud'
			if (!selfUpdate) {
				const builtFolderPath = path.resolve(path.join(
					`${process.env.APP_PATH}/dist/http-server/public`,
					route,
					`${model}/${iteration}/app`
				))
				const builtFilePath = path.join(builtFolderPath, filename)
				emptyDirSync(builtFolderPath)
				payload[filename].pipe(createWriteStream(builtFilePath))
				const prebuildFilename = path.join(prebuildFolderPath,
					`prebuild_${filename.substring('built_'.length)}`)

				logger.next([ `removing prebuild`, { prebuildFilename } ])
				removeSync(prebuildFilename)
				const data = {
					model,
					iteration,
					builtFilePath
				}
				logger.next([ 'BUILD COMPLETE!', data ])
				buildComplete.next(data)
			}
			reply().statusCode = 201
			if (selfUpdate) {
				logger.next('!!! UPDATE READY !!!')
				process.exit()
			}
		}
	})
	return server
}
