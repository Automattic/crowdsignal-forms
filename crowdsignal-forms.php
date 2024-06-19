<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://automattic.com
 * @since             0.9.0
 * @package           Crowdsignal_Forms
 *
 * @wordpress-plugin
 * Plugin Name:       Crowdsignal Forms
 * Plugin URI:        https://crowdsignal.com/crowdsignal-forms/
 * Description:       Crowdsignal Form Blocks
 * Version:           1.7.2
 * Author:            Automattic
 * Author URI:        https://automattic.com/
 * License:           GPL-2.0+
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       crowdsignal-forms
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

define( 'CROWDSIGNAL_FORMS_VERSION', '1.7.2' );
define( 'CROWDSIGNAL_FORMS_PLUGIN_FILE', __FILE__ );
define( 'CROWDSIGNAL_FORMS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

$crowdsignal_forms_plugin_dir = dirname( __FILE__ );

require_once $crowdsignal_forms_plugin_dir . '/includes/class-autoloader.php';

Crowdsignal_Forms\Autoloader::get_instance()
	->set_plugin_dir( $crowdsignal_forms_plugin_dir )
	->register();

Crowdsignal_Forms\Crowdsignal_Forms::init();
