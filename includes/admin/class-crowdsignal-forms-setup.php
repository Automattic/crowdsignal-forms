<?php
/**
 * File containing the class Crowdsignal_Forms_Setup.
 *
 * @package Crowdsignal_Forms\Admin
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;
use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Notice_Icon;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles initial environment setup after plugin is first activated.
 *
 * @since 0.9.0
 */
class Crowdsignal_Forms_Setup {

	private $step = false;

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_filter( 'crowdsignal_forms_show_admin_notice_' . Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP, array( $this, 'show_setup_notice' ) );
		add_filter( 'crowdsignal_forms_show_admin_notice_' . Crowdsignal_Forms_Admin_Notices::SETUP_SUCCESS, array( $this, 'show_setup_success' ) );
		Crowdsignal_Forms_Admin_Notices::add_notice( Crowdsignal_Forms_Admin_Notices::SETUP_SUCCESS );

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Input is used safely.
		if ( isset( $_GET['page'] ) && 'crowdsignal-forms-setup' === $_GET['page'] ) {
			add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 12 );
		}
	}

	/**
	 * Hides the "Getting Started" admin notice if the plugin is already connected to Crowdsignal.
	 *
	 * @param bool $show to show the notice or not.
	 */
	public function show_setup_notice( $show ) {
		$api_authenticator = Crowdsignal_Forms::instance()->get_api_authenticator();
		if ( $api_authenticator->get_user_code() ) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Filter admin notice if the plugin has just finished step 3 successfully.
	 *
	 * @param bool $show to show the notice or not.
	 */
	public function show_setup_success( $show ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- readonly, boolean check
		return isset( $_GET['msg'] ) && 'connect' === $_GET['msg'];
	}

	/**
	 * Enqueues scripts for setup page.
	 */
	public function admin_enqueue_scripts() {
		wp_enqueue_style( 'admin-styles', plugin_dir_url( __FILE__ ) . '/admin-styles.css', array(), '1.7.2' );
		wp_enqueue_script( 'videopress', 'https://videopress.com/videopress-iframe.js', array(), '1.0', false );
	}

	/**
	 * Handle request to the setup page.
	 */
	public function setup_page() {

		$api_authenticator = Crowdsignal_Forms::instance()->get_api_authenticator();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- got_api_key check later
		$this->step = ! empty( $_GET['step'] ) ? absint( $_GET['step'] ) : 1;
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			if ( 2 === $this->step && isset( $_POST['got_api_key'] ) && isset( $_POST['api_key'] ) && get_option( 'crowdsignal_api_key_secret' ) === $_POST['got_api_key'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_key = sanitize_key( wp_unslash( $_POST['api_key'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_authenticator->set_api_key( $api_key );
				$api_authenticator->get_user_code_for_key( $api_key );
				delete_option( 'crowdsignal_api_key_secret' );
			} else {
				$this->step = 1; // repeat the setup.
			}
		} elseif ( 1 === $this->step ) {
			update_option( 'crowdsignal_api_key_secret', md5( time() . wp_rand() ) );

			$existing_api_key = $api_authenticator->get_api_key();
			if ( ! $existing_api_key ) {
				$existing_api_key = get_option( 'polldaddy_api_key' );
				$api_authenticator->set_api_key( $existing_api_key );
			}

			if ( $existing_api_key ) {
				$existing_user_code = $api_authenticator->get_user_code_for_key( $existing_api_key );

				if ( $existing_user_code ) {
					if ( $api_authenticator->get_user_code() !== $existing_user_code ) {
						$api_authenticator->set_user_code( $existing_user_code );
					}
					delete_option( 'crowdsignal_api_key_secret' );
					$this->step = 3;
				} else {
					/**
					 * Cached API key may have been deleted on the server.
					 * Force reconnection.
					 */
					$api_authenticator->delete_api_key();
				}
			}
		}

		// we're all done, remove the notice.
		if ( 1 !== $this->step ) {
			Crowdsignal_Forms_Admin_Notices::remove_notice( Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP );
		}
	}

	/**
	 * Convenience method to get the icon markup from the Notice_Icon helper class
	 *
	 * @param string $icon The icon type: warning|success.
	 */
	public static function get_icon( $icon ) {
		switch ( $icon ) {
			case 'warning':
				return Crowdsignal_Forms_Notice_Icon::warning();
			case 'success':
				return Crowdsignal_Forms_Notice_Icon::success();
			default:
				return '';
		}
	}

	/**
	 * Displays setup page.
	 */
	public function output() {

		if ( false === $this->step ) {
			$this->setup_page();
		}
		include dirname( __FILE__ ) . '/views/html-admin-setup-header.php';
		if ( 1 === $this->step ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-1.php';
		} elseif ( 2 === $this->step ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-2.php';
		} elseif ( 3 === $this->step ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-3.php';
		}
		include dirname( __FILE__ ) . '/views/html-admin-setup-footer.php';
	}
}
