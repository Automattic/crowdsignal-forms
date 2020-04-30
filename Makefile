
# Set up and build the entire project
all: install client

# Install all project dependencies
install: install-node install-php

# Install Node dependencies
install-node:
	npm install

# Install PHP dependencies
install-php:
	composer install

# Build the frontend client
client:
	npm run build:styles
	npm run build:editor

# Clean the build directory
clean:
	rm -rf build

docker_build:
	docker-compose -f docker/docker-compose.yml build

docker_up:
	docker-compose -f docker/docker-compose.yml up

docker_up_d:
	docker-compose -f docker/docker-compose.yml up -d

docker_stop:
	docker-compose -f docker/docker-compose.yml stop

docker_down:
	docker-compose -f docker/docker-compose.yml down

docker_sh:
	docker-compose -f docker/docker-compose.yml exec wordpress bash

docker_install:
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "/var/scripts/install.sh"

docker_uninstall:
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "/var/scripts/uninstall.sh"

phpunit:
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && WP_TESTS_DIR=/tmp/wordpress-develop/tests/phpunit ./vendor/bin/phpunit"

phpcs:
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && ./vendor/bin/phpcs"

phpcbf:
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && ./vendor/bin/phpcbf"

composer:
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && composer install"

.PHONY: install install-node install-php client clean docker_up_d docker_build docker_up docker_down docker_stop docker_sh docker_install docker_uninstall phpunit phpcs phpcbf composer
