# Crowdsignal Forms

Note: this file is intended for developers, the plugin readme
is README.txt

## Using docker for local dev

a docker compose yml file is provided for making local dev easy

run 
```
PLUGIN_DIR=`pwd` docker-compose -f scripts/docker-compose.yml up --build --force-recreate
```
