
import { readdir } from 'fs'
import { promisify } from 'util'
import path from 'path'

import map from 'lodash/fp/map'

const fsReaddir = promisify(readdir)

import {
	prebuildFolder,
	getPrebuildFolder,
	getBuiltFilePath
} from '../../../bin-downloader'

export const createBinBuiltApi = ({
	deviceUpsert
}) => {
	const apiRoute = 'api/bin/devices/builds'

	return {
		createRoute: () => ({
			method: 'POST',
			path: `/${apiRoute}/{filename}`,
			config: {
				payload: {
					output: 'stream',
					parse: true,
					allow: 'multipart/form-data'
				}
			},
			handler: (req, reply) => {
				console.log(req)
				reply().statusCode = 201
			}
		})
	}
}
