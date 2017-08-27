
import crypto from 'crypto'

export const createGithubWebhookApi = ({
	logger,
	deviceUpsert,
	selfUpdateReady
}) => {
	const parseTag = ({
		req,
		reply
	}) => {
		reply()
		const signature = req.headers['X-Hub-Signature']
		logger.next('X-Hub-Signature', { signature })
		const { ref, ref_type, repository } = req.payload
		if (ref_type == 'tag' && ref.indexOf('v') == 0) {
			const { name: repo } = repository
			const [ ,, model, iteration ] = repo.split('-')
			logger.next([ 'release posted', {
				model,
				iteration,
				version: ref,
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
		}
		else {
			logger.next([ 'non-tag post received from github', {
				ref,
				ref_type
			}])
		}
	}
	return {
		createRoute:() => ({
			method: 'POST',
			path: '/api/github/webhook/{event}',
			handler: (req, reply) => parseTag({ req, reply })
		})
	}
}
