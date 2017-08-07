#!/bin/bash

echo 'removing nvm'
rm -rf ~/.nvm

echo 'removing temp'
rm -rf temp

echo 'trusting github.com'
ssh-keyscan github.com >> ~/.ssh/known_hosts

echo 'cloning iron-iot-cloud'
git clone git@github.com:ironman9967/iron-iot-cloud.git temp

echo 'starting nvm'
source ../common/scripts/start-nvm.sh

echo 'navigating to temp'
cd temp

echo 'npm install all deps'
npm i

echo 'building app'
npm run build

echo 'navigate up from temp'
cd ..

echo 'copying dist'
cp -r ./temp/dist ./
echo 'copying package.json'
cp ./temp/package.json ./
echo 'copying package-lock.json'
cp ./temp/package-lock.json ./

echo 'removing temp'
rm -rf temp

echo 'removing node_modules'
rm -rf node_modules

echo 'npm install production deps'
npm i --production
