#!/bin/bash

touch ~/.bashrc

export NVM_CURRENT_VERSION=`nvm --version`

export NVM_LATEST_VERSION=`curl -is https://api.github.com/repos/creationix/nvm/releases/latest | grep -o '"name": "[^"]*"' | grep -o 'v\d*\.\d*.\d*'`

if [ $NVM_CURRENT_VERSION != $NVM_LASTEST_VERSION ]; then
	echo `updating nvm from $NVM_CURRENT_VERSION to $NVM_LASTEST_VERSION`

	curl -o- https://raw.githubusercontent.com/creationix/nvm/$NVM_LATEST_VERSION/install.sh | bash

	export NVM_DIR="$HOME/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
	[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
else
	echo `nvm $NVM_CURRENT_VERSION is up to date`
fi
