
export const createBinDownloaderApi = () => {
	const apiRoute = 'api/bin/downloader'

	return {
		createRoute: () => ({
			method: 'POST',
			path: `/${apiRoute}/prebuild`,
			handler: ({
				payload: {
					ref,
					ref_type,
					repository: { name: repo },
					sender: {
						login: senderLogin,
						id: senderId
					}
				}
			}, reply) => {
				reply()
				if (ref_type == 'tag' && ref.indexOf('v') == 0)  {
					console.log(repo.split('-'))
				}
				console.log(ref)
				console.log(ref_type)
				console.log(repo)
				console.log(senderLogin)
				console.log(senderId)
			}
		})
	}
}
