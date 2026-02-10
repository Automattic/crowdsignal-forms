<?php
/**
 * File containing the interface \Crowdsignal_Forms\Synchronization\Synchronizable_Survey_Entity.
 *
 * @package crowdsignal-forms/Synchronization
 * @since 1.8.0
 */

namespace Crowdsignal_Forms\Synchronization;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interface Synchronizable_Survey_Entity.
 *
 * @package Crowdsignal_Forms\Synchronization
 */
interface Synchronizable_Survey_Entity {

	/**
	 * Checks if the content is saveable.
	 *
	 * @since 1.8.0
	 *
	 * @return bool
	 */
	public function can_be_saved();

	/**
	 * Get Blocks.
	 *
	 * @since 1.8.0
	 *
	 * @return array
	 */
	public function get_blocks();

	/**
	 * Check if the entity contains any survey blocks (NPS or Feedback).
	 *
	 * @since 1.8.0
	 *
	 * @return bool
	 */
	public function has_survey_blocks();

	/**
	 * Gets the survey IDs the entity has in its content.
	 *
	 * @since 1.8.0
	 *
	 * @return array
	 */
	public function get_survey_ids_saved_in_entity();

	/**
	 * Get the survey data saved in the entity for the specified client id.
	 *
	 * @since 1.8.0
	 *
	 * @param string $survey_client_id The survey unique client id.
	 * @return array|null
	 */
	public function get_entity_survey_data( $survey_client_id );

	/**
	 * Update the survey data saved in the entity for the specified client id.
	 *
	 * @since 1.8.0
	 *
	 * @param string $survey_client_id The survey unique client id.
	 * @param array  $result_array     An updated survey array.
	 * @return mixed
	 */
	public function update_entity_survey_data( $survey_client_id, $result_array );

	/**
	 * Updates the list of survey IDs saved in entity.
	 *
	 * @since 1.8.0
	 *
	 * @param array $survey_ids The surveys that are currently part of the content.
	 * @return mixed
	 */
	public function update_survey_ids_present_in_entity( $survey_ids );

	/**
	 * Get the post ID for this entity.
	 *
	 * @since 1.8.0
	 *
	 * @return int
	 */
	public function get_post_id();
}
