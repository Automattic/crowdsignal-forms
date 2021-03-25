#!/usr/bin/env bash

# to be ran within a docker instance or somewhere where wp-cli is installed.
# requires gettext.
# usually ran via make translations

set -e

composer exec -v -- 'wp i18n make-pot . ./languages/crowdsignal-forms.pot --exclude="docker,tests,release,client" --include=./build'
