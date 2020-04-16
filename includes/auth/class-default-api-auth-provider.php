<?php
/**
 * The default (WordPress.org plugin) Crowdsignal auth provider
 *
 * @package Crowdsignal_Forms\Auth
 * @since   1.0.0
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
	public function get_user_code( $user_id ) {
		// TODO: Implement get_user_code() method.
		return '';
	}
}
