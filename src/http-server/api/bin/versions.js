
import filter from 'lodash/fp/filter'
import rp from 'request-promise'

import {
	getBuiltFilePath,
	getModelItrStr
} from '../../../bin-downloader'

export const getLatestAppVersion = d =>
	rp({
		uri: `${process.env.GITHUB_API_URI}/repos/ironman9967/` +
			`iron-iot-${getModelItrStr(d)}/releases/latest`,
	    headers: { 'User-Agent': 'iron-iot' },
		json: true
	}).then(({ tag_name: version }) => version)

export const createBinVersionsApi = ({
	deviceUpsert,
	prebuildNeeded
}) => {
	const devices = []

	const removeDevice = d => filter(({
		model: m,
		iteration: i
	}) => d.model != m && d.iteration != i)

	deviceUpsert.subscribe(d => {
		getLatestAppVersion(d)
			.then(version => {
				if (!d.app || d.app.version != version) {
					d.app = {
						version
					}
					d.app.tar = getBuiltFilePath(d, 'app')
					prebuildNeeded.next(d)
				}
				removeDevice(d)
				devices.push(d)
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
			path: `/${apiRoute}/{model}/{iteration?}`,
			handler: ({ params: { model, iteration } }, reply) =>
				reply(getDeviceVersions(model, iteration))
		})
	}
}
