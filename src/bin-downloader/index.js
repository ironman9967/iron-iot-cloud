
import path from 'path'
import { exec } from 'child_process'

import { each } from 'async'
import { ensureDirSync } from 'fs-extra'

export const getModelItrStr = (d, sep = '-') =>
	`${d.model}${sep}${d.iteration}`

export const getTarSuffix = (d, type) =>
	`${getModelItrStr(d)}_${type}_${d[type].version}.tar.gz`

export const getBuiltFolderPath = (d, type) =>
	`bin/devices/${getModelItrStr(d, '/')}/${type}`

export const getBuiltFilePath = (d, type) =>
	`${getBuiltTarFolderPath(d, type)}/${getTarSuffix(e, type)}`

export const getPrebuildFolder = () => `bin/devices/prebuilds`

export const getPrebuildFilePath = (d, type) =>
	`bin/devices/prebuilds/prebuild_${getTarSuffix(e, type)}`

export const downloadDevicePrebuild = d => {
	const cwd = path.join(path.dirname(__dirname),
		`./http-server/static-files/public/${getPrebuildFolder()}`)
	ensureDirSync(cwd)
	return new Promise((resolve, reject) => {
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
