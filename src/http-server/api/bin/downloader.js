
export const createBinDownloaderApi = ({
	prebuildNeeded
}) => {
	const apiRoute = 'api/bin/downloader'

	return {
		createRoute: prebuildNeeded => ({
			method: 'POST',
			path: `/${apiRoute}/prebuild`,
			handler: ({
				payload: {
					ref: version,
					ref_type,
					repository: { name: repo }
				}
			}, reply) => {
				reply()
				if (ref_type == 'tag' && version.indexOf('v') == 0)  {
					const [ ,, model, iteration ] = repo.split('-')
					prebuildNeeded.next({
						model,
						iteration,
						app: { version }
					})
				}
			}
		})
	}
}
