<?php
/**
 * Contains the Account Controller Class
 *
 * @since 0.9.0
 * @package Crowdsignal_Forms\Rest_Api
 **/

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Account Controller Class
 *
 * @since 0.9.0
 **/
class Account_Controller {
	/**
	 * The namespace.
	 *
	 * @var string
	 **/
	protected $namespace = 'crowdsignal-forms/v1';

	/**
	 * The rest api base.
	 *
	 * @var string
	 **/
	protected $rest_base = 'account';

	/**
	 * Register the routes for account data
	 *
	 * @since 0.9.0
	 **/
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/capabilities',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_capabilities' ),
					'permission_callback' => array( $this, 'get_account_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/connected',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'is_cs_connected' ),
					'permission_callback' => array( $this, 'get_account_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Gets the collection params.
	 *
	 * @since 0.9.0
	 * @return array
	 */
	protected function get_collection_params() {
		return array();
	}

	/**
	 * Get the capabilities for the account.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response|\WP_Error
	 **/
	public function get_capabilities( $request ) {
		$capabilities = Crowdsignal_Forms::instance()->get_api_gateway()->get_capabilities();
		if ( is_wp_error( $capabilities ) ) {
			return rest_ensure_response( $capabilities );
		}

		return rest_ensure_response( $capabilities );
	}

	/**
	 * The permission check for retrieving account info.
	 *
	 * @since 0.9.0
	 *
	 * @return bool
	 **/
	public function get_account_permissions_check() {
		return current_user_can( 'publish_posts' );
	}

	/**
	 * Gets the enabled state of the Crowdsignal connection.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function is_cs_connected() {
		if ( defined( 'IS_WPCOM' ) && true === constant( 'IS_WPCOM' ) ) {
			return true;
		}

		$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();
		$user_code         = $api_auth_provider->get_user_code();

		return rest_ensure_response( ! empty( $user_code ) );
	}
}
