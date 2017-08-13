
export const createBinDownloaderApi = ({
	deviceUpsert
}) => {
	const apiRoute = 'api/bin/downloader'

	return {
		createRoute: () => ({
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
					deviceUpsert.next({ model, iteration })
				}
			}
		})
	}
}
