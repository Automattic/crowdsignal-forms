#!/usr/bin/env bash

# This script takes care of the first steps for a new release.
# After running, you'll be on a new branch with changes that
# you need to commit and push yourself.
# The script will:
# - parse previous version from README file (Stable tag)
# - verify you provided a proper release version (X.Y.Z)
# - pull tags from origin <- You can tamper with origin by setting REMOTE env var
# - create a new branch named after the release version
# - update README.txt "Stable tag" version
# - update package.json "version" property
# - update the changelog.txt entries from git log
# - run 'make release'
# - (if you chose to) copy the release files to "--release-dir"

# If a "REMOTE" env var is set, it will be used as the remote when fetching

SHIP_TO_DIR=false;
SHOWUSAGE=false;
bold=$(tput bold)
normal=$(tput sgr0)
SEPARATOR="******************************************************************";
REMOTE_NAME='origin';
EXPECT_NODE_VERSION=$(head -n1 .nvmrc);
CURRENT_NODE_VERSION=$(node -v);

if [ ${EXPECT_NODE_VERSION:0:4} != ${CURRENT_NODE_VERSION:0:4} ]; then
	echo
	echo "${bold}Heads up!${normal} You current ${bold}Node version ${CURRENT_NODE_VERSION}${normal} does not match what .nvmrc expects.";
	echo "Please try running this script with ${bold}Node ${EXPECT_NODE_VERSION}${normal}.";
	echo
	exit;
fi

if [[ -z "$@" ]]; then
	SHOWUSAGE=true;
fi

if [[ ! -z "${REMOTE}" ]]; then
	REMOTE_NAME="${REMOTE}";
fi

# Evaluate args
for i in "$@"
do
	case $i in
		-h|--help)
		SHOWUSAGE=true;
		shift
		;;
		--release-dir=*)
		SHIP_DIR="${i#*=}"
		if [ -d "$SHIP_DIR" ]; then
			SHIP_TO_DIR=true;
		else
			SHOWUSAGE=true;
			echo "${SEPARATOR}";
			echo "${bold}ERROR:${normal} release directory:";
			echo "  - ${SHIP_DIR}";
			echo "does not exist and I will not create it for you.";
			echo "${SEPARATOR}";
			echo;
		fi
		shift
		;;
		*)
		if [[ -z $TO_VERSION && $i =~ ^[1-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
			TO_VERSION="${i}";
		fi
		if [[ -z $TO_VERSION ]]; then
			SHOWUSAGE=true;
			echo "${SEPARATOR}";
			echo "${bold}ERROR:${normal} provide a version to prepare as in X.Y.Z";
			echo "Provided value ${i} does not comply"
			echo "${SEPARATOR}";
			echo;
		fi
		shift
		;;
	esac
done

# Show usage and exit
if [ $SHOWUSAGE = true ]; then
	echo "Usage: prepare-release.sh VERSION [--release-dir=PATH]";
	echo;
	echo "Params:";
	echo " VERSION:                REQUIRED. Version to release, semver format: X.Y.Z";
	echo;
	echo " --release-dir=PATH:     Optional. Path to unpack the release after making the release";
	echo;
	echo "Example: prepare-release.sh 3.1.5 --release-dir=../production";
	echo;
	echo "Shall you need to change the remote from where git fetches, you can do so";
	echo "by setting an env var REMOTE:";
	echo "REMOTE=someotherorigin prepare-release.sh 3.1.5"
	exit;
fi

FROM_VERSION=$(grep "Stable tag:" README.TXT | cut -d: -f 2 | xargs)

if [ -z "$FROM_VERSION" ]; then
	echo "${bold}ERROR: Could not parse previous version${normal}";
	echo "Make sure we have a properly set 'Stable tag' entry on README.TXT"
	exit 1;
fi

if [ "$FROM_VERSION" == "$TO_VERSION" ]; then
	echo "${bold}ERROR: Bump version '$TO_VERSION' is the same as current version '$FROM_VERSION'${normal}";
	echo "Try again.";
	exit 1;
fi

echo "${bold}Bumping Crowdsignal Forms version from '$FROM_VERSION' to '$TO_VERSION'${normal}";
echo;

if [ $SHIP_TO_DIR = true ]; then
	echo "${SEPARATOR}"
	echo "${bold}WARNING:${normal}";
	echo "${SEPARATOR}"
	echo "Release archive will be extracted to ${bold}${SHIP_DIR}${normal}";
	echo "For a clean release, the contents of ${SHIP_DIR} will be moved to /tmp/${FROM_VERSION} (just in case you need them)";
	echo "${SEPARATOR}";
	read -p "${bold}Are you sure? (y/n)? ${normal}" choice
	case "$choice" in
		y|Y ) echo;;
		n|N ) echo "Refused by user, aborting"; exit 1;;
		* )   echo "Invalid response, aborting"; exit 1;;
	esac
fi
echo;

# Get current branch
CURRENT_BRANCH=$(git branch | grep "*" | cut -d* -f 2 | xargs);
if [ $CURRENT_BRANCH != "master" ]; then
	echo "${SEPARATOR}"
	echo "${bold}WARNING:${normal}";
	echo "${SEPARATOR}"
	echo "You are not currently on the 'master' branch ($CURRENT_BRANCH). Ideally, releases are made from the 'master' branch."
	echo "${SEPARATOR}";
	read -p "${bold}Do you want to continue anyway? (y/n)? ${normal}" continue_on_stranded_branch
	case "$continue_on_stranded_branch" in
		y|Y ) echo;;
		n|N ) echo "Refused by user, aborting"; exit 1;;
		* )   echo "Invalid response, aborting"; exit 1;;
	esac
fi

# Pull tags just in case
echo "Fetching tags from ${REMOTE_NAME} ...";
`git fetch "${REMOTE_NAME}" --tags`
fetch_success=$?
if [[ ! $fetch_success -eq 0 ]]; then
	echo "${SEPARATOR}";
	echo "Error while fetching tags. Make sure you're in sync with remote. Maybe try:";
	echo "  - git fetch --tags --force";
	echo "Remember this would overwrite your local tags with those on remote";
	echo "${SEPARATOR}";
	exit 1;
fi

# Get changelog now, we'll use it later
CHANGELOG=$(git log $FROM_VERSION..HEAD --format='* %s');
if [[ -z $CHANGELOG ]]; then
	echo "${SEPARATOR}"
	echo "${bold}ERROR:${normal}";
	echo "${SEPARATOR}"
	echo "Changelog seems empty, the release would have no actual updates."
	echo "Check this manually by running:"
	echo " - ${bold}git log ${FROM_VERSION}..HEAD --oneline${normal}"
	echo;
	echo "${bold}Aborting${normal}";
	exit 1;
fi

# Create a release branch
git checkout -b v${TO_VERSION}
success=$?
if [[ ! $success -eq 0 ]]; then
	echo "${SEPARATOR}";
	echo "Error while checking out release branch !";
	echo "${SEPARATOR}";
	exit 1;
fi

# Update README file
sed -i.release_temp "s/Stable tag: .*/Stable tag: $TO_VERSION/" README.TXT
echo " - README.TXT updated";

# Update package.json file
sed -i.release_temp "s/version\": \".*\"/version\": \"$TO_VERSION\"/" package.json
echo " - package.json updated";

# Update changelog.txt file, and clean \r from output (caused by cat)
CHANGELOG_ENTRIES=$(echo -ne "= ${TO_VERSION} =\n${CHANGELOG}\n");
printf '%s\n\n%s\n' "${CHANGELOG_ENTRIES}" "$(cat changelog.txt)" > changelog.txt
sed -i.release_temp -e $'s/\r//' changelog.txt
echo " - changelog.txt updated with new entries";
echo;

# NOTE: this strings have an exact amount of spaces to match those on the plugin's main file
PLUGIN_OLD_VERSION="Version:           ${FROM_VERSION}";
PLUGIN_NEW_VERSION="Version:           ${TO_VERSION}";
sed -i.release_temp "s/${PLUGIN_OLD_VERSION}/${PLUGIN_NEW_VERSION}/" crowdsignal-forms.php

# More plugin loader replaces
DEFINE_VERSION_LINE="define( 'CROWDSIGNAL_FORMS_VERSION', '${TO_VERSION}' );"
sed -i.release_temp "s/define.*CROWDSIGNAL_FORMS_VERSION.*;\$/${DEFINE_VERSION_LINE}/" crowdsignal-forms.php
echo " - main loader file updated";

# Enqueued styles version update
sed -i.release_temp "s/wp_enqueue_style( \(.*\),\(.*\),\(.*\),\(.*\) );/wp_enqueue_style( \1,\2,\3, '${TO_VERSION}' );/" includes/admin/class-crowdsignal-forms-settings.php
sed -i.release_temp "s/wp_enqueue_style( \(.*\),\(.*\),\(.*\),\(.*\) );/wp_enqueue_style( \1,\2,\3, '${TO_VERSION}' );/" includes/admin/class-crowdsignal-forms-setup.php
echo " - enqueued styles version updated";

# Replace [next-version-number] placeholder with current release version
grep -rl "\[next-version-number\]" includes/* | xargs sed -i.release_temp "s/\[next-version-number\]/${TO_VERSION}/"


# Clean up
echo "Cleaning up .release_temp files..."
rm *.release_temp
find includes/ -type f -name "*.release_temp" -exec rm -f {} \;

echo;

# The actual release files
echo "Running 'make release'...";
success=$?
make release
if [[ ! $success -eq 0 ]]; then
	echo "${SEPARATOR}";
	echo "Error running 'make release'";
	echo "For proper clean up, run 'git reset --hard HEAD', checkout 'master' and delete the branch v${TO_VERSION}";
	echo "${SEPARATOR}";
	exit 1;
fi

if [ $SHIP_TO_DIR = true ]; then
	echo "Moving all files from ${SHIP_DIR} to /tmp/${FROM_VERSION}";
	# Remove and re-create temp directory for old version
	rm -rf "/tmp/${FROM_VERSION}";
	mkdir -p "/tmp/${FROM_VERSION}";
	mv "${SHIP_DIR%/}/"* "/tmp/${FROM_VERSION}";
	echo "Copying release to ${SHIP_DIR}";
	# Remove and re-create temp directory for new version
	rm -rf "/tmp/${TO_VERSION}"
	mkdir -p "/tmp/${TO_VERSION}";
	unzip -q "release/crowdsignal-forms.v${TO_VERSION}.zip" -d "/tmp/${TO_VERSION}"
	mv "/tmp/${TO_VERSION}/crowdsignal-forms/"* "${SHIP_DIR%/}"
fi

echo "${bold}Done!${normal}";
echo;
echo "${SEPARATOR}";
echo "Don't forget to:"
echo "${bold} - port entries on the changelog.txt file to README.TXT${normal}";
echo "${bold} - commit all the changes (including package-lock and translation files)${normal}";
echo "${bold} - push the branch to origin and put up a PR${normal}"
echo;
exit 0;
