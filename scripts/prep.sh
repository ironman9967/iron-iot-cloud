#!/bin/bash

echo 'removing temp'
rm -rf temp

echo 'trusting github.com'
ssh-keyscan github.com >> ~/.ssh/known_hosts

echo 'cloning iron-iot-cloud'
git clone git@github.com:ironman9967/iron-iot-cloud.git temp

echo 'starting nvm'
source ./common/scripts/start-nvm.sh

echo 'navigating to temp'
cd temp

echo 'npm install all deps'
npm i

echo 'building app'
npm run build

echo 'navigate up from temp'
cd ..

echo 'copying dist'
cp -r ./temp/dist ./app
echo 'copying package.json'
cp ./temp/package.json ./app
echo 'copying package-lock.json'
cp ./temp/package-lock.json ./app

echo 'removing temp'
rm -rf temp

echo 'navigating to app'
cd app

echo 'npm install production deps'
npm i --production
