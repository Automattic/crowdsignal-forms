<?php
/**
 * Contains the Account Controller Class
 *
 * @since 1.0.0
 * @package Crowdsignal_Forms\Rest_Api
 **/

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Account Controller Class
 *
 * @since 1.0.0
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
	 * @since 1.0.0
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
	}

	/**
	 * Gets the collection params.
	 *
	 * @since 1.0.0
	 * @return array
	 */
	protected function get_collection_params() {
		return array();
	}

	/**
	 * Get the capabilities for the account.
	 *
	 * @since 1.0.0
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
	 * @since 1.0.0
	 *
	 * @return bool
	 **/
	public function get_account_permissions_check() {
		return current_user_can( 'publish_posts' );
	}
}
