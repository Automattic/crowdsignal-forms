# Crowdsignal Forms

Note: this file is intended for developers, the plugin readme
is README.txt

## Using docker for local dev

You will need the following installed locally:
* npm. NPM can be installed from https://www.npmjs.com/get-npm
* Docker. Get Docker at https://www.docker.com/

More info [here](docker/README.md). After you finish with that setup, you 
can run the docker instance like this:

```
make docker_up
```

Access the site through http://localhost:8000

Login to the Docker container using this command:
```
make docker_sh
```

### Setting up for JS and CSS

`make install` will install any required Node modules.
`make client` will build the CSS and JavaScript files required by the plugin.
`make clean` will delete the generated CSS and JavaScript files.

## Running the PHP linter and tests

Assuming you are using the [docker setup](docker/README.md):

* `make composer`
* `make phpunit`
* `make phpcs`
