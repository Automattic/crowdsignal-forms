<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              http://automattic.com
 * @since             1.0.0
 * @package           Crowdsignal_Forms
 *
 * @wordpress-plugin
 * Plugin Name:       Crowdsignal Forms
 * Plugin URI:        http://example.com/plugin-name-uri/
 * Description:       Crowdsignal Form Blocks
 * Version:           1.0.0
 * Author:            Automattic
 * Author URI:        http://automattic.com/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       crowdsignal-forms
 * Domain Path:       /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

define( 'CROWDSIGNAL_FORMS_VERSION', '1.0.0' );
define( 'CROWDSIGNAL_FORMS_PLUGIN_FILE', __FILE__ );
define( 'CROWDSIGNAL_FORMS_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once dirname( __FILE__ ) . '/vendor/autoload.php';

Crowdsignal_Forms\Crowdsignal_Forms::init();

