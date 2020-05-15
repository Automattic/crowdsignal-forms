<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll_Settings.
 *
 * @package crowdsignal-forms/Models
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Poll_Settings
 *
 * @since 1.0.0
 * @package Crowdsignal_Forms\Models
 */
class Poll_Settings {
	/**
	 * Create one from the API.
	 *
	 * @param array $data The data.
	 *
	 * @return Poll_Settings
	 */
	public static function from_array( $data ) {
		return new self();
	}
}
