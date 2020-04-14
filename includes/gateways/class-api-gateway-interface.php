<?php
/**
 * File containing the interface \Crowdsignal_Forms\Gateways\Api_Gateway_Interface.
 *
 * @package crowdsignal-forms/Gateways
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Gateways;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Api_Gateway_Interface {

	/**
	 * Get the poll with specified poll id from the api.
	 *
	 * @param int $poll_id The poll id.
	 * @since 1.0.0
	 *
	 * @return object|\WP_Error
	 */
	public function get_poll( $poll_id );

	/**
	 * Call the api to create a poll with the specified data.
	 *
	 * @param array $data The poll data.
	 * @since 1.0.0
	 *
	 * @return object|\WP_Error
	 */
	public function create_poll( array $data );
}
