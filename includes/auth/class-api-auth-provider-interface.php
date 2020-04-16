<?php
/**
 * An interface for Crowdsignal Authentication
 *
 * @package Crowdsignal_Forms\Auth
 * @since   1.0.0
 */

namespace Crowdsignal_Forms\Auth;

interface Api_Auth_Provider_Interface {

	/**
	 * Return the user code to be used with the Crowdsignal API
	 *
	 * @param int $user_id WordPress User ID.
	 * @return string Crowdsignal user code
	 */
	public function get_user_code( $user_id );
}
