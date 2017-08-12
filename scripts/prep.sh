#!/bin/bash

model=$1

source ./common/scripts/start-nvm.sh

echo 'installing node stable'
nvm install stable

echo 'setting nvm default to stable'
nvm alias default stable

echo 'setting nvm to use stable'
nvm use stable

echo "getting app for $model"
wget "https://raw.githubusercontent.com/ironman9967/iron-iot-cloud/master/scripts/get-app.sh"
source ./get-app.sh cloud

source ./common/scripts/build-app.sh $version cloud

rm -rf get-app.sh

echo "starting $repo app"
chmod +x ./common/scripts/start.sh
./common/scripts/start.sh
