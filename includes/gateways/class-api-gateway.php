<?php
/**
 * File containing the interface \Crowdsignal_Forms\Gateways\Api_Gateway_Interface.
 *
 * @package crowdsignal-forms/Gateways
 * @since 0.9.0
 */

namespace Crowdsignal_Forms\Gateways;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Nps_Survey;
use Crowdsignal_Forms\Models\Feedback_Survey;
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
	 * @since 0.9.0
	 *
	 * @var string
	 */
	const API_BASE_URL = 'https://api.crowdsignal.com/v3';

	/**
	 * A constant flag to mark polls on the API.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	const POLL_SOURCE = 'crowdsignal-forms';

	/**
	 * Get polls
	 *
	 * @since 0.9.0
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
	 * @since 0.9.0
	 *
	 * @return Poll|\WP_Error
	 */
	public function get_poll( $poll_id ) {
		$poll_id  = absint( $poll_id );
		$response = $this->perform_request( 'GET', '/polls/' . $poll_id );
		return $this->handle_api_response( $response );
	}

	/**
	 * Get the poll results with specified poll id from the api.
	 *
	 * @param int $poll_id The poll id.
	 * @since 0.9.0
	 *
	 * @return array|\WP_Error
	 */
	public function get_poll_results( $poll_id ) {
		$poll_id  = absint( $poll_id );
		$response = $this->perform_request( 'GET', '/polls/' . $poll_id . '/results' );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body          = wp_remote_retrieve_body( $response );
		$response_data = json_decode( $body, true );

		if ( ! $this->is_poll_response_valid( $response_data ) ) {
			if ( isset( $response_data['error'] ) ) {
				return new \WP_Error( $response_data['error'], $response_data );
			}
			return new \WP_Error( 'decode-failed' );
		}

		return $response_data['poll'];
	}

	/**
	 * Call the api to create a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 0.9.0
	 */
	public function create_poll( Poll $poll ) {
		return $this->create_or_update_poll( $poll );
	}

	/**
	 * Call the api to update a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 0.9.0
	 */
	public function update_poll( Poll $poll ) {
		return $this->create_or_update_poll( $poll );
	}

	/**
	 * Call the api to archive a poll.
	 *
	 * @param int $id_to_archive The poll id to move to the archive.
	 * @return Poll|\WP_Error
	 * @since 0.9.0
	 */
	public function archive_poll( $id_to_archive ) {
		$response = $this->perform_request( 'POST', '/polls/' . absint( $id_to_archive ) . '/archive' );
		return $this->handle_api_response( $response );
	}

	/**
	 * Handle the api response.
	 *
	 * @param \WP_Error|mixed $response The api response.
	 *
	 * @return \WP_Error|Poll
	 */
	private function handle_api_response( $response ) {
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body          = wp_remote_retrieve_body( $response );
		$response_data = json_decode( $body, true );

		if ( ! $this->is_poll_response_valid( $response_data ) ) {
			if ( isset( $response_data['error'] ) ) {
				return new \WP_Error( $response_data['error'], $response_data );
			}
			return new \WP_Error( 'decode-failed' );
		}

		return Poll::from_array( $response_data['poll'] );
	}

	/**
	 * Call the api to unarchive a poll.
	 *
	 * @param int $id_to_unarchive The poll id to move to the archive.
	 * @return Poll|\WP_Error
	 * @since 0.9.0
	 */
	public function unarchive_poll( $id_to_unarchive ) {
		$response = $this->perform_request( 'POST', '/polls/' . $id_to_unarchive . '/unarchive' );
		return $this->handle_api_response( $response );
	}

	/**
	 * Fires a call to the Crowdsignal API to update the survey.
	 *
	 * @since 1.4.0
	 *
	 * @param  Nps_Survey $survey  Survey.
	 * @return Nps_Survey|WP_Error
	 */
	public function update_nps( Nps_Survey $survey ) {
		$survey_array = $survey->to_array();

		// Inject source attribute.
		$survey_array['source'] = 'crowdsignal-forms';

		$response = $this->perform_request(
			'POST',
			$survey->get_id() ? '/nps/' . $survey->get_id() : '/nps',
			$survey_array
		);

		if ( is_wp_error( $response ) ) {
			$this->log_webservice_event(
				'response_error',
				array(
					'error' => $response,
				)
			);

			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		$this->log_webservice_event(
			'response_success',
			array(
				'data' => $data,
			)
		);

		return Nps_Survey::from_array( $data );
	}

	/**
	 * Fires a proxy call to the Crowdsignal API NPS response endpoint
	 * passing $data as is and returns the response body as an array or
	 * a WP_Error.
	 *
	 * @param  int   $survey_id Survey ID.
	 * @param  array $data      Request data.
	 * @return array|WP_Error
	 */
	public function update_nps_response( $survey_id, array $data ) {
		$response = $this->perform_request(
			'POST',
			'/nps/' . $survey_id . '/response',
			$data
		);

		if ( is_wp_error( $response ) ) {
			$this->log_webservice_event(
				'response_error',
				array(
					'error' => $response,
				)
			);

			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		$this->log_webservice_event(
			'response_success',
			array(
				'data' => $data,
			)
		);

		return $data;
	}

	/**
	 * Fires a call to the Crowdsignal API to update the survey.
	 *
	 * @since 1.5.1
	 *
	 * @param  Feedback_Survey $survey  Survey.
	 * @return Feedback_Survey|WP_Error
	 */
	public function update_feedback( Feedback_Survey $survey ) {
		$survey_array = $survey->to_array();

		// Inject source attribute.
		$survey_array['source'] = 'crowdsignal-forms';

		$response = $this->perform_request(
			'POST',
			$survey->get_id() ? '/feedback/' . $survey->get_id() : '/feedback',
			$survey_array
		);

		if ( is_wp_error( $response ) ) {
			$this->log_webservice_event(
				'response_error',
				array(
					'error' => $response,
				)
			);

			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		$this->log_webservice_event(
			'response_success',
			array(
				'data' => $data,
			)
		);

		return Feedback_Survey::from_array( $data );
	}

	/**
	 * Fires a proxy call to the Crowdsignal API Feedback response endpoint
	 * passing $data as is and returns the response body as an array or
	 * a WP_Error.
	 *
	 * @since 1.5.1
	 * @param  int   $survey_id Survey ID.
	 * @param  array $data      Request data.
	 * @return array|WP_Error
	 */
	public function update_feedback_response( $survey_id, array $data ) {
		$response = $this->perform_request(
			'POST',
			'/feedback/' . $survey_id . '/response',
			$data
		);

		if ( is_wp_error( $response ) ) {
			$this->log_webservice_event(
				'response_error',
				array(
					'error' => $response,
				)
			);

			return $response;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		$this->log_webservice_event(
			'response_success',
			array(
				'data' => $data,
			)
		);

		return $data;
	}

	/**
	 * Common method for either creating or updating a Poll.
	 *
	 * @param Poll $poll The poll.
	 * @return Poll|\WP_Error
	 * @since 0.9.0
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
		$request_data['poll']['source'] = self::POLL_SOURCE;

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

		if ( ! $this->is_poll_response_valid( $response_data ) ) {
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

			return new \WP_Error(
				'decode-failed',
				array(
					'error' => 'decode-failed',
					'body'  => $body,
				)
			);
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
	 * Get the account capabilities for the user.
	 *
	 * @since 0.9.0
	 *
	 * @return array|\WP_Error
	 */
	public function get_capabilities() {
		$response_data = $this->get_account_info();

		return isset( $response_data['capabilities'] )
			? $response_data['capabilities']
			: array();
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
		 * @since 0.9.0
		 *
		 * @return string
		 */
		$base_url = apply_filters( 'crowdsignal_forms_api_base_url', self::API_BASE_URL );

		/**
		 * Add any extra request headers here.
		 *
		 * @param string $api_url The api url.
		 * @since 0.9.0
		 *
		 * @return array
		 */
		$headers = apply_filters(
			'crowdsignal_forms_api_request_headers',
			array(
				'content-type'    => 'application/json',
				'user-agent'      => ! empty( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : 'unknown',
				'x-forwarded-for' => ! empty( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '',
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
	 * @since 0.9.0
	 * @return void
	 */
	private function log_webservice_event( $name, $data = array() ) {
		Crowdsignal_Forms::instance()->get_webservice_logger()->log( $name, $data );
	}

	/**
	 * Checks if an api response contains a poll object.
	 *
	 * @param array $response The event name.
	 *
	 * @since 0.9.0
	 * @return boolean
	 */
	private function is_poll_response_valid( $response ) {
		return null !== $response && isset( $response['poll'] );
	}

	/**
	 * Get the account's verified status.
	 *
	 * @since 0.9.1 ??
	 *
	 * @return bool|\WP_Error
	 */
	public function get_is_user_verified() {
		$response_data = $this->get_account_info();

		return isset( $response_data['is_verified'] )
			? (bool) $response_data['is_verified']
			: false;
	}

	/**
	 * Get the account's summary.
	 *
	 * @since 1.3.5
	 *
	 * @return Array
	 * @throws \Exception   The exception is handled inside the try/catch.
	 */
	public function get_account_info() {
		try {
			$response = $this->perform_request( 'GET', '/account/info' );

			// let it be handled by the catch.
			if ( is_wp_error( $response ) ) {
				throw new \Exception( 'Internal error retrieving account info' );
			}

			$body          = wp_remote_retrieve_body( $response );
			$response_data = json_decode( $body, true );

			// also let it be handled by the catch.
			if ( ! is_array( $response_data ) || isset( $response_data['error'] ) ) {
				throw new \Exception( 'Could not get account info' );
			}

			do_action( 'crowdsignal_forms_get_account_info', $response_data );
		} catch ( \Exception $ex ) {
			// ignore error, we'll get the updated value next time.
			// Provide dummy response with safe defaults.
			$response_data = array(
				'id'           => 0,
				'capabilities' => array( 'hide-branding' ),
			);

			do_action( 'crowdsignal_forms_failed_connection', $ex->getMessage() ? $ex->getMessage() : 'Unknown error' );
		}

		return $response_data;
	}
}
