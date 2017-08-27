
import { Subject } from '@reactivex/rxjs/dist/cjs/Subject'

const parseTag = ({
	tagParsed,
	payload,
	reply
}) => {
	reply()
	const { ref, ref_type } = payload
	if (ref_type == 'tag' && ref.indexOf('v') == 0) {
		tagParsed.next(payload)
	}
}

export const createGithubWebhookApi = ({
	logger,
	deviceUpsert,
	selfUpdateReady
}) => {
	const tagParsed = new Subject()
	tagParsed.subscribe(({
		payload: {
			ref: version,
			ref_type,
			repository: { name: repo }
		}
	}) => {
		const [ ,, model, iteration ] = repo.split('-')
		logger.next([ 'release posted', {
			model,
			iteration,
			version,
			repo
		}])
		if (model != 'cloud' && iteration) {
			const d = { model, iteration }
			logger.next([ 'prebuild ready', d ])
			deviceUpsert.next(d)
		}
		else {
			selfUpdateReady.next()
		}
	})
	return {
		createRoute:() => ({
			method: 'POST',
			path: '/api/github/webhook/{event}',
			handler: ({ payload }, reply) => parseTag({
				tagParsed,
				payload,
				reply
			})
		})
	}
}
