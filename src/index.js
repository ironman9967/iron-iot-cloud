
import each from 'lodash/fp/each'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import rp from 'request-promise'

import {
	createBinDownloader,
	getPrebuildFilePath,
	getBuiltFilePath
} from './bin-downloader'

import { createBuildRequestor } from './build-requestor'

import { createHttpServer } from './http-server'
import { routeApi } from './http-server/api'
import {
	routePublic,
	routeBuiltPost
} from './http-server/static-files'

import { name, version } from '../package.json'
process.title = `${name}@${version.substring(1)}`

const devices = [{
// 	model: 'phub',
// 	iteration: 1,
// 	interpreter: { type: 'node', version: 'stable' }
// }, {
	model: 'armb',
	iteration: 1,
	interpreter: { type: 'node', version: 'stable' }
}]

const port = 9967

const logger = new Subject()
const deviceUpsert = new Subject()
const prebuildNeeded = new Subject()
const buildNeeded = new Subject()
const buildComplete = new Subject()
const selfUpdateReady = new Subject()

selfUpdateReady.subscribe(() => {
	logger.next('!!! UPDATE READY !!!')
	process.exit()
})

createBinDownloader({
	logger,
	prebuildNeeded,
	buildNeeded
})
	.then(() => createBuildRequestor({ logger, buildNeeded }))
	.then(() => createHttpServer({ logger, port }))
	.then(server => {
		logger.subscribe(arg => {
			const { message, data } =
				typeof arg == 'string' ? { message: arg } :
				Array.isArray(arg) ? { message: arg[0], data: arg[1] } :
				arg
			server.log(message, data)
		})
		return server
	})
	.then(server => routeApi({
		logger,
		server,
		deviceUpsert,
		prebuildNeeded,
		selfUpdateReady
	}))
	.then(server => routePublic({
		logger,
		server
	}))
	.then(server => routeBuiltPost({
		logger,
		server,
		buildComplete
	}))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}
		logger.next(`${process.title} started`)
		logger.next(`server up on ${port}`)
		each(d => deviceUpsert.next(d))(devices)
	}))
	.catch(console.error)
