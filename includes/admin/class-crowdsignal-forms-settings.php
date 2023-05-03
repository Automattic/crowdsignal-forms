<?php
/**
 * File containing the class Crowdsignal_Forms\Admin\Crowdsignal_Forms_Settings.
 *
 * @package Crowdsignal_Forms\Admin
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;
use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Notice_Icon;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;
use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles the management of plugin settings.
 *
 * @since 0.9.0
 */
class Crowdsignal_Forms_Settings {

	/**
	 * The step in the "Getting Started Process".
	 *
	 * @var int step.
	 */
	private $step = false;

	/**
	 * Our Settings.
	 *
	 * @var array Settings.
	 */
	protected $settings = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->settings_group = 'crowdsignal-forms';
		add_action( 'admin_init', array( $this, 'update_settings' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 12 );

		add_filter( 'crowdsignal_forms_show_admin_notice_' . Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP, array( $this, 'show_setup_notice' ) );
		add_filter( 'crowdsignal_forms_show_admin_notice_' . Crowdsignal_Forms_Admin_Notices::SETUP_SUCCESS, array( $this, 'show_setup_success' ) );
		Crowdsignal_Forms_Admin_Notices::add_notice( Crowdsignal_Forms_Admin_Notices::SETUP_SUCCESS );
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
		wp_enqueue_style( 'admin-styles', plugin_dir_url( __FILE__ ) . '/admin-styles.css', array(), '1.7.0' );
		wp_enqueue_script( 'videopress', 'https://videopress.com/videopress-iframe.js', array(), '1.0', false );
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
	 * Hides the "Getting Started" admin notice if the plugin is already connected to Crowdsignal.
	 *
	 * @param bool $show to show the notice or not.
	 */
	public function show_setup_notice( $show ) {
		$api_auth_provider = Crowdsignal_Forms::instance()->get_api_authenticator();
		if ( $api_auth_provider->get_user_code() ) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * Get Crowdsignal Settings
	 *
	 * @return array
	 */
	public function get_settings() {
		if ( 0 === count( $this->settings ) ) {
			$this->init_settings();
		}
		return $this->settings;
	}

	/**
	 * Initializes the configuration for the plugin's setting fields.
	 *
	 * @access protected
	 */
	protected function init_settings() {

		// we're all done, remove the notice.
		if ( 1 !== $this->step ) {
			Crowdsignal_Forms_Admin_Notices::remove_notice( Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP );
		}

		$this->settings = apply_filters(
			'crowdsignal_forms_settings',
			array(
				'general' => array(
					__( 'General', 'crowdsignal-forms' ),
					array(
						array(
							'name'       => 'crowdsignal_api_key',
							'std'        => '',
							'label'      => __( 'Enter Crowdsignal API Key', 'crowdsignal-forms' ),
							'attributes' => array(),
						),
					),
				),
			)
		);
	}

	/**
	 * Registers the plugin's settings with WordPress's Settings API.
	 */
	public function register_settings() {
		$this->init_settings();

		foreach ( $this->settings as $section ) {
			foreach ( $section[1] as $option ) {
				if ( isset( $option['std'] ) ) {
					add_option( $option['name'], $option['std'] );
				}
				register_setting( $this->settings_group, $option['name'] );
			}
		}
	}

	/**
	 * Disconnect from Crowdsignal if required.
	 */
	public function update_settings() {
		if ( ! isset( $_GET['page'] ) || 'crowdsignal-settings' !== $_GET['page'] ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- got_api_key check later
		$this->step = ! empty( $_GET['step'] ) ? absint( $_GET['step'] ) : 1;
		if ( isset( $_SERVER['REQUEST_METHOD'] ) && 'POST' === $_SERVER['REQUEST_METHOD'] ) {
			if ( 2 === $this->step && isset( $_POST['got_api_key'] ) && isset( $_POST['api_key'] ) && get_option( 'crowdsignal_api_key_secret' ) === $_POST['got_api_key'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_key = sanitize_key( wp_unslash( $_POST['api_key'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
				$api_auth_provider->set_api_key( $api_key );
				$api_auth_provider->get_user_code_for_key( $api_key );
				delete_option( 'crowdsignal_api_key_secret' );
				include dirname( __FILE__ ) . '/views/html-admin-setup-step-2.php';
				return;
			} else {
				$this->step = 1; // repeat the setup.
			}
		} elseif ( 1 === $this->step ) {
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
					$this->step = 3;
				} else {
					/**
					 * Cached API key may have been deleted on the server.
					 * Force reconnection.
					 */
					$api_auth_provider->delete_api_key();
				}
			}
		}

		if (
			isset( $_POST['action'] ) &&
			isset( $_POST['crowdsignal_api_key'] ) &&
			isset( $_POST['_wpnonce'] )
		) {
			$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();
			if ( 'update' === $_POST['action'] ) {
				if ( wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'add-api-key' ) ) {
					$api_key = sanitize_key( wp_unslash( $_POST['crowdsignal_api_key'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
					if ( ! empty( $api_key ) && $api_auth_provider->get_user_code_for_key( $api_key ) ) {
						$api_auth_provider->set_api_key( $api_key );

						wp_safe_redirect( admin_url( 'options-general.php?page=crowdsignal-settings&msg=api-key-added' ) );
					} else {
						wp_safe_redirect( admin_url( 'options-general.php?page=crowdsignal-settings&msg=api-key-not-added' ) );
					}
				} else {
					wp_safe_redirect( admin_url( 'options-general.php?page=crowdsignal-settings&msg=bad-nonce' ) );
				}
			} elseif ( 'disconnect' === $_POST['action'] ) {
				if ( ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'disconnect-api-key' ) ) {
					wp_safe_redirect( admin_url( 'options-general.php?page=crowdsignal-settings&msg=disconnect-failed' ) );
				} else {
					$api_auth_provider->delete_api_key();
					$api_auth_provider->delete_user_code();
					wp_safe_redirect( admin_url( 'options-general.php?page=crowdsignal-settings&msg=disconnected' ) );
				}
			}
		}
	}

	/**
	 * Shows the plugin's settings page.
	 */
	public function output() {
		$this->init_settings();

		$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();
		$api_key           = $api_auth_provider->get_api_key();
		$api_key_name      = get_option( Crowdsignal_Forms_Api_Authenticator::API_KEY_NAME );

		include dirname( __FILE__ ) . '/views/html-admin-setup-header.php';

		if ( ! $api_key ) {
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-1.php';
		} else {
			include dirname( __FILE__ ) . '/views/html-admin-settings.php';
			include dirname( __FILE__ ) . '/views/html-admin-setup-step-3.php';
			include dirname( __FILE__ ) . '/views/html-admin-dashboard-teaser.php';
		}

		include dirname( __FILE__ ) . '/views/html-admin-setup-footer.php';
	}
}
