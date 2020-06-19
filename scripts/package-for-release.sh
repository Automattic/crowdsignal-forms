#!/usr/bin/env bash

set -e


command -v zip || {
	>&2 echo "zip is required"
	exit 1
}
command -v composer || {
	>&2 echo "composer is required"
	exit 1
}
command -v git || {
	>&2 echo "git is required"
	exit 1
}

PLUGIN_DIR=`pwd`
RELEASE_ZIP_FILENAME="crowdsignal-forms.$(git rev-parse --abbrev-ref HEAD | sed 's/\//-/g' | tr -d '\n').zip"
RELEASE_BUILD_FOLDER="/tmp/crowdsignal-forms-release-build"

rm -rf "$RELEASE_BUILD_FOLDER"
mkdir -p "$RELEASE_BUILD_FOLDER"

cp -r "$PLUGIN_DIR/includes" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/build" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/languages" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/changelog.txt" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/index.php" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/LICENSE.TXT" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/README.TXT" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/crowdsignal-forms.php" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/uninstall.php" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/composer.json" "$RELEASE_BUILD_FOLDER"
cp -r "$PLUGIN_DIR/composer.lock" "$RELEASE_BUILD_FOLDER"

composer dump-autoload --no-dev -d "$RELEASE_BUILD_FOLDER"
rm "$RELEASE_BUILD_FOLDER/composer.json" "$RELEASE_BUILD_FOLDER/composer.lock"

mkdir -p "$PLUGIN_DIR/release"
cd "$RELEASE_BUILD_FOLDER" && zip -r "$PLUGIN_DIR/release/$RELEASE_ZIP_FILENAME" .

echo "done, removing temp folders"
rm -rf "$RELEASE_BUILD_FOLDER"
