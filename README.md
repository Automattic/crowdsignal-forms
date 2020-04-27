# Crowdsignal Forms

Note: this file is intended for developers, the plugin readme
is README.txt

## Using docker for local dev

You will need the following installed locally:
* PHP
* composer
* npm
* calypso-build
* Docker

Install PHP and composer using brew:
```
brew install composer
brew install php
```
NPM can be installed from https://www.npmjs.com/get-npm
Calypso-build can be found at https://www.npmjs.com/package/@automattic/calypso-build
Get Docker at https://www.docker.com/

```
composer install
npm install
npm run build:editor
npm run build:styles
```

a docker compose yml file is provided for making local dev easy

run 
```
PLUGIN_DIR=`pwd` docker-compose -f scripts/docker-compose.yml up --build --force-recreate
```
Access the site through http://localhost:8000

Login to the Docker container using this command:
```
docker exec -it `docker ps|grep wordpress|awk '{print $1}'` /bin/bash
```

This directory is mirrored in the Docker container in /var/www/html/wp-content/plugins/crowdsignal-forms
