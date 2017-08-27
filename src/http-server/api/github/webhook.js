
export const createGithubWebhookApi = ({
	logger,
	deviceUpsert,
	selfUpdateReady
}) => {
	const parseTag = ({
		payload,
		reply
	}) => {
		reply()
		const { ref, ref_type } = payload
		if (ref_type == 'tag' && ref.indexOf('v') == 0) {
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
			handler: ({ payload }, reply) => parseTag({
				payload,
				reply
			})
		})
	}
}
