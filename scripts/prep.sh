#!/bin/bash

source ./common/scripts/start-nvm.sh

echo 'installing node stable'
nvm install stable

echo 'setting nvm default to stable'
nvm alias default stable

echo 'setting nvm to use stable'
nvm use stable

echo "getting app for $model"
wget "https://raw.githubusercontent.com/ironman9967/iron-iot-$model/master/scripts/get-app.sh"
chmod +x get-app.sh
./get-app.sh
rm -rf get-app.sh

source ./common/scripts/build-app.sh $version cloud

echo "starting $repo app"
chmod +x ./common/scripts/start.sh
./common/scripts/start.sh
