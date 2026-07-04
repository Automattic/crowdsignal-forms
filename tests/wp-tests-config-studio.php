<?php
/**
 * WordPress test config for Studio (SQLite) environment.
 *
 * Experiment: run PHPUnit against WordPress Studio's SQLite-backed
 * WordPress installation instead of requiring Docker + MySQL.
 *
 * Usage:
 *   WP_TESTS_CONFIG_FILE_PATH=tests/wp-tests-config-studio.php \
 *   WP_TESTS_DIR=docker/wordpress-develop/tests/phpunit \
 *   /opt/homebrew/bin/php vendor/bin/phpunit --configuration phpunit.xml
 */

/* Path to the Studio WordPress installation. */
define( 'ABSPATH', '/Users/donncha/Studio/my-wordpress-website/' );

define( 'WP_DEFAULT_THEME', 'default' );

// Debug settings.
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'CONCATENATE_SCRIPTS', false );
define( 'SCRIPT_DEBUG', true );
define( 'SAVEQUERIES', true );

@error_reporting( E_ALL );
@ini_set( 'log_errors', true );
@ini_set( 'log_errors_max_len', '0' );

/*
 * Database settings — dummy values.
 * The SQLite db.php drop-in in wp-content intercepts all $wpdb calls,
 * so these are never actually used for a connection.
 */
define( 'DB_NAME', 'wordpress_test' );
define( 'DB_USER', 'root' );
define( 'DB_PASSWORD', '' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

/* Authentication keys — test-only values. */
define( 'AUTH_KEY', 'studio-test-auth-key' );
define( 'SECURE_AUTH_KEY', 'studio-test-secure-auth-key' );
define( 'LOGGED_IN_KEY', 'studio-test-logged-in-key' );
define( 'NONCE_KEY', 'studio-test-nonce-key' );
define( 'AUTH_SALT', 'studio-test-auth-salt' );
define( 'SECURE_AUTH_SALT', 'studio-test-secure-auth-salt' );
define( 'LOGGED_IN_SALT', 'studio-test-logged-in-salt' );
define( 'NONCE_SALT', 'studio-test-nonce-salt' );

/* Use a separate table prefix so we don't touch Studio's wp_ tables. */
$table_prefix = 'wptests_';

define( 'WP_TESTS_DOMAIN', 'example.org' );
define( 'WP_TESTS_EMAIL', 'admin@example.org' );
define( 'WP_TESTS_TITLE', 'Test Blog' );

define( 'WP_PHP_BINARY', '/opt/homebrew/bin/php' );

define( 'WPLANG', '' );
