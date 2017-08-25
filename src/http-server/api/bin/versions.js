
import get from 'lodash/fp/get'
import find from 'lodash/fp/find'
import rp from 'request-promise'

import {
	getBuiltFilePath,
	getModelItrStr
} from '../../../bin-downloader'

export const getLatestAppVersion = (logger, d) => {
	return rp({
		uri: `${process.env.GITHUB_API_URI}/repos/ironman9967/` +
			`iron-iot-${getModelItrStr(d)}/releases/latest`,
	    headers: { 'User-Agent': 'iron-iot-cloud' },
		json: true
	}).then(({ tag_name: version }) => version)
}

export const createBinVersionsApi = ({
	logger,
	deviceUpsert,
	prebuildNeeded
}) => {
	const devices = []

	deviceUpsert.subscribe(upserted => {
		logger.next([ 'device upsert', { upserted }])
		getLatestAppVersion(logger, upserted)
			.then(version => {
				let d = find(d =>
					d.model == upserted.model
					&& d.iteration == upserted.iteration)(devices)
				if (!d) {
					d = upserted
					devices.push(d)
					logger.next([ 'new device', { device: upserted }])
				}
				if (!d.app || d.app.version != version) {
					d.app = { version }
					d.app.tar = getBuiltFilePath(d, 'app')
					logger.next([ 'device up to date', d ])
					prebuildNeeded.next(d)
				}
			})
	})

	const apiRoute = 'api/bin/versions'

	const getDeviceUrl = d => `/${apiRoute}/${d.model}/${d.iteration}`

	const getDeviceVersions = (model, iteration) => {
		const d = devices.find(d =>
			d.model == model && d.iteration == iteration)
		if (d) {
			return {
				model: d.model,
				iteration: d.iteration,
				interpreter: {
					type: d.interpreter.type,
					version: d.interpreter.version,
					tar: [
						//any interpreter that does NOT need to be hosted
						'node'
					].indexOf(d.interpreter.type) < 0
						? getBuiltFilePath(d, 'interpreter')
						: void 0
				},
				app: {
					version: d.app.version,
					tar: getBuiltFilePath(d, 'app')
				}
			}
		}
		else {
			return {}
		}
	}

	return {
		createRoute: () => ({
			method: 'GET',
			path: `/${apiRoute}/{model}/{iteration}/{filter*}`,
			handler: ({
					params: {
					model,
					iteration,
					filter: filterStr
				}
			}, reply) => {
				const dvs = getDeviceVersions(model, iteration)
				const filter = filterStr ? filterStr.split('/') : void 0
				const res = filter ? get(filter.join('.'))(dvs) : dvs
				logger.next([ 'device versions', {
					model,
					iteration,
					filter,
					res
				} ])
				reply(res).statusCode = res ? 200 : 204
			}
		})
	}
}
