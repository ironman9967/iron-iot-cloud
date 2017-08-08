#!/bin/bash

echo 'removing temp'
rm -rf temp

echo 'creating temp'
mkdir temp

echo 'requesting latest release uri'
uri=`curl \
	-H "Accept: application/vnd.github.v3+json" \
	https://api.github.com/repos/ironman9967/iron-iot-cloud/releases/latest \
| grep -E '"tarball_url": ".*",?$' \
| grep -o 'http[^",]*'`

version=`echo $uri | grep -o '[^/]*$'`

echo "downloading cloud release $version"
rm -rf latest.tar.gz
`wget -O latest.tar.gz $uri`

echo 'extracting release'
tar xvzf latest.tar.gz --transform 's:[^/]*:temp:'

echo 'removing release tar'
rm latest.tar.gz

echo 'starting nvm'
source ./common/scripts/start-nvm.sh

echo 'installing node stable'
nvm install stable

echo 'setting nvm default to stable'
nvm alias default stable

echo 'setting nvm to use stable'
nvm use stable

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

echo 'npm install production deps'
npm i --production
