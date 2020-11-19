#!/usr/bin/env bash

# to be ran within a docker instance or somewhere where wp-cli is installed.
# requires gettext.
# usually ran via make translations

set -e

docker-compose -f docker/docker-compose.yml exec wordpress bash -c "cd /var/www/html/wp-content/plugins/crowdsignal-forms && wp i18n make-pot --allow-root . languages/crowdsignal-forms.pot --exclude={docker,tests,vendor,release,node_modules}"
