.DEFAULT_GOAL := help

## Setup & build
all: install client ## Install dependencies and build the client
install: install-node install-php ## Install all project dependencies (Node + PHP)
install-node: ## Install Node dependencies (pnpm)
	pnpm install
install-php: ## Install PHP dependencies (composer)
	composer install
client: ## Build the frontend client (pnpm build)
	pnpm build

## Release
release: ## Prepare a release PR. Usage: make release VERSION=x.y.z
	@test -n "$(VERSION)" || { echo "Usage: make release VERSION=x.y.z"; exit 1; }
	node scripts/prepare-release.mjs $(VERSION)
build: client ## Build dist/crowdsignal-forms/ and the release zip (compiles the client first)
	./scripts/build-plugin.sh
i18n: ## Regenerate the translation POT file
	./scripts/makepot.sh
pot: ## Regenerate the translation POT file (alias of i18n)
	./scripts/makepot.sh
clean: ## Remove the build/dist/release directories
	rm -rf build dist release

## Docker dev environment
docker_env: ## Create docker/.env from default.env if it doesn't exist
	@test -f docker/.env || cp docker/default.env docker/.env
docker_build: docker_env ## Build the Docker WordPress dev images
	docker-compose -f docker/docker-compose.yml build
docker_up: docker_env ## Start the Docker WordPress dev environment (detached)
	docker-compose -f docker/docker-compose.yml up -d
docker_stop: ## Stop the Docker containers
	docker-compose -f docker/docker-compose.yml stop
docker_down: ## Stop and remove the Docker containers
	docker-compose -f docker/docker-compose.yml down
docker_sh: ## Shell into the WordPress container
	docker-compose -f docker/docker-compose.yml exec wordpress bash
docker_sh_db: ## Shell into the database container
	docker-compose -f docker/docker-compose.yml exec db bash
docker_install: ## Install WordPress inside the container
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "/var/scripts/install.sh"
docker_uninstall: ## Uninstall WordPress inside the container
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "/var/scripts/uninstall.sh"

## Tests & linting (run inside the container)
phpunit: ## Run PHPUnit in the container (extra args via ARGS=...)
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && WP_TESTS_DIR=/tmp/wordpress-develop/tests/phpunit ./vendor/bin/phpunit $(ARGS)"
phpcs: ## Run PHP CodeSniffer in the container
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && ./vendor/bin/phpcs"
phpcbf: ## Auto-fix PHP coding standard violations in the container
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && ./vendor/bin/phpcbf"
composer: ## Run composer install inside the container
	docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && composer install"

## Help
help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

.PHONY: all install install-node install-php client release build i18n pot clean docker_env docker_build docker_up docker_down docker_stop docker_sh docker_sh_db docker_install docker_uninstall phpunit phpcs phpcbf composer help
