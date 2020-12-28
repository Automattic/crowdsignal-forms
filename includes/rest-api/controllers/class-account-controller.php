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
			'/' . $this->rest_base . '/info',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_cs_account_info' ),
					'permission_callback' => array( $this, 'get_account_permissions_check' ),
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
	 * Gets the state of the Crowdsignal connection.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function is_cs_connected() {
		if ( defined( 'IS_WPCOM' ) && true === constant( 'IS_WPCOM' ) ) {
			return rest_ensure_response( 'connected' );
		}

		$api_auth_provider = Crowdsignal_Forms::instance()->get_api_authenticator();
		$user_code         = $api_auth_provider->get_user_code();

		if ( empty( $user_code ) ) {
			return rest_ensure_response( 'not-connected' );
		}

		$is_verified = Crowdsignal_Forms::instance()->get_api_gateway()->get_is_user_verified();
		if ( is_wp_error( $is_verified ) ) {
			return rest_ensure_response( $is_verified );
		}

		$res = $is_verified ? 'connected' : 'not-verified';
		return rest_ensure_response( $res );
	}

	/**
	 * Gets a summary of the Crowdsignal account for the user.
	 *
	 * @since 1.3.5
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_cs_account_info() {
		$summary = Crowdsignal_Forms::instance()->get_api_gateway()->get_account_info();
		return rest_ensure_response( $summary );
	}
}
