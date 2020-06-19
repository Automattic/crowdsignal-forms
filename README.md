# Crowdsignal Forms

Note: this file is intended for developers, the plugin readme
is README.txt

## Using docker for local dev

You will need the following installed locally:
* npm >= 6.9.0 - NPM can be installed from https://www.npmjs.com/get-npm
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

* `make install` will install any required Node modules.
* `make client` will build the CSS and JavaScript files required by the plugin.
* `make clean` will delete the generated CSS and JavaScript files.

## Running the PHP linter and tests

Assuming you are using the [docker setup](docker/README.md):

* Set up the local test env by running `./tests/bin/install.sh crowdsignal_forms_tests` (see install.sh for more info on arguments)
* If on debian, install `php-xml` and `php-mbstring`
* `composer install`
* `./vendor/bin/phpunit`
* `./vendor/bin/phpcs`
* `make composer`
* `make phpunit`
* `make phpcs`

## How to set a test usercode for the API

Filter the `crowdsignal_user_code` user meta call to return a test usercode. Add this snippet to the main `crowdsignal-forms.php` file and return your custom usercode string: 

```
function crowdsignal_get_test_user_code( $check, $object_id, $meta_key, $single ) {
    if ( 'crowdsignal_user_code' === $meta_key ) {
        return 'your-custom-user-code-here';
    }

    return null;
}
add_filter( 'get_user_metadata', 'crowdsignal_get_test_user_code', 10, 4 );
```

## Compile for Release

Run `make release`. This will compile all production files necessary for the plugin, add them to a zip archive, and copy it to the `release` folder.
