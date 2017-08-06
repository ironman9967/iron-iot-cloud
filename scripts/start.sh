#!/bin/bash

rm -rf temp

ssh-keyscan github.com >> ~/.ssh/known_hosts

git clone git@github.com:ironman9967/iron-iot-cloud.git temp

chmod +x ./temp/scripts/start-nvm.sh

source ./temp/scripts/start-nvm.sh

nvm install stable

nvm alias default stable

nvm use stable

cd temp

npm i

npm run build

# cp -r ./temp/scripts ./

rm -rf temp
