#!/bin/bash

model=$1

source $APP_PATH/common/scripts/start-nvm.sh

echo 'installing node stable'
nvm install stable

echo 'setting nvm default to stable'
nvm alias default stable

echo 'setting nvm to use stable'
nvm use stable

echo "getting app for $model"
wget -O $APP_PATH/get-app.sh "https://raw.githubusercontent.com/ironman9967/iron-iot-common/master/scripts/get-app.sh"
source $APP_PATH/get-app.sh $APP_PATH cloud

source $APP_PATH/common/scripts/build-app.sh $APP_PATH $version cloud

rm -rf $APP_PATH/get-app.sh
