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
		return $this->create_or_update_poll( $poll );
	}

	/**
	 * Call the api to update a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function update_poll( Poll $poll ) {
		return $this->create_or_update_poll( $poll );
	}

	/**
	 * Call the api to trash a poll.
	 *
	 * @param int $id_to_trash The poll id to trash.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function trash_poll( $id_to_trash ) {
		return new \WP_Error( 'FIXME' );
	}

	/**
	 * Common method for either creating or updating a Poll.
	 *
	 * @param Poll $poll The poll.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	private function create_or_update_poll( Poll $poll ) {
		$request_method = 'POST';

		if ( 0 === $poll->get_id() ) {
			$endpoint = '/polls';
		} else {
			$endpoint = '/polls/' . $poll->get_id();
		}

		$request_data = array( 'poll' => $poll->to_array() );

		// Inject "source" property used on the API v3.
		$request_data['source'] = self::POLL_SOURCE;

		// Perform the request after injecting the "source" prop.
		$response = $this->perform_request( $request_method, $endpoint, $request_data );

		if ( is_wp_error( $response ) ) {
			$this->log_webservice_event(
				'response_error',
				array(
					'error' => $response,
				)
			);
			return $response;
		}

		$body          = wp_remote_retrieve_body( $response );
		$response_data = json_decode( $body, true );

		if ( null === $response_data || ! isset( $response_data['poll'] ) ) {
			if ( isset( $response_data['error'] ) ) {
				$wp_error = new \WP_Error( $response_data['error'], $response_data );
				$this->log_webservice_event(
					'response_error',
					array(
						'error' => $wp_error,
					)
				);
				return $wp_error;
			}

			$this->log_webservice_event(
				'response_error',
				array(
					'error' => 'decode-failed',
					'body'  => $body,
				)
			);

			return new \WP_Error( 'decode-failed' );
		}

		$this->log_webservice_event(
			'response_success',
			array(
				'data' => $response_data,
			)
		);

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

		$this->log_webservice_event(
			'request_data',
			array(
				'endpoint'        => $endpoint,
				'request_options' => $request_options,
			)
		);

		return wp_remote_request( $base_url . $endpoint, $request_options );
	}

	/**
	 * Log a webservice event such as an error or a successful request.
	 *
	 * @param string $name The event name.
	 * @param array  $data The event data.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	private function log_webservice_event( $name, $data = array() ) {
		do_action( 'crowdsignal_forms_log_webservice_event', $name, $data );
	}
}
