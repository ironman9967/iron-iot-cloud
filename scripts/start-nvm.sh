#!/bin/bash

touch ~/.bashrc

source ~/.bashrc

export NVM_CURRENT_VERSION=`cat ~/.nvm/package.json | grep -o '"version": "v\?[^\.]*\.[^\.]*\.[^\.]*"' | grep -o ': \?".*' | grep -o '[^: "]*' || echo none`
export NVM_CURRENT_VERSION=v"$NVM_CURRENT_VERSION"

echo "nvm current version is $NVM_CURRENT_VERSION"

export NVM_LATEST_VERSION=`curl -is https://api.github.com/repos/creationix/nvm/releases/latest | grep -o '"name": "v[^\.]*\.[^\.]*\.[^\.]*"' | grep -o 'v[^\.]*\.[^\.]*\.[^\.][^"]*'`

echo "nvm latest version is $NVM_LATEST_VERSION"

if [ $NVM_CURRENT_VERSION != $NVM_LATEST_VERSION ]
then
	echo "updating nvm from $NVM_CURRENT_VERSION to $NVM_LATEST_VERSION"
	curl -o- https://raw.githubusercontent.com/creationix/nvm/$NVM_LATEST_VERSION/install.sh | bash
	echo "nvm updated to $NVM_LATEST_VERSION"
else
	echo "nvm $NVM_CURRENT_VERSION is up to date"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
echo "nvm version is" `nvm --version`
