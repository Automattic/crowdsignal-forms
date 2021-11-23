<?php
/**
 * File containing the class Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin.
 *
 * @package Crowdsignal_Forms\Admin
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Setup;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles front admin page for Crowdsignal.
 *
 * @since 0.9.0
 */
class Crowdsignal_Forms_Admin {

	/**
	 * The settings class.
	 *
	 * @var Crowdsignal_Forms_Settings
	 * @since  0.9.0
	 */
	private $settings_page = null;

	/**
	 * The setup page
	 *
	 * @var Crowdsignal_Admin
	 */
	private $setup_page = null;

	/**
	 * Constructor.
	 */
	public function __construct() {

		$this->setup_page    = new Crowdsignal_Forms_Setup();
		$this->settings_page = new Crowdsignal_Forms_Settings();
	}

	/**
	 * Set up actions during admin initialization.
	 *
	 * @todo for future use
	 */
	public function admin_init() {
		add_filter( 'plugin_action_links_' . plugin_basename( CROWDSIGNAL_FORMS_PLUGIN_FILE ), array( $this, 'plugin_action_links' ) );
	}

	/**
	 * Enqueues CSS and JS assets.
	 *
	 * @todo for future use
	 */
	public function admin_enqueue_scripts() {
	}

	/**
	 * Adds pages to admin menu.
	 */
	public function admin_menu() {
		if (
			isset( $_GET['page'] )
			&& ( 'crowdsignal-forms-settings' === $_GET['page'] || 'crowdsignal-forms-setup' === $_GET['page'] )
		) {
			wp_safe_redirect( admin_url( 'options-general.php?page=crowdsignal-settings' ) );
			die();
		}

		if ( ! is_plugin_active( 'polldaddy/polldaddy.php' ) ) {
			// Add settings pages.
			add_options_page( 'Crowdsignal', 'Crowdsignal', 'manage_options', 'crowdsignal-settings', array( $this->settings_page, 'output' ) );
		}
	}

	/**
	 * Adds to the Action links in the plugin page.
	 *
	 * @param array $links
	 * @return array
	 */
	public function plugin_action_links( $links ) {
		return array_merge(
			array(
				sprintf( '<a href="%s">' . __( 'Settings', 'crowdsignal-forms' ) . '</a>', admin_url( 'options-general.php?page=crowdsignal-settings' ) ),
			),
			$links
		);
	}
}
