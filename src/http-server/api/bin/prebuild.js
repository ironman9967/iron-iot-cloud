
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

export const createBinPrebuildApi = ({ logger }) => {
	const apiRoute = 'api/bin/devices/prebuilds'

	return {
		createRoute: () => ({
			method: 'GET',
			path: `/${apiRoute}`,
			handler: ({
				method,
				payload
			}, reply) => {
				fsReaddir(prebuildFolder)
					.then(filenames =>
						map(filename => {
							const f = path.join(prebuildFolder, filename)
							const p = 'public/'
							const getPrebuild = `/${f.substring(f.indexOf(p) + p.length)}`
							const [
								, model,
								iteration,
								version
							] = filename.match(/prebuild_([^-]*)-([^_]*)_app_(.*)\.tar.gz/)
							const d = {
								model,
								iteration,
								app: {
									version
								}
							}
							const postBuilt = `/${getBuiltFilePath(d, 'app')}`
							const res = {
								getPrebuild,
								postBuilt
							}
							logger.next([ 'prebuild available', res ])
							return res
						})(filenames))
					.then(reply)
			}
		})
	}
}
