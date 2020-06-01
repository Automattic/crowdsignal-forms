<?php
/**
 * File containing the interface \Crowdsignal_Forms\Gateways\Api_Gateway_Interface.
 *
 * @package crowdsignal-forms/Gateways
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Gateways;

use Crowdsignal_Forms\Models\Poll;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Api_Gateway_Interface {

	/**
	 * Get polls
	 *
	 * @since 1.0.0
	 *
	 * @return array|\WP_Error
	 */
	public function get_polls();

	/**
	 * Get the poll with specified poll id from the api.
	 *
	 * @param int $poll_id The poll id.
	 * @since 1.0.0
	 *
	 * @return Poll|\WP_Error
	 */
	public function get_poll( $poll_id );

	/**
	 * Call the api to create a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function create_poll( Poll $poll);

	/**
	 * Call the api to update a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function update_poll( Poll $poll);

	/**
	 * Call the api to trash a poll.
	 *
	 * @param int $id_to_trash The poll id to trash.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function trash_poll( $id_to_trash );
}
