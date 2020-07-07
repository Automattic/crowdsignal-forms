<?php
/**
 * File containing the class Crowdsignal_Forms_Setup.
 *
 * @package Crowdsignal_Forms\Admin
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles initial environment setup after plugin is first activated.
 *
 * @since 1.0.0
 */
class Crowdsignal_Forms_Setup {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_filter( 'crowdsignal_forms_show_admin_notice_' . Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP, array( $this, 'show_setup_notice' ) );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Input is used safely.
		if ( isset( $_GET['page'] ) && 'crowdsignal-setup' === $_GET['page'] ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 12 );
		}
	}

	/**
	 * Hides the "Getting Started" admin notice if the plugin is already connected to Crowdsignal.
	 *
	 * @param bool $show to show the notice or not.
	 */
	public function show_setup_notice( $show ) {
		$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();
		if ( $api_auth_provider->get_user_code() ) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Enqueues scripts for setup page.
	 *
	 * @todo for future use.
	 */
	public function admin_enqueue_scripts() {
	}

	/**
	 * Handle request to the setup page.
	 */
	public function setup_page() {

		$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- got_api_key check later
		$step = ! empty( $_GET['step'] ) ? absint( $_GET['step'] ) : 1;
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			if ( 2 === $step && isset( $_POST['got_api_key'] ) && isset( $_POST['api_key'] ) && get_option( 'crowdsignal_api_key_secret' ) === $_POST['got_api_key'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_key = sanitize_key( wp_unslash( $_POST['api_key'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_auth_provider->set_api_key( $api_key );
				$api_auth_provider->get_user_code_for_key( $api_key );
				delete_option( 'crowdsignal_api_key_secret' );
			} else {
				$step = 1; // repeat the setup.
			}
		} elseif ( 1 === $step ) {
			update_option( 'crowdsignal_api_key_secret', md5( time() . wp_rand() ) );

			$existing_api_key = $api_auth_provider->get_api_key();
			if ( ! $existing_api_key ) {
				$existing_api_key = get_option( 'polldaddy_api_key' );
				$api_auth_provider->set_api_key( $existing_api_key );
			}

			if ( $existing_api_key ) {
				$existing_user_code = $api_auth_provider->get_user_code_for_key( $existing_api_key );

				if ( $existing_user_code ) {
					if ( $api_auth_provider->get_user_code() !== $existing_user_code ) {
						$api_auth_provider->set_user_code( $existing_user_code );
					}
					delete_option( 'crowdsignal_api_key_secret' );
					$step = 3;
				} else {
					/**
					 * Cached API key may have been deleted on the server.
					 * Force reconnection.
					 */
					$api_auth_provider->delete_api_key();
				}
			}
		}

		// we're all done, remove the notice.
		if ( 1 !== $step ) {
			Crowdsignal_Forms_Admin_Notices::remove_notice( Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP );
		}

		$this->output( $step );
	}

	/**
	 * Displays setup page.
	 *
	 * @param int $step the step shown to the user.
	 */
	public function output( $step ) {
		include dirname( __FILE__ ) . '/views/html-admin-setup-header.php';
		if ( 1 === $step ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-1.php';
		} elseif ( 2 === $step ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-2.php';
		} elseif ( 3 === $step ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-3.php';
		}
		include dirname( __FILE__ ) . '/views/html-admin-setup-footer.php';
	}
}