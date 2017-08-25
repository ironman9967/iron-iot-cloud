
import rp from 'request-promise'

import {
	getPrebuildFilePath,
	getBuiltFilePath 
} from '../bin-downloader'

export const createBuildRequestor = ({ logger, buildNeeded }) =>
	Promise.resolve(buildNeeded.subscribe(d => {
		const uri = `${process.env.ARMB_1_URI}/api/prebuild-ready`
		logger.next([ 'posting available prebuild to builder', {
			device: d,
			uri
		}])
		rp({
			method: 'POST',
			uri,
			body: {
				getPrebuild: `/${getPrebuildFilePath(d, 'app')}`,
				postBuilt: `/${getBuiltFilePath(d, 'app')}`
			},
			json: true
		}).catch(err => {
			if (err.message.indexOf('ECONNREFUSED') == -1) {
				throw err
			}
			else {
				logger.next(`ARM builder not available to build ${d.model}-${d.iteration} app ${d.app.version} at ${uri}`)
			}
		})
	}))
