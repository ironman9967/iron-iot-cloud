
import { Server } from 'hapi'
import Good from 'good'
import Inert from 'inert'

const devices = [{
	model: 'phub',
	iteration: 1,
	app: { version: "v0.0.1" }
}, {
	model: 'mose',
	iteration: 1,
	firmware: { version: 1 },
	app: { version: "v0.0.1" }
}]

const apiCodeVer = 'api/code/versions'
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

const getDeviceCodeVersionUrls = d => {
	const res = [ `/${apiCodeVer}/${apiDmi(d)}/app` ]
	if (d.firmware) {
		res.push(`/${apiCodeVer}/${apiDmi(d)}/firmware`)
	}
	return res
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

const server = new Server()

const port = 9967

server.connection({ port })

server.register(Inert)
	.then(() => server.register({
		register: Good,
		options: {
			reporters: {
				consoleReporter: [{
					module: 'good-squeeze',
					name: 'Squeeze',
					args: [{
						log: '*',
						response: '*'
					}]
				}, {
					module: 'good-console'
				}, 'stdout']
			}
		}
	}))
	.then(() => {
		server.route({
			method: 'GET',
			path: `/${apiCodeVer}/{p*}`,
			handler: ({ params: { p } }, reply) =>
				reply(getCodeVersions(p
					? p.split('/').filter(s => s.length > 0)
					: []))
		})
		return server
	})
	.then(() => {
		server.start(err => {
			if (err) {
				throw err
			}
			server.log(`server up on ${port}`)
			
			console.log('asdf')
		})
	})
