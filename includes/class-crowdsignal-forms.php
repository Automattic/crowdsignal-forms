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
use Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller;
use Crowdsignal_Forms\Admin\Admin_Hooks;

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
	private $api_gateway;

	/**
	 * The admin hooks instance.
	 *
	 * @var Admin_Hooks
	 */
	private $admin_hooks;

	/**
	 * Initialize the singleton instance.
	 *
	 * @since 1.0.0
	 */
	private function __construct() {
		$this->plugin_dir = dirname( __DIR__ );
		$this->plugin_url = untrailingslashit( plugins_url( '', CROWDSIGNAL_FORMS_PLUGIN_BASENAME ) );

		register_deactivation_hook( CROWDSIGNAL_FORMS_PLUGIN_FILE, array( $this, 'deactivation' ) );
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
		$this->blocks                    = new Crowdsignal_Forms_Blocks();
		$this->blocks_assets             = new Crowdsignal_Forms_Blocks_Assets();
		$this->rest_api_polls_controller = new Polls_Controller();
		$this->admin_hooks               = new Admin_Hooks();

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
			// This is temporary, normally we will be instantiating the actual gateway here.
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
}
