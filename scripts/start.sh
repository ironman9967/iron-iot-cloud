#!/bin/bash

rm -rf temp

ssh-keyscan github.com >> ~/.ssh/known_hosts

git clone git@github.com:ironman9967/iron-iot-cloud.git temp

ls

#cp -r ./temp/scripts ./scripts

#rm -rf temp

#ls
#./scripts/start-nvm.sh

#nvm --version
