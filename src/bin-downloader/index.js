
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

import { ensureDirSync } from 'fs-extra'

const fsStat = promisify(fs.stat)
const fsReaddir = promisify(fs.readdir)

const staticFilesPublicUrl = 'http-server/static-files/public'
export const getPrebuildFolder = () => `bin/devices/prebuilds`
export const prebuildFolder = path.join(path.dirname(__dirname),
	`./${staticFilesPublicUrl}/${getPrebuildFolder()}`)

export const getModelItrStr = ({ model, iteration }, sep = '-') =>
	`${model}${sep}${iteration}`

export const getTarSuffix = (d, type) =>
	`${getModelItrStr(d)}_${type}_${d[type].version}.tar.gz`

export const getVersionFromTarName = tarFilename => {
	if (tarFilename) {
		const m = tarFilename.match(/.*_(.*)\.tar/)
		if (m != null) {
			return m[1]
		}
	}
}

export const getBuiltFolder = (d, type) =>
	`bin/devices/${getModelItrStr(d, '/')}/${type}`

export const getBuiltFilePath = (d, type) =>
	`${getBuiltFolder(d, type)}/built_${getTarSuffix(d, type)}`

export const getPrebuildFilePath = (d, type) =>
	`${getPrebuildFolder()}/prebuild_${getTarSuffix(d, type)}`

const getLocalVersion = (d, prebuild = false) => {
	const folder = prebuild
		? prebuildFolder
		: path.join(
			path.dirname(__dirname),
			staticFilesPublicUrl,
			getBuiltFolder(d, 'app')
		)
	return fsStat(folder)
		.then(() => fsReaddir(folder))
		.catch(err => {
			if (err.code != 'ENOENT') {
				throw err
			}
		})
		.then(files => files
			? files.find(f => f.indexOf(prebuild ? 'prebuild' : 'built') == 0)
			: void 0
		)
		.then(getVersionFromTarName)
}

export const getLocalPrebuildVersion = d => getLocalVersion(d, true)
export const getLocalBuiltVersion = d => getLocalVersion(d)

export const downloadDevicePrebuild = ({
	model,
	iteration,
	version
}) => {
	return new Promise((resolve, reject) => {
		const args = [
			'sh',
			path.resolve('./scripts/get-app.sh'),
			model,
			iteration
		]
		if (version) {
			args.push(version)
		}
		exec(args.join(' '), { prebuildFolder }, (err, stdout, stderr) => {
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

export const createBinDownloader = ({
	prebuildNeeded
}) => {
	ensureDirSync(prebuildFolder)
	prebuildNeeded.subscribe(downloadDevicePrebuild)
	return Promise.resolve()
}
