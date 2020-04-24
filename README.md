# Crowdsignal Forms

Note: this file is intended for developers, the plugin readme
is README.txt

## Using docker for local dev

a docker compose yml file is provided for making local dev easy

run 
```
PLUGIN_DIR=`pwd` docker-compose -f scripts/docker-compose.yml up --build --force-recreate
```

## Running the PHP linter and tests

You will need to have mysql/mariadb, curl and svn installed on your local machine

* Set up the local test env by running `./tests/bin/install.sh crowdsignal_forms_tests` (see install.sh for more info on arguments)
* If on debian, install `php-xml` and `php-mbstring`
* `composer install`
* `./vendor/bin/phpunit`
* `./vendor/bin/phpcs`
