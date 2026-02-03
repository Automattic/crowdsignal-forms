
# Set up and build the entire project
all: install client

# Install all project dependencies
install: install-node install-php

# Install Node dependencies
install-node:
	pnpm install

# Install PHP dependencies
install-php:
	composer install

# Build the frontend client
client:
	pnpm build

# Package for release
release: clean-release client pot
	./scripts/package-for-release.sh

# Clean the build directory
clean:
	rm -rf build

clean-release: clean
	rm -rf release

# Create docker/.env from default.env if it doesn't exist
docker_env:
	@test -f docker/.env || cp docker/default.env docker/.env

docker_build: docker_env
	docker-compose -f docker/docker-compose.yml build

docker_up: docker_env
	docker-compose -f docker/docker-compose.yml up -d

docker_stop:
	docker-compose -f docker/docker-compose.yml stop

docker_down:
	docker-compose -f docker/docker-compose.yml down

docker_sh:
	docker-compose -f docker/docker-compose.yml exec wordpress bash

docker_sh_db:
	docker-compose -f docker/docker-compose.yml exec db bash

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

pot:
	./scripts/makepot.sh

.PHONY: install install-node install-php client clean clean-release docker_env docker_build docker_up docker_down docker_stop docker_sh docker_install docker_uninstall phpunit phpcs phpcbf composer release pot
