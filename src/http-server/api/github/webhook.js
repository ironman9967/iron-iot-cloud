
import { createHmac } from 'crypto'

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
		const { ref, ref_type, repository } = payload
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

	const checkSecret = ({
		req,
		reply
	}) => {
		const {
			headers,
			payload
		} = req
		const signature =
			`sha1=${createHmac("sha1", process.env.GITHUB_WEBHOOK_SECRET)
				.update(payload)
				.digest("hex")}`
		const reqSign = headers['x-hub-signature'] || null
		if (reqSign != null && reqSign == signature) {
			parseTag({
				payload: JSON.parse(payload.toString()),
				reply
			})
		}
		else {
			reply().statusCode = 401
			const { info: { remoteAddress, remotePort } } = req
			logger.next([ 'UNAUTHORIZED REQUEST REJECTED', {
				signature,
				reqSign,
				remoteAddress,
				remotePort
			}])
		}
	}

	return {
		createRoute:() => ({
			method: 'POST',
			path: '/api/github/webhook/{event}',
			config: {
				payload: {
					parse: false
				}
			},
			handler: (req, reply) => checkSecret({ req, reply })
		})
	}
}
