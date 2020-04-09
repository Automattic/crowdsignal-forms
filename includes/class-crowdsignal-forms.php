<?php

/**
 * File containing the class \Sensei_WC_Paid_Courses\Sensei_WC_Paid_Courses.
 *
 * @package sensei-wc-paid-courses
 * @since   1.0.0
 */

namespace Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Crowdsignal Forms class.
 *
 * @class Crowdsignal_Forms
 */
final class Crowdsignal_Forms {
	/**
	 * Instance of class.
	 *
	 * @var Crowdsignal_Forms
	 */
	private static $instance;

	/**
	 * Initialize the singleton instance.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		$this->plugin_dir          = dirname( __DIR__ );
		$this->plugin_url          = untrailingslashit( plugins_url( '', CROWDSIGNAL_FORMS_PLUGIN_BASENAME ) );

		register_deactivation_hook( CROWDSIGNAL_FORMS_PLUGIN_FILE, [ $this, 'deactivation' ] );
	}

	/**
	 * Fetches an instance of the class.
	 * @return self
	 */
	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
		* Clean up on deactivation.
		*
		* @since 1.0.0
		*/
	public function deactivation() {
	}

	/**
	 * Initializes the class and adds all filters and actions.
	 *
	 * @since 1.0.0
	 *
	 * @param bool $init_all Pass in `true` to load and initialize both frontend and admin functionality. `false` by default.
	 */
	public static function init( $init_all = false ) {
	}
}
