#!/usr/bin/env bash
#
# Assembles dist/crowdsignal-forms/ and dist/crowdsignal-forms.zip from the
# current working tree. Expects the frontend client to be compiled already
# (build/) — the `make build` target runs `client` first.
#
# This is a pure, non-interactive build step: it packages whatever is checked
# out and makes no assumptions about branch or git state. It runs both locally
# (`make build`) and in CI as part of the release workflow.

set -euo pipefail

command -v zip >/dev/null || { >&2 echo "zip is required"; exit 1; }

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PLUGIN_SLUG="crowdsignal-forms"
DIST_DIR="dist"
PLUGIN_DIR="$DIST_DIR/$PLUGIN_SLUG"
ZIP_FILE="$PLUGIN_SLUG.zip"

if [[ ! -d build ]]; then
	echo "build/ is missing — run 'make client' (pnpm build) first." >&2
	exit 1
fi

rm -rf "$DIST_DIR"
mkdir -p "$PLUGIN_DIR"

# Files and directories that ship in the plugin.
cp -r build "$PLUGIN_DIR/"
cp -r includes "$PLUGIN_DIR/"
cp -r languages "$PLUGIN_DIR/"
cp index.php LICENSE.TXT readme.txt crowdsignal-forms.php uninstall.php "$PLUGIN_DIR/"

# Never ship the canned API gateway used only for local development.
rm -f "$PLUGIN_DIR/includes/gateways/class-canned-api-gateway.php"

( cd "$DIST_DIR" && zip -rq "$ZIP_FILE" "$PLUGIN_SLUG" )

echo "Built $DIST_DIR/$ZIP_FILE"
