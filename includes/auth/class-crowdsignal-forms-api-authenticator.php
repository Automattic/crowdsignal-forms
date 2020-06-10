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
		// Return the user code if we already retrieved and saved one.
		$user_code = get_option( self::USER_CODE_META_NAME );
		if ( ! empty( $user_code ) ) {
			return $user_code;
		}

		// No saved user code found. Let's fetch one!
		$user_id   = wp_get_current_user()->ID;
		$user_code = $this->auth_provider->fetch_user_code( $user_id );
		if ( $user_code ) {
			$this->set_user_code( $user_code );
		}

		return $user_code;
	}

	/**
	 * Get the Crowdsignal user code for an API key
	 *
	 * @param string $api_key api key.
	 */
	public function get_user_code_for_key( $api_key ) {
		$user_code = $this->auth_provider->fetch_user_code_for_key( $api_key );
		if ( $user_code ) {
			$this->set_user_code( $user_code );
		}

		return $user_code;
	}

	/**
	 * Set the Crowdsignal user code
	 *
	 * @param string $user_code user code to be set.
	 */
	public function set_user_code( $user_code ) {
		update_option( self::USER_CODE_META_NAME, $user_code );
	}
}
