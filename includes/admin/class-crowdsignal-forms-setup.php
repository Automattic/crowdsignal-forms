<?php
/**
 * File containing the class Crowdsignal_Forms_Setup.
 *
 * @package Crowdsignal_Forms\Admin
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;
use Crowdsignal_Forms\Auth;

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
		// TODO: get usercode through authenticator.
		if ( get_option( 'crowdsignal_user_code' ) ) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Enqueues scripts for setup page.
	 */
	public function admin_enqueue_scripts() {
	}

	/**
	 * Handle request to the setup page.
	 */
	public function setup_page() {

		$api_auth_provider = new \Crowdsignal_Forms_Api_Authenticator();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- got_api_key check later
		$step = ! empty( $_GET['step'] ) ? absint( $_GET['step'] ) : 1;
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			if ( 2 === $step && isset( $_POST['got_api_key'] ) && isset( $_POST['api_key'] ) && get_option( 'crowdsignal_api_key_secret' ) === $_POST['got_api_key'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_key = sanitize_key( wp_unslash( $_POST['api_key'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_auth_provider->get_user_code_for_key( $api_key );
				delete_option( 'crowdsignal_api_key_secret' );
			} else {
				$step = 1; // repeat the setup.
			}
		} elseif ( 1 === $step ) {
			update_option( 'crowdsignal_api_key_secret', md5( time() . wp_rand() ) );

			$existing_user_code = 0;
			if ( $api_auth_provider->get_user_code() ) {
				$existing_user_code = $api_auth_provider->get_user_code();
			} elseif ( get_option( 'pd-usercode-' . wp_get_current_user()->ID ) ) {
				$existing_user_code = get_option( 'pd-usercode-' . wp_get_current_user()->ID );
			} else {
				$blogusers = get_users( array( 'fields' => array( 'ID' ) ) );
				foreach ( $blogusers as $user ) {
					if ( get_option( 'pd-usercode-' . $user->ID ) ) {
						$existing_user_code = get_option( 'pd-usercode-' . $user->ID );
						break;
					}
				}
			}

			if ( $existing_user_code ) {
				if ( $api_auth_provider->get_user_code() !== $existing_user_code ) {
					$api_auth_provider->set_user_code( $existing_user_code );
				}
				$step = 3;
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
