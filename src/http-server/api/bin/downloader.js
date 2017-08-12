
export const createBinDownloaderApi = () => {
	const apiRoute = 'api/bin/downloader'

	return {
		createRoute: prebuildNeeded => ({
			method: 'POST',
			path: `/${apiRoute}/prebuild`,
			handler: ({
				payload: {
					ref: version,
					repository: { name: repo }
				}
			}, reply) => {
				reply()
				if (ref_type == 'tag' && ref.indexOf('v') == 0)  {
					const [ ,, model, iteration ] = repo.split('-')
					prebuildNeeded.next({
						model,
						iteration,
						version
					})
				}
			}
		})
	}
}
