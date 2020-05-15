<?php

/*
Plugin Name: Force Crowdsignal-Forms api keys from environment
Description: Force Crowdsignal-Forms api keys from environment variable values.
Version: 1.0
Author: Automattic
Author URI: http://automattic.com/
*/

/**
 * Forces the api header values to environment variables.
 *
 * @param array $headers The headers.
 * @return array
 */
add_filter( 'crowdsignal_forms_api_request_headers', function ( $headers ) {
	$guid = getenv( 'CROWDSIGNAL_FORMS_API_PARTNER_GUID' );
	$user_code = getenv( 'CROWDSIGNAL_FORMS_API_USER_CODE' );
	if ( ! empty( $guid ) ) {
		$headers['x-api-partner-guid'] = $guid;
	}
	if ( ! empty( $user_code ) ) {
		$headers['x-api-user-code'] = $user_code;
	}
	return $headers;
} );
