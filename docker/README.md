# Docker environment for Crowdsignal forms development

Unified environment for developing Crowdsignal-Forms using Docker containers providing following goodies:

* An Ubuntu base operating system.
* Latest stable version of WordPress.
* PHPUnit setup.
* Xdebug setup.
* WP-CLI installed.
* Makefile shortcut commands to simplify use

## Contents

  - [Get started](#to-get-started)
  - [Good to know](#good-to-know)
  - [MySQL Database](#mysql-database)
  - [Must-use plugins directory](#must-use-plugins-directory)
  - [Debugging](#debugging)

## To get started

_**All commands mentioned in this document should be run from the base plugin directory. Not from the `docker` directory!**_

### Prerequisites

* [Docker](https://hub.docker.com/search/?type=edition&offering=community)
* [NodeJS](https://nodejs.org)

Install prerequisites; you will need to open up Docker to install its dependencies. Generally, if correctly done, a `docker` command should be present.
A docker-compose one too.

For Linux users check [linux-postinstall](https://docs.docker.com/engine/install/linux-postinstall/)

### Setup

Copy settings file.
```sh
cp docker/default.env docker/.env
```

Anything you put in `.env` overrides values in `default.env`. You should modify all the password fields for security, for example.

Build and spin up the containers
```sh
make docker_build
make docker_up
```

You can install WordPress and activate Crowdsignal-Forms via command line. spin up the containers and then run:

```sh
make docker_install
make composer
```

This will give you a single site with user/pass `wordpress` (unless you changed these from `./docker/.env` file).


To remove the WordPress installation and start over, run:

```sh
make docker_uninstall
```

WordPress is running at [http://localhost:8000](http://localhost:8000) now.

## Good to know

WordPress’ `WP_SITEURL` and `WP_HOME` constants are configured to be dynamic in `./docker/wordpress/wp-config.php` so you shouldn’t need to change these even if you access the site via different domains.

### Pointing auth to your CS account
After connecting to Crowdsignal you can get your PARTNER_GUID and USER_CODE from the `wp_options` table, then set that pair on the `.env` file so it always uses those to connect:
```
# CS
CROWDSIGNAL_FORMS_API_PARTNER_GUID=
CROWDSIGNAL_FORMS_API_USER_CODE=
```

### Pointing the container to your sandbox instead of production.
If you want the hosts entry within the container to point to your sandbox, you can start
docker-compose like this:

```shell script
CS_SANDBOX_IP=<your-ip> make docker_up
```

### Container Environments

Customizations should go into a `./docker/.env` file you create, though, not in the `./docker/default.env` file.

### Start containers

```sh
make docker_up
```

Will start two containers (WordPress, MySQL) defined in `docker-composer.yml`. Wrapper for `docker-composer up`.

This command will rebuild the WordPress container if you made any changes to `docker-composer.yml`. It won’t build the images again on its own if you changed any of the other files like `Dockerfile`, `run.sh` (the entry-point file) or the provisioned files for configuring Apache and PHP. See "rebuilding images".

### Stop containers

```sh
make docker_stop
```

Stops all containers. Wrapper for `docker-composer stop`.

```sh
make docker_down
```

Will stop all of the containers created by this docker-compose configuration and remove them, too. It won’t remove the images. Just the containers that have just been stopped.

### Rebuild images

```sh
make docker_build
```

You need to rebuild the WordPress image with this command if you modified `Dockerfile`, `docker-composer.yml` or the provisioned files we use for configuring Apache and PHP.

### Running unit tests, linting etc

```sh
make phpunit
make phpcs
make phpcbf
```

### Using WP CLI
TODO

## MySQL database

Connecting to your MySQL database from outside the container, use:

- Host: `127.0.0.1`
- Port: `3306`
- User: `wordpress`
- Pass: `wordpress`
- Database: `wordpress`

You can also see your database files via local file system at `./docker/data/mysql`.
Note: Old (local) database files may cause database connection errors when reinstalling WordPress. They are not reset/deleted automatically when uninstalling.

## Must Use Plugins directory

You can add your own PHP code to `./docker/mu-plugins` directory and they will be loaded by WordPress,
in alphabetical order, before normal plugins, meaning API hooks added in an mu-plugin apply to all other
plugins even if they run hooked-functions in the global namespace. Read more about [must use plugins](https://codex.wordpress.org/Must_Use_Plugins).

## Debugging

### Accessing logs

Logs are stored in your file system under `./docker/logs` directory.

### Debugging emails

Emails don’t leave your WordPress and are caught by [MailDev](http://danfarrelly.nyc/MailDev/) SMTP server container instead.

To debug emails via web-interface, open [http://localhost:1080](http://localhost:1080)

### Debugging React

To get the development versions of React scripts, you can setup the WordPress instance by adding/editing a flag: `SCRIPT_DEBUG`.

In `docker/wordpress/wp-config.php` file, see if the following exists or is set:

```
define( 'SCRIPT_DEBUG', true );
```

### Debugging PHP with Xdebug

The WordPress image is leveraged with Xdebug present as a PHP Extension.

You’ll likely need to install a browser extension like the following:

* [The easiest Xdebug](https://addons.mozilla.org/en-US/firefox/addon/the-easiest-xdebug/) for Mozilla Firefox
* [Xdebug Helper](https://chrome.google.com/webstore/detail/xdebug-helper/eadndfjplgieldjbigjakmdgkmoaaaoc) for Google Chrome

#### Remote debugging with Atom editor

![Screenshot showing Atom editor with Xdebug](https://user-images.githubusercontent.com/746152/37091829-573605f6-21e8-11e8-9f16-3908854fd7d6.png)

You’ll need to install the [php-debug](https://atom.io/packages/php-debug) package for Atom. Features of this package include:
* Add Breakpoints
* Step through debugging (Over, In, Out)
* Stack and Context views
* Add watch points to inspect current values of variables

##### Configuring Atom editor

1. Install [php-debug](https://atom.io/packages/php-debug) package for your Atom editor.

1. Configure php-debug:

	1. To listen on all addresses (**Server Address**: `0.0.0.0`)
	    ![Screenshot showing "Server Address" input](https://user-images.githubusercontent.com/746152/37093338-c381757e-21ed-11e8-92cd-5b947a2d35ba.png)

	2. To map your current Crowdsignal-Forms directory to the docker file system path (**Path Maps** to `/var/www/html/wp-content/plugins/jetpack;/local-path-in-your-computer/jetpack`)

		![Screenshot showing "Path Maps" input](https://user-images.githubusercontent.com/746152/37150779-c891a7f4-22b1-11e8-9293-f34679df82f5.png)

1. Make sure you installed the Chrome extension on your browser and configure it to send the IDE Key `xdebug-atom`

	* In the case of the **Xdebug Helper** extension, you get to set this by right-clicking (secondary click) on the extensions’ icon and clicking **Options**:

		![Screenshot showing Xdebug helper menu](https://user-images.githubusercontent.com/746152/37093557-82b766a6-21ee-11e8-8c0f-93f7ae72b9dc.png)

	* Set the IDE key field to `Other`, enter `xdebug-atom` in the text field, and press Save.

		![Screenshot showing IDE Key](https://user-images.githubusercontent.com/746152/37178231-ac46f92e-2300-11e8-88ec-31434a3d8fc7.png)

1. Going back to Atom, proceed to toggle debugging on from the **Package** Menu item:

	![Screenshot showing Package menu items](https://user-images.githubusercontent.com/746152/37092536-08f8e4fa-21eb-11e8-8f5c-bcf70029612b.png)

	* Expect to see the debugger console window opening:

	![Screenshot showing debugger console](https://user-images.githubusercontent.com/746152/37092608-3f649e26-21eb-11e8-87b8-02a8ae7e9a98.png)

	* This window will read `Listening on address port 0.0.0.0:9000` until you go to the WordPress site and refresh to make a new request. Then this window will read: `Connected` for a short time until the request ends. Note that it will also remain as such if you had added a break point and the code flow has stopped:

	![Screenshot showing "connected"](https://user-images.githubusercontent.com/746152/37092711-9d8d1fb4-21eb-11e8-93f6-dd1edf89e6fa.png)

1. You should be able to set breakpoints now:

	![Screen animation showing setting a breakpoint](https://user-images.githubusercontent.com/746152/37093212-591fe7d8-21ed-11e8-8352-47839ce58964.gif)

#### Remote debugging with PhpStorm editor

Below are instructions for starting a debug session in PhpStorm that will listen to activity on your Crowdsignal-Forms docker.

1. Configure your browser extension to use 'PHPSTORM' for its session ID.

1. Open your Crowdsignal-Forms project in PhpStorm and chose 'Run -> Edit Configurations' from the main menu.

1. Click the '+' icon, and chose 'PHP Remote Debug' to create a new debug configuration.

1. Name your debug configuration whatever you like.

1. Check the 'Filter debug connection by IDE key', and enter 'PHPSTORM' for 'IDE Key ( Session ID )'.

1. Click the '...' on the 'Server' line to configure your remote server.

1. In the server configuration window, click the '+' icon to create a new server configuration. Name it whatever you like.

1. In the server configuration window, set your host to the URL you use to run Crowdsignal-Forms locally. ( Eg, localhost, or 0.0.0.0, or example.ngrok.io )

1. In the server configuration window, check the 'Use path mappings' check box.

1. In the server configuration window, map the main Crowdsignal-Forms folder to '/var/www/html/wp-content/plugins/jetpack' and map '/docker/wordpress' to '/var/www/html'

1. In the server configuration window, click 'Apply' then 'Ok'.

1. Back in the main configuration window, click 'Apply' then 'Ok'.

1. You can now start a debug session by clicking 'Run -> Debug' in the main menu

#### Remote Debugging with VSCode

You'll need:

- [PHP Debug](https://marketplace.visualstudio.com/items?itemName=felixfbecker.php-debug) plugin installed in VSCode
- If you use Google Chrome, install the [Xdebug Helper](https://chrome.google.com/webstore/detail/xdebug-helper/eadndfjplgieldjbigjakmdgkmoaaaoc?hl=en) extension.
- If you use Firefox, install [Xdebug Helper](https://addons.mozilla.org/en-GB/firefox/addon/xdebug-helper-for-firefox/) add-on.

##### Set up the Debugging Task

In the debug panel in VSCode, select Add Configuration. Since you have PHP Debug installed, you'll have the option to select "PHP" from the list. This will create a `.vscode` folder in the project root with a `launch.json` file in it.

You will need to supply a pathMappings value to the `launch.json` configuration. This value connects the debugger to the volume in Docker with the Crowdsignal-Forms code. Your `launch.json` file should have this configuration when you're done.

```json
	{
		"version": "0.2.0",
		"configurations": [
			{
				"name": "Listen for XDebug",
				"type": "php",
				"request": "launch",
				"port": 9000,
				"pathMappings": {
					"/var/www/html/wp-content/plugins/crowdsignal-plugin": "${workspaceRoot}"
				}
			},
			{
				"name": "Launch currently open script",
				"type": "php",
				"request": "launch",
				"program": "${file}",
				"cwd": "${fileDirname}",
				"port": 9000
			}
		]
	}
```

You'll need to set up the `XDEBUG_CONFIG` environment variable to enable remote debugging, and set the address and the port that the PHP Xdebug extension will use to connect to the debugger running in VSCode. Add the variable to your `.env` file.

`XDEBUG_CONFIG=remote_host=host.docker.internal remote_port=9000 remote_enable=1`

You [will also have to configure the IDE key](https://github.com/mac-cain13/xdebug-helper-for-chrome/issues/89) for the Chrome/ Mozilla extension. In your `php.ini` file (you'll find that file at `docker/config/php.ini` in the Docker environment), add:

`xdebug.idekey = VSCODE`

Now, in your browser's Xdebug Helper preferences, look for the IDE Key setting:

1. Select 'Other'
2. Add `VSCODE` as the key.
3. Save.

##### Run the debugger

- Set a break point in a PHP file, for example in the `init()` function of `class.jetpack.php`.
- Select 'Debug' on the browser extension.
- Click 'play' in VSCode's debug panel
- Refresh the page at localhost

For more context on remote debugging PHP with VSCode, see [this article](https://medium.com/@jasonterando/debugging-with-visual-studio-code-xdebug-and-docker-on-windows-b63a10b0dec).
