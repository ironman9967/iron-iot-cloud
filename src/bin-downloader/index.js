
import path from 'path'
import { exec } from 'child_process'

import { each } from 'async'
import { ensureDirSync } from 'fs-extra'

export const getModelItrStr = (d, sep = '-') =>
	`${d.model}${sep}${d.iteration}`

export const getTarFolderPath = (d, type) =>
	`bin/devices/${d.model}/${d.iteration}/${type}`

export const getTarFilePath = (d, type) =>
	`${getTarFolderPath(d, type)}/${d.model}-${d.iteration}_${type}_${d[type].version}.tar.gz`

export const downloadDevicePrebuild = d => {
	return new Promise((resolve, reject) => {
		const cwd = path.join(path.dirname(__dirname),
			`./http-server/static-files/public/${getTarFolderPath(d, 'app')}`)
		ensureDirSync(cwd)
		exec([
			'sh',
			path.resolve('./scripts/get-app.sh'),
			d.model,
			d.iteration
		].join(' '), { cwd }, (err, stdout, stderr) => {
			if (err) {
				err.stderr = stderr
				reject(err)
			}
			else {
				resolve({
					device: d,
					stdout,
					stderr
				})
			}
		})
	})
}

export const createBinDownloader = devices => ({
	//TODO: firmware && error handling!!!!
	update: () => new Promise((resolve, reject) => {
		each(devices, (d, cb) => {
			downloadDevicePrebuild(d)
				.then(updates => cb(null, updates))
				.catch(err => cb(err))
		}, (err, updates) => err ? reject(err) : resolve(updates))
	})
})
