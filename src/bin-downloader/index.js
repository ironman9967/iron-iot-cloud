
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
	`${model}${iteration ? `${sep}${iteration}` : ''}`

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

const getLocalVersion = (logger, d, prebuild = false) => {
	const folder = prebuild
		? prebuildFolder
		: path.join(
			path.dirname(__dirname),
			staticFilesPublicUrl,
			getBuiltFolder(d, 'app')
		)
	logger.next([ 'getting local version', { device: d, prebuild, folder } ])
	return fsStat(folder)
		.then(() => fsReaddir(folder))
		.catch(err => {
			if (err.code != 'ENOENT') {
				throw err
			}
			else {
				logger.next([ 'local version not found', {
					device: d,
					prebuild,
					folder
				} ])
			}
		})
		.then(files => files
			? files.find(f => f.indexOf(prebuild ? 'prebuild' : 'built') == 0)
			: void 0
		)
		.then(tarFilename => {
			logger.next([ 'local tar found', { device: d, prebuild, tarFilename }])
			return tarFilename
		})
		.then(getVersionFromTarName)
}

export const getLocalPrebuildVersion = (logger, d) => getLocalVersion(logger, d, true)
export const getLocalBuiltVersion = getLocalVersion

export const checkLocalVersion = (logger, d, getLocalVersion) =>
	getLocalVersion(logger, d).then(local => {
		const buildNeeded = local != d.app.version
		logger.next([ 'check local version', {
			device: d,
			local,
			needed: d.app.version,
			buildNeeded
		} ])
		return buildNeeded
	})

export const syncDevicePrebuild = (logger, d) => {
	return checkLocalVersion(logger, d, getLocalBuiltVersion)
		.then(buildNeeded => buildNeeded
			? checkLocalVersion(logger, d, getLocalPrebuildVersion)
				.then(prebuidNeeded => ({
					buildNeeded,
					prebuidNeeded
				}))
			: {
				buildNeeded: false,
				prebuidNeeded: false
			})
		.then(({ buildNeeded, prebuidNeeded }) => prebuidNeeded
			? downloadDevicePrebuild(logger, d).then(() => ({ buildNeeded }))
			: { buildNeeded })
}

export const downloadDevicePrebuild = (logger, d) =>
	new Promise((resolve, reject) => {
		const args = [
			'sh',
			path.resolve(`${process.env.APP_PATH}/common/scripts/get-app.sh`),
			prebuildFolder,
			d.model,
			d.iteration
		]
		if (d.app && d.app.version) {
			args.push(d.app.version)
		}
		logger.next([ 'downloading device prebuild', {
			device: d,
			args
		} ])
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
	logger,
	prebuildNeeded,
	buildNeeded
}) => {
	ensureDirSync(prebuildFolder)
	logger.next([ 'creating prebuild folder', { prebuildFolder }])
	prebuildNeeded.subscribe(d => syncDevicePrebuild(logger, d)
		.then(({ buildNeeded: isBuildNeeded }) => isBuildNeeded
			? buildNeeded.next(d)
			: void 0
		)
	)
	return Promise.resolve()
}
