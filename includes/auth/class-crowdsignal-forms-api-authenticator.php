<?php
/**
 * Manges authentication with Crowdsignal
 *
 * @package Crowdsignal_Forms\Auth
 * @since   1.0.0
 */

use \Crowdsignal_Forms\Auth\Default_Api_Auth_Provider;

/**
 * Class Crowdsignal_Forms_Api_Authenticator
 */
class Crowdsignal_Forms_Api_Authenticator {

	const USER_CODE_META_NAME = 'crowdsignal_user_code';
	const API_KEY_META_NAME   = 'crowdsignal_api_key';

	/**
	 * The Crowdsignal auth provider.
	 *
	 * @var Crowdsignal_Forms\Auth\Api_Auth_Provider_Interface class
	 */
	private $auth_provider;

	/**
	 * Crowdsignal_Forms_Authenticator constructor
	 */
	public function __construct() {
		$this->auth_provider = $this->get_auth_provider();
	}

	/**
	 * Get the auth provider to use for this instance.
	 *
	 * @return Crowdsignal_Forms\Auth\Api_Auth_Provider_Interface provider instance
	 */
	private function get_auth_provider() {
		return apply_filters( 'crowdsignal_forms_get_auth_provider', new Default_Api_Auth_Provider() );
	}

	/**
	 * Get the Crowdsignal user code for the WordPress user.
	 *
	 * @return string the user code
	 */
	public function get_user_code() {
		$user_id   = wp_get_current_user()->ID;
		$user_code = get_user_meta( $user_id, self::USER_CODE_META_NAME, true );
		if ( false !== $user_code ) {
			return $user_code;
		}

		$user_code = $this->auth_provider->get_user_code( $user_id );
		update_user_meta( $user_id, self::USER_CODE_META_NAME, $user_code );

		return $user_code;
	}

	/**
	 * Get the Crowdsignal API key for the current WordPress user.
	 *
	 * @return string the api key
	 */
	public function get_api_key() {
		$user_id = wp_get_current_user()->ID;
		$api_key = get_user_meta( $user_id, self::API_KEY_META_NAME, true );
		if ( false !== $api_key ) {
			return $api_key;
		}

		$api_key = $this->auth_provider->get_api_key( $user_id );
		update_user_meta( $user_id, self::API_KEY_META_NAME, $api_key );

		return $api_key;
	}
}
