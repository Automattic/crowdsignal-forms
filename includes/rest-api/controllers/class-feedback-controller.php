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
use Crowdsignal_Forms\Rest_Api\Controllers\Authorization_Helper;

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
			'/' . $this->rest_base . '/(?P<survey_uuid>[a-f0-9\-]{36})',
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
			'/' . $this->rest_base . '/(?P<survey_uuid>[a-f0-9\-]{36})/response',
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
		$data        = $request->get_json_params();
		$survey_uuid = $request->get_param( 'survey_uuid' );
		$survey_id   = Authorization_Helper::convert_uuid_to_sequential_id( $survey_uuid, 'feedback' );

		if ( ! $survey_id ) {
			return new \WP_Error( 'invalid_survey', 'Survey not found for UUID', array( 'status' => 404 ) );
		}

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
	 * The permission check for creating a new feedback survey.
	 *
	 * @since 1.5.1
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 */
	public function create_or_update_feedback_permissions_check( $request = null ) {
		// For new feedback creation, check publish_posts capability.
		if ( ! $request ) {
			return current_user_can( 'publish_posts' );
		}

		// Get data from request body (JSON).
		$data = $request->get_json_params();
		// For updates, check if user can edit the feedback survey by UUID.
		$survey_uuid = $request->get_param( 'survey_uuid' );
		if ( $survey_uuid ) {
			return Authorization_Helper::can_user_edit_item_by_uuid( $survey_uuid, 'feedback' );
		}
		// For post-based feedback, check post edit permissions.
		$post_id   = isset( $data['post_id'] ) ? $data['post_id'] : null;
		$client_id = isset( $data['client_id'] ) ? $data['client_id'] : null;
		if ( $post_id && $client_id ) {
			return Authorization_Helper::can_user_edit_item_by_client_id( $client_id, $post_id );
		}
		// Fallback to publish_posts for new feedback surveys.
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
				'validate_callback' => function ( $param, $request, $key ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
					return is_numeric( $param );
				},
			),
		);
	}
}
