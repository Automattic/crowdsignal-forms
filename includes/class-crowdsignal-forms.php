<?php
/**
 * File containing the class \Crowdsignal_Forms\Crowdsignal_Forms.
 *
 * @package Crowdsignal_Forms
 * @since   1.0.0
 */

namespace Crowdsignal_Forms;

use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets;
use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks;
use Crowdsignal_Forms\Gateways\Api_Gateway_Interface;
use Crowdsignal_Forms\Gateways\Api_Gateway;
use Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway;
use Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller;
use Crowdsignal_Forms\Rest_Api\Controllers\Account_Controller;
use Crowdsignal_Forms\Admin\Admin_Hooks;
use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

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
	 * The plugin dir.
	 *
	 * @var string
	 */
	private $plugin_dir;

	/**
	 * The plugin url.
	 *
	 * @var string
	 */
	private $plugin_url;

	/**
	 * Blocks registry.
	 *
	 * @var Crowdsignal_Forms_Blocks
	 */
	private $blocks;

	/**
	 * The polls controller.
	 *
	 * @var Polls_Controller
	 */
	public $rest_api_polls_controller;

	/**
	 * The api gateway.
	 *
	 * @var Api_Gateway_Interface
	 */
	private $api_gateway = null;

	/**
	 * The admin hooks instance.
	 *
	 * @var Admin_Hooks
	 */
	private $admin_hooks;

	/**
	 * For saving/updating poll data from the api into post meta.
	 *
	 * @since 1.0.0
	 * @var Post_Poll_Meta_Gateway
	 */
	private $post_poll_meta_gateway = null;

	/**
	 * For account actions.
	 *
	 * @since 1.0.0
	 * @var Account_Controller
	 */
	private $rest_api_account_controller;
	/**
	 * Registers the block assets needed.
	 *
	 * @since 1.0.0
	 * @var Crowdsignal_Forms_Blocks_Assets
	 */
	private $blocks_assets;

	/**
	 * Initialize the singleton instance.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		$this->plugin_dir = dirname( __DIR__ );
		$this->plugin_url = untrailingslashit( plugins_url( '', CROWDSIGNAL_FORMS_PLUGIN_BASENAME ) );

		add_action( 'admin_init', array( $this, 'activate_redirect' ) );
		register_deactivation_hook( CROWDSIGNAL_FORMS_PLUGIN_FILE, array( $this, 'deactivation' ) );
		register_activation_hook( CROWDSIGNAL_FORMS_PLUGIN_FILE, array( $this, 'activate' ) );
	}

	/**
	 * Fetches an instance of the class.
	 *
	 * @return self
	 */
	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Run when plugin is activated
	 *
	 * @since 1.0.0
	 */
	public function activate() {
		Crowdsignal_Forms_Admin_Notices::add_notice( Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP );
		add_option( 'crowdsignal_forms_do_activation_redirect', true );
	}

	/**
	 * Performs a redirect to the getting started page.
	 *
	 * @since 1.0.0
	 */
	public function activate_redirect() {
		if ( get_option( 'crowdsignal_forms_do_activation_redirect', false ) ) {
			delete_option( 'crowdsignal_forms_do_activation_redirect' );
			wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-setup' ) );
			exit();
		}
	}

	/**
	 * Clean up on deactivation.
	 *
	 * @since 1.0.0
	 */
	public function deactivation() {
	}

	/**
	 * Includes all php files needed and sets all the objects this class will use for initializing.
	 *
	 * @since 1.0.0
	 *
	 * @return $this
	 */
	public function bootstrap() {
		$this->blocks                      = new Crowdsignal_Forms_Blocks();
		$this->blocks_assets               = new Crowdsignal_Forms_Blocks_Assets();
		$this->rest_api_polls_controller   = new Polls_Controller();
		$this->rest_api_account_controller = new Account_Controller();
		$this->admin_hooks                 = new Admin_Hooks();

		return $this;
	}


	/**
	 * Setup all filters and hooks. For frontend and optionally, admin.
	 *
	 * @param bool $init_all Pass in `true` to load and initialize both frontend and admin functionality. `false` by default.
	 *
	 * @return $this
	 */
	public function setup_hooks( $init_all = false ) {
		add_action( 'init', array( $this->blocks_assets, 'register' ) );
		add_action( 'init', array( $this->blocks, 'register' ) );
		add_action( 'rest_api_init', array( $this, 'register_rest_api_routes' ) );

		add_filter( 'crowdsignal_forms_api_request_headers', array( $this, 'add_auth_request_headers' ) );

		$this->admin_hooks->hook();

		return $this;
	}

	/**
	 * Registers all REST api routes.
	 *
	 * @since 1.0.0
	 */
	public function register_rest_api_routes() {
		$this->rest_api_polls_controller->register_routes();
		$this->rest_api_account_controller->register_routes();

		/**
		 * Any additional controllers from companion plugins can be registered using this hook.
		 *
		 * @param object $this This plugin's bootstrap instance.
		 * @since 1.0.0
		 */
		do_action( 'crowdsignal_forms_register_rest_api_routes', $this );
	}

	/**
	 * Initializes the class and adds all filters and actions.
	 *
	 * @since 1.0.0
	 *
	 * @param bool $init_all Pass in `true` to load and initialize both frontend and admin functionality. `false` by default.
	 *
	 * @return self
	 */
	public static function init( $init_all = false ) {
		return self::instance()->bootstrap()->setup_hooks( $init_all );
	}

	/**
	 * Get the plugin dir.
	 *
	 * @since 1.0.0
	 *
	 * @return string
	 */
	public function get_plugin_dir() {
		return $this->plugin_dir;
	}

	/**
	 * Get the api gateway.
	 *
	 * @return Api_Gateway_Interface
	 */
	public function get_api_gateway() {
		if ( null === $this->api_gateway ) {
			$this->api_gateway = new Api_Gateway();
		}

		return $this->api_gateway;
	}


	/**
	 * Set the api gateway.
	 *
	 * @param Api_Gateway_Interface $gateway The gateway.
	 *
	 * @return $this
	 */
	public function set_api_gateway( $gateway ) {
		$this->api_gateway = $gateway;
		return $this;
	}

	/**
	 * Add API key and usercode to the API request headers.
	 *
	 * @param array $headers Any existing header values.
	 *
	 * @return $headers array the modified array.
	 */
	public function add_auth_request_headers( $headers ) {
		$cs_authenticator = new Crowdsignal_Forms_Api_Authenticator();

		$user_code = $cs_authenticator->get_user_code();

		if ( ! empty( $user_code ) ) {
			$headers['x-api-partner-guid'] = $cs_authenticator->get_api_key();
			$headers['x-api-user-code']    = $user_code;
		}

		return $headers;
	}

	/**
	 * Get the api gateway.
	 *
	 * @return Post_Poll_Meta_Gateway
	 */
	public function get_post_poll_meta_gateway() {
		if ( null === $this->post_poll_meta_gateway ) {
			$this->post_poll_meta_gateway = new Post_Poll_Meta_Gateway();
		}

		return $this->post_poll_meta_gateway;
	}

	/**
	 * Set the api gateway.
	 *
	 * @param Post_Poll_Meta_Gateway $gateway The gateway.
	 *
	 * @return $this
	 */
	public function set_post_poll_meta_gateway( $gateway ) {
		$this->post_poll_meta_gateway = $gateway;
		return $this;
	}
}
