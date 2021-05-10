<?php
/**
 * The default (WordPress.org plugin) Crowdsignal auth provider
 *
 * @package Crowdsignal_Forms\Auth
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Auth;

/**
 * Class Default_Api_Auth_Provider
 *
 * @package Crowdsignal_Forms\Auth
 */
class Default_Api_Auth_Provider implements Api_Auth_Provider_Interface {

	/**
	 * Return the user code to be used with the Crowdsignal API.
	 *
	 * @param int $user_id int WordPress User ID.
	 * @return string Crowdsignal user code
	 */
	public function fetch_user_code( $user_id ) {
		// TODO: Implement get_user_code() method.
		return '';
	}

	/**
	 * Return the user code to be used with the Crowdsignal API.
	 *
	 * @param string $api_key Crowdsignal API key.
	 * @return string Crowdsignal user code or false on error.
	 */
	public function fetch_user_code_for_key( $api_key ) {
		$curl_data = wp_json_encode(
			array(
				'pdAccess' => array(
					'partnerGUID'   => $api_key,
					'partnerUserID' => wp_get_current_user()->ID,
					'demands'       => array(
						'demand' => array(
							'id' => 'GetUserCode',
						),
					),
				),
			)
		);

		$data = $this->perform_query( $curl_data );

		if ( isset( $data->pdResponse->userCode ) ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- data from API.
			return $data->pdResponse->userCode; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- data from API.
		} else {
			return false;
		}
	}

	/**
	 * Get the Crowdsignal user code for an API key.
	 *
	 * @param string $query query to send to API.
	 * @return mixed
	 */
	private function perform_query( $query ) {
		$data = wp_remote_post(
			'https://api.crowdsignal.com/v1',
			array(
				'method'  => 'POST',
				'body'    => $query,
				'headers' => array( 'Content-Type' => 'application/json' ),
			)
		);
		if ( is_wp_error( $data ) ) {
			return array();
		}
		return json_decode( $data['body'] );
	}
}
