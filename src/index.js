
import each from 'lodash/fp/each'
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'
import rp from 'request-promise'

import {
	createBinDownloader,
	getPrebuildFilePath,
	getBuiltFilePath
} from './bin-downloader'

import { createHttpServer } from './http-server'
import { routeApi } from './http-server/api'
import {
	routePublic,
	routeBuiltPost
} from './http-server/static-files'

const devices = [{
	model: 'phub',
	iteration: 1,
	interpreter: { type: 'node', version: 'stable' }
}, {
	model: 'armb',
	iteration: 1,
	interpreter: { type: 'node', version: 'stable' }
}]

const port = 9967

const deviceUpsert = new Subject()
const prebuildNeeded = new Subject()
const buildNeeded = new Subject()
const buildComplete = new Subject()

createBinDownloader({
	prebuildNeeded,
	buildNeeded
})
	.then(() => createHttpServer(port))
	.then(server => routeApi(server, {
		deviceUpsert,
		prebuildNeeded
	}))
	.then(server => routePublic(server))
	.then(server => routeBuiltPost(server, {
		buildComplete
	}))
	.then(server => server.start(err => {
		if (err) {
			throw err
		}

		buildNeeded.subscribe(d => {
			const uri = `${process.env.ARMB_1_URI}/api/prebuild-ready`
			rp({
				method: 'POST',
				uri,
				body: {
					getPrebuild: `/${getPrebuildFilePath(d, 'app')}`,
					postBuilt: `/${getBuiltFilePath(d, 'app')}`
				},
				json: true
			}).catch(err => {
				if (err.message.indexOf('ECONNREFUSED') == -1) {
					throw err
				}
				else {
					server.log(`ARM builder not available to build ${d.model}-${d.iteration} app ${d.app.version} at ${uri}`)
				}
			})
		})

		buildComplete.subscribe(({
			model,
			iteration,
			builtFilePath
		}) => {
			console.log('BUILD COMPLETE!')
			console.log({
				model,
				iteration,
				builtFilePath
			})
		})

		server.log(`server up on ${port}`)
		each(d => deviceUpsert.next(d))(devices)
	}))
	.catch(console.error)
