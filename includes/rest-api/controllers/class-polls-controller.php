<?php
/**
 * Contains the Polls Controller Class
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
 * Polls Controller Class
 *
 * @since 1.0.0
 **/
class Polls_Controller {
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
	protected $rest_base = 'polls';

	/**
	 * Register the routes for manipulating polls
	 *
	 * @since 1.0.0
	 **/
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_polls' ),
					'permission_callback' => array( $this, 'get_polls_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
			)
		);
	}

	/**
	 * Get the polls.
	 *
	 * @since 1.0.0
	 *
	 * @return \WP_REST_Response
	 **/
	public function get_polls() {
		return rest_ensure_response( Crowdsignal_Forms::instance()->get_api_gateway()->get_polls() );
	}

	/**
	 * The permission check.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 **/
	public function get_polls_permissions_check() {
		return true;
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
}
