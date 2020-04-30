#!/bin/bash

if $(wp --allow-root core is-installed); then
	echo
	echo "WordPress has already been installed. Uninstall it first by running:"
	echo
	echo "  make docker_uninstall"
	echo
	exit 1;
fi

# Install WP core
wp --allow-root core install \
	--url=${WP_DOMAIN} \
	--title="${WP_TITLE}" \
	--admin_user=${WP_ADMIN_USER} \
	--admin_password=${WP_ADMIN_PASSWORD} \
	--admin_email=${WP_ADMIN_EMAIL} \
	--skip-email

# Discourage search engines from indexing. Can be changed via UI in Settings->Reading.
wp --allow-root option update blog_public 0

# Install Query Monitor plugin
# https://wordpress.org/plugins/query-monitor/
wp --allow-root plugin install query-monitor --activate

# Activate Crowdsignal Forms
wp --allow-root plugin activate crowdsignal-forms

echo
echo "WordPress installed. Open ${WP_DOMAIN}"
echo
