<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, consider the following flow
 * of control:
 *
 * - This method should be static
 * - Check if the $_REQUEST content actually is the plugin name
 * - Run an admin referrer check to make sure it goes through authentication
 * - Verify the output of $_GET makes sense
 * - Repeat with other user roles. Best directly by using the links/query string parameters.
 * - Repeat things for multisite. Once for a single site in the network, once sitewide.
 *
 * This file may be updated more in future version of the Boilerplate; however, this is the
 * general skeleton and outline for how the file should work.
 *
 * For more information, see the following discussion:
 * https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/pull/123#issuecomment-28541913
 *
 * @link       http://example.com
 * @since      0.9.0
 *
 * @package    Crowdsignal_Forms
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Registry table system removed - no custom tables to drop

// Delete all options
delete_option( 'crowdsignal_forms_api_key' );
delete_option( 'crowdsignal_forms_user_code' );
delete_option( 'crowdsignal_forms_do_activation_redirect' );
delete_option( 'crowdsignal_forms_admin_notices' );
delete_option( 'crowdsignal_forms_items_table_version' );
delete_option( 'crowdsignal_forms_items_migration_version' );
