<?php
/**
 * File containing the interface \Crowdsignal_Forms\Gateways\Api_Gateway_Interface.
 *
 * @package crowdsignal-forms/Gateways
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Gateways;

use Crowdsignal_Forms\Models\Poll;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Canned api gateway class
 **/
class Api_Gateway implements Api_Gateway_Interface {

	/**
	 * The api base.
	 *
	 * @since 1.0.0
	 *
	 * @var string
	 */
	const API_BASE_URL = 'https://api.crowdsignal.com/v3';

	/**
	 * A constant flag to mark polls on the API.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	const POLL_SOURCE = 'crowdsignal-forms';

	/**
	 * Get polls
	 *
	 * @since 1.0.0
	 *
	 * @return array|\WP_Error
	 */
	public function get_polls() {
		return array();
	}

	/**
	 * Get the poll with specified poll id from the api.
	 *
	 * @param int $poll_id The poll id.
	 * @since 1.0.0
	 *
	 * @return Poll|\WP_Error
	 */
	public function get_poll( $poll_id ) {
		$poll_id  = absint( $poll_id );
		$response = $this->perform_request( 'GET', '/polls/' . $poll_id );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body          = wp_remote_retrieve_body( $response );
		$response_data = json_decode( $body, true );

		if ( null === $response_data || ! isset( $response_data['poll'] ) ) {
			if ( isset( $response_data['error'] ) ) {
				return new \WP_Error( $response_data['error'], $response_data );
			}
			return new \WP_Error( 'decode-failed' );
		}

		return Poll::from_array( $response_data['poll'] )->to_array();
	}

	/**
	 * Call the api to create a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function create_poll( Poll $poll ) {
		$request_data = array( 'poll' => $poll->to_array() );

		// Inject "source" property used on the API v3.
		$request_data['source'] = self::POLL_SOURCE;

		// Perform the request after injecting the "source" prop.
		$response = $this->perform_request( 'POST', '/polls', $request_data );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body          = wp_remote_retrieve_body( $response );
		$response_data = json_decode( $body, true );
		if ( null === $response_data || ! isset( $response_data['poll'] ) ) {
			if ( isset( $response_data['error'] ) ) {
				return new \WP_Error( $response_data['error'], $response_data );
			}
			return new \WP_Error( 'decode-failed' );
		}

		return Poll::from_array( $response_data['poll'] );
	}

	/**
	 * Perform an API Request.
	 *
	 * @param string     $method The HTTP Method.
	 * @param string     $endpoint The endpoint.
	 * @param null|array $data The data.
	 * @return array|\WP_Error
	 */
	private function perform_request( $method, $endpoint, $data = null ) {
		/**
		 * Filter the api base url.
		 *
		 * @param string $api_url The api url.
		 * @since 1.0.0
		 *
		 * @return string
		 */
		$base_url = apply_filters( 'crowdsignal_forms_api_base_url', self::API_BASE_URL );

		/**
		 * Add any extra request headers here.
		 *
		 * @param string $api_url The api url.
		 * @since 1.0.0
		 *
		 * @return array
		 */
		$headers = apply_filters(
			'crowdsignal_forms_api_request_headers',
			array(
				'content-type' => 'application/json',
			)
		);

		$request_options = array(
			'method'  => $method,
			'headers' => $headers,
		);

		if ( null !== $data && ! in_array( $method, array( 'GET', 'HEAD', 'OPTIONS' ), true ) ) {
			$body                    = wp_json_encode( $data );
			$request_options['body'] = $body;
		}

		return wp_remote_request( $base_url . $endpoint, $request_options );
	}
}
