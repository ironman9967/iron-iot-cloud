
import { getTarFilePath } from '../../../bin-downloader'

export const createBinVersionsApi = (staticFilePublicUrl, devices) => {
	const apiRoute = 'api/bin/versions'

	const getDeviceUrl = d => `/${apiRoute}/devices/${d.model}/${d.iteration}`
	const getDeviceUrls = () => devices.map(getDeviceUrl)
	const getDeviceFirmwareTarUrl = (d, type) =>
		`${staticFilePublicUrl}/${getTarFilePath(d, type)}`

	const getDeviceVersions = (model, iteration) => {
		const d = devices.find(d =>
			d.model == model && d.iteration == iteration)
		if (d) {
			return {
				model: d.model,
				iteration: d.iteration,
				firmware: d.firmware ? {
					version: d.firmware.version,
					tar: getDeviceFirmwareTarUrl(d, 'firmware')
				} : void 0,
				app: {
					version: d.app.version,
					tar: getDeviceFirmwareTarUrl(d, 'app')
				}
			}
		}
		else {
			return {}
		}
	}

	const getResponse = ([ type, model, iteration ]) => {
		switch (type) {
			case 'node':
				return { node: process.version }
			case 'devices':
				return model
					? getDeviceVersions(model, iteration)
					: getDeviceUrls()
			default:
				return getDeviceUrls().concat([ `/${apiRoute}/node` ])
		}
	}

	return {
		createRoute: () => ({
			method: 'GET',
			path: `/${apiRoute}/{p*}`,
			handler: ({ params: { p } }, reply) =>
				reply(getResponse(p
					? p.split('/').filter(s => s.length > 0)
					: []))
		})
	}
}
