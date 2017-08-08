
export const createVersionsApi = devices => {
	const apiCodeVer = 'api/bin/versions'
	const apiDmi = d => `devices/${d.model}/${d.iteration}`

	const getDeviceCodeVersions = (model, iteration) => {
		const d = devices.find(d =>
			d.model == model
			&& d.iteration == iteration)
		if (d) {
			return {
				model: d.model,
				iteration: d.iteration,
				firmware: d.firmware ? { version: d.firmware.version } : void 0,
				app: { version: d.app.version }
			}
		}
		else {
			return {}
		}
	}

	const getCodeVersions = ([ type, model, iteration ]) => {
		switch (type) {
			case 'node':
				return { node: process.version }
			case 'devices':
				return model
					? getDeviceCodeVersions(model, iteration)
					: devices.map(d => `/${apiCodeVer}/${apiDmi(d)}`)
			default:
				return devices.map(d => `/${apiCodeVer}/${apiDmi(d)}`).concat([
					`/${apiCodeVer}/node`
				])
		}
	}

	return {
		createVersionsRoute: () => ({
			method: 'GET',
			path: `/${apiCodeVer}/{p*}`,
			handler: ({ params: { p } }, reply) =>
				reply(getCodeVersions(p
					? p.split('/').filter(s => s.length > 0)
					: []))
		})
	}
}
