<?php
/**
 * Contains the NPS Controller Class
 *
 * @since 1.4.0
 * @package Crowdsignal_Forms\Rest_Api
 */

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Nps_Survey;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * NPS Controller Class
 *
 * @since 1.4.0
 */
class Nps_Controller {
	/**
	 * The namespace
	 *
	 * @var string
	 */
	protected $namespace = 'crowdsignal-forms/v1';

	/**
	 * The rest api base.
	 *
	 * @var string
	 */
	protected $rest_base = 'nps';

	/**
	 * Register the routes for manipulating NPS blocks
	 *
	 * @since 1.4.0
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'upsert_nps' ),
					'permission_callback' => array( $this, 'create_or_update_nps_permissions_check' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<survey_id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upsert_nps' ),
					'permission_callback' => array( $this, 'create_or_update_nps_permissions_check' ),
					'args'                => $this->get_nps_fetch_params(),
				),
			)
		);
	}

	/**
	 * Updates an NPS Survey. Creates one if no ID is given.
	 *
	 * @since 1.4.0
	 *
	 * @param  \WP_REST_Request $request The API Request.
	 * @return \WP_REST_RESPONSE|WP_Error
	 */
	public function upsert_nps( \WP_REST_Request $request ) {
		$data   = $request->get_json_params();
		$survey = Nps_Survey::from_block_attributes( $data );

		$result = Crowdsignal_Forms::instance()->get_api_gateway()->update_nps( $survey );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result->to_block_attributes() );
	}

	/**
	 * The permission check for creating a new poll.
	 *
	 * @since 1.4.0
	 *
	 * @return bool
	 */
	public function create_or_update_nps_permissions_check() {
		return current_user_can( 'publish_posts' );
	}

	/**
	 * Returns a validator array for the NPS endpoints params.
	 *
	 * @since 1.4.0
	 * @see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
	 *
	 * @return array
	 */
	protected function get_nps_fetch_params() {
		return array(
			'survey_id' => array(
				'validate_callback' => function ( $param, $request, $key ) {
					return is_numeric( $param );
				},
			),
		);
	}
}
