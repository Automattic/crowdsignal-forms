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
		$settings_page_title = 'Crowdsignal';
		$hook = add_options_page( $settings_page_title, $settings_page_title, 'manage_options', 'crowdsignal-forms-settings', array( $this->settings_page, 'output' ) );
		add_action( "load-$hook", array( $this->settings_page, 'update_settings' ) );

		$settings_page_title = 'Get Started with Crowdsignal';
		$hook = add_options_page( $settings_page_title, $settings_page_title, 'manage_options', 'crowdsignal-forms-setup', array( $this->setup_page, 'output' ) );
		add_action( "load-$hook", array( $this->setup_page, 'setup_page' ) );
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
				sprintf( '<a href="%s">' . __( 'Getting Started', 'crowdsignal-forms' ) . '</a>', admin_url( 'admin.php?page=crowdsignal-forms-setup' ) ),
				sprintf( '<a href="%s">' . __( 'Settings', 'crowdsignal-forms' ) . '</a>', admin_url( 'admin.php?page=crowdsignal-forms-settings' ) ),
			),
			$links
		);
	}
}
