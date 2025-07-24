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
use Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_Block;
use Crowdsignal_Forms\Rest_Api\Controllers\Authorization_Helper;

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
			'/' . $this->rest_base . '/(?P<survey_uuid>[a-f0-9\-]{36})',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upsert_nps' ),
					'permission_callback' => array( $this, 'create_or_update_nps_permissions_check' ),
					'args'                => $this->get_nps_fetch_params(),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<survey_uuid>[a-f0-9\-]{36})/response',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'upsert_nps_response' ),
					'permission_callback' => array( $this, 'create_or_update_nps_response_permissions_check' ),
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
	 * @return \WP_REST_Response|WP_Error
	 */
	public function upsert_nps( \WP_REST_Request $request ) {
		$data   = $request->get_json_params();
		$survey = Nps_Survey::from_block_attributes( $data );

		$result = Crowdsignal_Forms::instance()->get_api_gateway()->update_nps( $survey );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Note: Registry table registration is now disabled in favor of UUID postmeta system.
		// UUID postmeta is created automatically via post save hooks in Admin_Hooks::create_uuid_postmeta().

		return rest_ensure_response( $result->to_block_attributes() );
	}

	/**
	 * This route acts as a proxy for Crowdsignal's NPS response endpoint,
	 * which allows recording and updating responses.
	 *
	 * @since 1.4.0
	 *
	 * @todo The nonce helps but it's still possible for someone to generate their own nonce and
	 *       submit someone else's response id.
	 *       The nonce needs to be tied to the response ID.
	 *
	 * @param  \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|WP_ERROR
	 */
	public function upsert_nps_response( \WP_REST_Request $request ) {
		$data        = $request->get_json_params();
		$survey_uuid = $request->get_param( 'survey_uuid' );
		$survey_id   = Authorization_Helper::convert_uuid_to_sequential_id( $survey_uuid, 'nps' );

		if ( ! $survey_id ) {
			return new \WP_Error( 'invalid_survey', 'Survey not found for UUID', array( 'status' => 404 ) );
		}

		$verifies = Crowdsignal_Forms_Nps_Block::verify_nonce( $data['nonce'] );

		if (
			! $verifies ||
			(
				$data['r'] &&
				$data['checksum'] !== $this->get_response_checksum( $data['r'], $data['nonce'] )
			)
		) {
			return new \WP_Error( 'Forbidden' );
		}

		$result = Crowdsignal_Forms::instance()->get_api_gateway()->update_nps_response(
			$survey_id,
			$data
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$result['checksum'] = $this->get_response_checksum( $result['r'], $data['nonce'] );

		return rest_ensure_response( $result );
	}

	/**
	 * The permission check for creating a new NPS survey.
	 *
	 * @since 1.4.0
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 */
	public function create_or_update_nps_permissions_check( $request = null ) {
		// For new NPS creation, check publish_posts capability.
		if ( ! $request ) {
			return current_user_can( 'publish_posts' );
		}

		// For post-based NPS, check post edit permissions first (most reliable).
		$post_id = $request->get_param( 'post_id' );
		if ( $post_id ) {
			return current_user_can( 'edit_post', $post_id );
		}

		$data   = $request->get_json_params();
		$survey = Nps_Survey::from_block_attributes( $data );

		// For updates, check if user can edit the NPS survey by UUID.
		$survey_uuid = $request->get_param( 'survey_uuid' );
		if ( $survey_uuid ) {
			// Validate that the UUID exists and convert to sequential ID.
			$sequential_id = Authorization_Helper::convert_uuid_to_sequential_id( $survey_uuid, 'nps' );
			if ( ! $sequential_id ) {
				return false; // UUID not found.
			}
			if ( $survey->get_id() && $survey->get_id() !== $sequential_id ) {
				return false; // Mismatch between request data and URL parameter.
			}
			return Authorization_Helper::can_user_edit_item_by_uuid( $survey_uuid, 'nps' );
		}

		// If the survey is in the request, check if the user can edit it.
		if ( $survey && $survey->get_id() ) {
			return Authorization_Helper::can_user_edit_item( $survey->get_id(), 'nps' );
		}

		// For post-based NPS with client_id, check post edit permissions.
		$client_id = $request->get_param( 'client_id' );
		if ( $post_id && $client_id ) {
			return Authorization_Helper::can_user_edit_item_by_client_id( $client_id, $post_id );
		}

		// Fallback to publish_posts for new NPS surveys.
		return current_user_can( 'publish_posts' );
	}

	/**
	 * The permission check for creating/updating nps responses.
	 *
	 * @since 1.4.0
	 *
	 * @return bool
	 */
	public function create_or_update_nps_response_permissions_check() {
		return true;
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
				'validate_callback' => function ( $param, $request, $key ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
					return is_numeric( $param );
				},
			),
		);
	}

	/**
	 * Creates a checksum hash for a response ID and nonce combination.
	 *
	 * @param  string $response_id Response ID.
	 * @param  string $nonce       Nonce.
	 * @return string
	 */
	private function get_response_checksum( $response_id, $nonce ) {
		return hash( 'sha1', $response_id . $nonce );
	}
}
