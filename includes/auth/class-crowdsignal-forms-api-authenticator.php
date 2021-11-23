<?php
/**
 * Manges authentication with Crowdsignal
 *
 * @package Crowdsignal_Forms\Auth
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Auth;

/**
 * Class Crowdsignal_Forms_Api_Authenticator
 */
class Crowdsignal_Forms_Api_Authenticator {

	const USER_CODE_NAME = 'crowdsignal_user_code';
	const API_KEY_NAME   = 'crowdsignal_api_key';

	const DASHBOARD_USER_CODE_NAME = 'pd-usercode-';
	const DASHBOARD_API_KEY_NAME   = 'polldaddy_api_key';

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
	 * Get the Crowdsignal user code.
	 *
	 * @return string the user code
	 */
	public function get_user_code() {
		// Return the user code if we already retrieved and saved one.
		$user_code = get_option( self::USER_CODE_NAME );
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
	 * Checks if a Crowdsignal user code has already been retrieved.
	 */
	public function has_user_code() {
		$user_code = get_option( self::USER_CODE_NAME );
		return ! empty( $user_code );
	}

	/**
	 * Get the Crowdsignal API key.
	 *
	 * @return string the API key.
	 */
	public function get_api_key() {
		return get_option( self::API_KEY_NAME );
	}

	/**
	 * Delete the locally cached Crowdsignal API key.
	 */
	public function delete_api_key() {
		delete_option( self::API_KEY_NAME );
		delete_option( self::DASHBOARD_API_KEY_NAME );
	}

	/**
	 * Delete the locally cached Crowdsignal user code.
	 */
	public function delete_user_code() {
		delete_option( self::USER_CODE_NAME );
		delete_option( self::DASHBOARD_USER_CODE_NAME . get_current_user_id() );
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
		update_option( self::USER_CODE_NAME, $user_code );
		update_option( self::DASHBOARD_USER_CODE_NAME . get_current_user_id(), $user_code );
	}

	/**
	 * Set the Crowdsignal API key
	 *
	 * @param string $api_key API key to be set.
	 */
	public function set_api_key( $api_key ) {
		update_option( self::API_KEY_NAME, $api_key );
		update_option( self::DASHBOARD_API_KEY_NAME, $api_key );
	}
}
