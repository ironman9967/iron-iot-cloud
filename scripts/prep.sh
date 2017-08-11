#!/bin/bash

source ./common/scripts/start-nvm.sh

echo 'installing node stable'
nvm install stable

echo 'setting nvm default to stable'
nvm alias default stable

echo 'setting nvm to use stable'
nvm use stable

source ./get-app.sh cloud

source ./common/scripts/build-app.sh $version cloud

echo "starting $repo app"
chmod +x ./common/scripts/start.sh
./common/scripts/start.sh
