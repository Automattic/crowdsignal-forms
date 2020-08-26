<?php
/**
 * File containing the model \Crowdsignal_Forms\Synchronization\Synchronizable_Entity.
 *
 * @package crowdsignal-forms/Synchronization
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Synchronization;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface Synchronizable_Entity.
 *
 * @package Crowdsignal_Forms\Synchronization
 */
interface Synchronizable_Entity {

	/**
	 * Checks if the content is saveable.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	public function can_be_saved();

	/**
	 * Get Blocks.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_blocks();

	/**
	 * Gets the poll ids the entity has in it's content.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_poll_ids_saved_in_entity();

	/**
	 * Check if the entity contains any crowdsignal-forms blocks.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	public function has_crowdsignal_forms_blocks();

	/**
	 * Get the poll data saved in the entity for the specified client id.
	 *
	 * @since 1.0.0
	 *
	 * @param string $poll_client_id The poll unique client id.
	 * @return array|null
	 */
	public function get_entity_poll_data( $poll_client_id );

	/**
	 * Update the poll data saved in the entity for the specified client id.
	 *
	 * @since 1.0.0
	 * @param string $poll_client_id The poll unique client id.
	 * @param array  $result_array An updated poll array.
	 *
	 * @return mixed
	 */
	public function update_entity_poll_data( $poll_client_id, $result_array );

	/**
	 * Updates the list of poll ids saved in entity.
	 *
	 * @since 1.0.0
	 *
	 * @param array $poll_ids_present_in_content The polls that are currently part of the content.
	 * @return mixed
	 */
	public function update_poll_ids_present_in_entity( $poll_ids_present_in_content );
}
