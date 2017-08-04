#!/bin/bash

touch ~/.bashrc

rm -rf nvm_latest.json

export NVM_LATEST_VERSION=`curl -is https://api.github.com/repos/creationix/nvm/releases/latest | grep -o '"name": "[^"]*"' | grep -o 'v\d*\.\d*.\d*'`

curl -o- https://raw.githubusercontent.com/creationix/nvm/$NVM_LATEST_VERSION/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
