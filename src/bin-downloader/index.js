
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

import { ensureDirSync } from 'fs-extra'

const fsStat = promisify(fs.stat)
const fsReaddir = promisify(fs.readdir)

const staticFilesPublicUrl = 'http-server/public'
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
	`bin/devices/builds/${getModelItrStr(d, '/')}/${type}`

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

export const checkLocalVersion = (d, getLocalVersion) =>
	getLocalVersion(d).then(local => local != d.app.version)

export const syncDevicePrebuild = d => {
	return checkLocalVersion(d, getLocalBuiltVersion)
		.then(buildNeeded => buildNeeded
			? checkLocalVersion(d, getLocalPrebuildVersion)
				.then(prebuidNeeded => ({
					buildNeeded,
					prebuidNeeded
				}))
			: {
				buildNeeded: false,
				prebuidNeeded: false
			})
		.then(({ buildNeeded, prebuidNeeded }) => prebuidNeeded
			? downloadDevicePrebuild(d).then(() => ({ buildNeeded }))
			: { buildNeeded })
}

export const downloadDevicePrebuild = d =>
	new Promise((resolve, reject) => {
		const args = [
			'cd',
			prebuildFolder,
			'&&',
			'sh',
			path.resolve('./common/get-app.sh'),
			d.model,
			d.iteration
		]
		if (d.app && d.app.version) {
			args.push(d.app.version)
		}
		exec(args.join(' '), (err, stdout, stderr) => {
			if (err) {
				reject(err)
			}
			else {
				fsStat(path.join(prebuildFolder, `prebuild_${getTarSuffix(d, 'app')}`))
					.then(() => resolve({
						device: d
					}))
					.catch(() => {
						const err = new Error(`${getModelItrStr(d)} prebuild failed to download`)
						err.device = d
						reject(err)
					})
			}
		})
	})

export const createBinDownloader = ({
	prebuildNeeded,
	buildNeeded
}) => {
	ensureDirSync(prebuildFolder)
	prebuildNeeded.subscribe(d => syncDevicePrebuild(d)
		.then(({ buildNeeded: isBuildNeeded }) => isBuildNeeded
			? buildNeeded.next(d)
			: void 0
		)
	)
	return Promise.resolve()
}
