#!/usr/bin/env bash

# to be ran within a docker instance or somewhere where wp-cli is installed.
# requires gettext.
# usually ran via make translations

set -e

# Most translatable strings are extracted from the compiled client (build/),
# not client/ sources. Without it the POT silently loses the editor UI strings.
if [[ ! -d build ]]; then
	>&2 echo "build/ is missing - run 'make client' (pnpm build) first, then re-run."
	exit 1
fi

composer exec -v -- 'wp i18n make-pot . ./languages/crowdsignal-forms.pot --exclude="docker,tests,release,client"'
