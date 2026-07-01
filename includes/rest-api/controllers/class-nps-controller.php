<?php
/**
 * Contains the NPS Controller Class
 *
 * @since 1.4.0
 * @package Crowdsignal_Forms\Rest_Api
 */

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_Block;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * NPS Controller Class
 *
 * @since 1.4.0
 */
class Nps_Controller {
	use Post_Readability_Trait;

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
	 * Register the routes for NPS response submissions.
	 *
	 * Note: Create/update routes have been removed. Survey creation
	 * and updates now happen via a `post_save` hook rather than
	 * WP REST API endpoints.
	 *
	 * @since 1.4.0
	 */
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<survey_client_id>[a-zA-Z0-9\-\_]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_survey' ),
					'permission_callback' => array( $this, 'get_survey_permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<survey_id>\d+)/response',
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
	 * Get cached survey data by client ID (UUID).
	 *
	 * @since 1.8.0
	 *
	 * @param  \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_survey( \WP_REST_Request $request ) {
		$survey_client_id = $request->get_param( 'survey_client_id' );

		if ( null === $survey_client_id ) {
			return new \WP_Error(
				'invalid-survey-client-id',
				__( 'Invalid survey client ID', 'crowdsignal-forms' ),
				array( 'status' => 400 )
			);
		}

		$survey_data = Crowdsignal_Forms::instance()
			->get_post_survey_meta_gateway()
			->get_survey_data_for_client_id( null, $survey_client_id );

		if ( empty( $survey_data ) || ! isset( $survey_data['id'] ) ) {
			return new \WP_Error(
				'resource-not-found',
				__( 'Resource not found', 'crowdsignal-forms' ),
				array( 'status' => 404 )
			);
		}

		$post_id = Crowdsignal_Forms::instance()
			->get_post_survey_meta_gateway()
			->get_original_post_id_for_client_id( $survey_client_id );

		if ( ! $this->is_owning_post_readable( $post_id ) ) {
			return new \WP_Error(
				'resource-not-found',
				__( 'Resource not found', 'crowdsignal-forms' ),
				array( 'status' => 404 )
			);
		}

		return rest_ensure_response( $survey_data );
	}

	/**
	 * The permission check for getting survey data.
	 *
	 * @since 1.8.0
	 *
	 * @return bool
	 */
	public function get_survey_permissions_check() {
		return true;
	}

	/**
	 * This route acts as a proxy for Crowdsignal's NPS response endpoint,
	 * which allows recording and updating responses.
	 *
	 * @since 1.4.0
	 *
	 * Updating an existing response (when `r` is supplied) requires a checksum
	 * keyed with a server-side secret, so a caller cannot submit someone
	 * else's response id without the checksum issued to the original
	 * submitter. See {@see get_response_checksum()}.
	 *
	 * @param  \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|WP_ERROR
	 */
	public function upsert_nps_response( \WP_REST_Request $request ) {
		$data      = $request->get_json_params();
		$survey_id = $request->get_param( 'survey_id' );

		$nonce       = isset( $data['nonce'] ) ? $data['nonce'] : '';
		$response_id = isset( $data['r'] ) ? $data['r'] : '';
		$checksum    = isset( $data['checksum'] ) ? (string) $data['checksum'] : '';

		$verifies = Crowdsignal_Forms_Nps_Block::verify_nonce( $nonce );

		if (
			! $verifies ||
			(
				$response_id &&
				! hash_equals( $this->get_response_checksum( $response_id ), $checksum )
			)
		) {
			return new \WP_Error(
				'forbidden',
				__( 'Forbidden', 'crowdsignal-forms' ),
				array( 'status' => 403 )
			);
		}

		$result = Crowdsignal_Forms::instance()->get_api_gateway()->update_nps_response(
			$survey_id,
			$data
		);

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$result['checksum'] = $this->get_response_checksum( $result['r'] );

		return rest_ensure_response( $result );
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
				'validate_callback' => function ( $param, $request, $key ) {
					return is_numeric( $param );
				},
			),
		);
	}

	/**
	 * Creates a keyed checksum for a response ID.
	 *
	 * The checksum binds an update to whoever received it back from the
	 * original submission, so it must be unforgeable by a caller who only
	 * knows the response ID. It is therefore keyed with a server-side secret
	 * ( `wp_salt()` ): an attacker cannot recompute it for a response ID they
	 * did not create. The previous `sha1( $response_id . $nonce )` provided no
	 * authorization because every input was attacker-known (the nonce is the
	 * same shared value for all anonymous visitors).
	 *
	 * @param  string $response_id Response ID.
	 * @return string
	 */
	private function get_response_checksum( $response_id ) {
		return hash_hmac( 'sha256', (string) $response_id, wp_salt( 'nonce' ) );
	}
}
