<?php
/**
 * Contains the Feedback Controller Class
 *
 * @since 1.5.1
 * @package Crowdsignal_Forms\Rest_Api
 */

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Feedback_Survey;
use Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Feedback_Block;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Feedback Controller Class
 *
 * @since 1.5.1
 */
class Feedback_Controller {
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
	protected $rest_base = 'feedback';

	/**
	 * Register the routes for manipulating Feedback blocks
	 *
	 * @since 1.5.1
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'upsert_feedback' ),
					'permission_callback' => array( $this, 'create_or_update_feedback_permissions_check' ),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<survey_id>\d+)',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upsert_feedback' ),
					'permission_callback' => array( $this, 'create_or_update_feedback_permissions_check' ),
					'args'                => $this->get_feedback_fetch_params(),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<survey_id>\d+)/response',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upsert_feedback_response' ),
					'permission_callback' => array( $this, 'create_or_update_feedback_response_permissions_check' ),
					'args'                => $this->get_feedback_fetch_params(),
				),
			)
		);
	}

	/**
	 * Updates an Feedback Survey. Creates one if no ID is given.
	 *
	 * @since 1.5.1
	 *
	 * @param  \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function upsert_feedback( \WP_REST_Request $request ) {
		$data   = $request->get_json_params();
		$survey = Feedback_Survey::from_block_attributes( $data );
		$result = Crowdsignal_Forms::instance()->get_api_gateway()->update_feedback( $survey );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result->to_block_attributes() );
	}

	/**
	 * This route acts as a proxy for Crowdsignal's Feedback response endpoint,
	 * which allows recording and updating responses.
	 *
	 * @since 1.5.1
	 *
	 * @todo The nonce helps but it's still possible for someone to generate their own nonce and
	 *       submit someone else's response id.
	 *       The nonce needs to be tied to the response ID.
	 *
	 * @param  \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|WP_ERROR
	 */
	public function upsert_feedback_response( \WP_REST_Request $request ) {
		$data      = $request->get_json_params();
		$survey_id = $request->get_param( 'survey_id' );

		$verifies = Crowdsignal_Forms_Feedback_Block::verify_nonce( $data['nonce'] );

		if ( ! $verifies ) {
			return new \WP_Error( 'Forbidden' );
		}

		$result = Crowdsignal_Forms::instance()->get_api_gateway()->update_feedback_response(
			$survey_id,
			$data
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * The permission check for creating a new poll.
	 *
	 * @since 1.5.1
	 *
	 * @return bool
	 */
	public function create_or_update_feedback_permissions_check() {
		return current_user_can( 'publish_posts' );
	}

	/**
	 * The permission check for creating/updating feedback responses.
	 *
	 * @since 1.5.1
	 *
	 * @return bool
	 */
	public function create_or_update_feedback_response_permissions_check() {
		return true;
	}

	/**
	 * Returns a validator array for the NPS endpoints params.
	 *
	 * @since 1.5.1
	 * @see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
	 *
	 * @return array
	 */
	protected function get_feedback_fetch_params() {
		return array(
			'survey_id' => array(
				'validate_callback' => function ( $param, $request, $key ) {
					return is_numeric( $param );
				},
			),
		);
	}
}
