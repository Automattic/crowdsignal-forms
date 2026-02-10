<?php
/**
 * File containing \Crowdsignal_Forms\Synchronization\Post_Sync_Entity.
 *
 * @package crowdsignal-forms/Synchronization
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Synchronization;

use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Post_Sync_Entity
 *
 * @package Crowdsignal_Forms\Synchronization
 */
class Post_Sync_Entity implements Synchronizable_Entity, Synchronizable_Survey_Entity {

	/**
	 * The poll ids meta key.
	 */
	const CROWDSIGNAL_FORMS_POLL_IDS = '_crowdsignal_forms_poll_ids';

	/**
	 * The post id.
	 *
	 * @var int $post_id
	 */
	private $post_id;

	/**
	 * The post.
	 *
	 * @var \WP_Post $post
	 */
	private $post;

	/**
	 * Is this an update or not.
	 *
	 * @var bool $is_update
	 */
	private $is_update;

	/**
	 * Post_Poll_Block_Saver constructor.
	 *
	 * @param int    $post_id   The post id.
	 * @param object $post      The post.
	 * @param bool   $is_update Is Update.
	 */
	public function __construct( $post_id, $post, $is_update = false ) {
		$this->post_id   = $post_id;
		$this->post      = $post;
		$this->is_update = $is_update;
	}

	/**
	 * Checks if the content is saveable.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	public function can_be_saved() {
		if ( wp_is_post_autosave( $this->post_id ) || wp_is_post_revision( $this->post_id ) || 'trash' === $this->post->post_status || 'auto-draft' === $this->post->post_status ) {
			return false;
		}
		return true;
	}

	/**
	 * Get Blocks.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_blocks() {
		$content = $this->post->post_content;
		return parse_blocks( $content );
	}

	/**
	 * Gets the poll ids the entity has in it's content.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_poll_ids_saved_in_entity() {
		$poll_ids_saved_in_entity = get_post_meta( $this->post_id, self::CROWDSIGNAL_FORMS_POLL_IDS, true );
		return is_array( $poll_ids_saved_in_entity ) ? $poll_ids_saved_in_entity : array();
	}

	/**
	 * Check if the entity contains any blocks.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	public function has_crowdsignal_forms_blocks() {
		return has_blocks( $this->post ) && (
			has_block( 'crowdsignal-forms/poll', $this->post ) ||
			has_block( 'crowdsignal-forms/vote', $this->post ) ||
			has_block( 'crowdsignal-forms/applause', $this->post )
		);
	}

	/**
	 * Get the poll data saved in the entity for the specified client id.
	 *
	 * @since 1.0.0
	 *
	 * @param string $poll_client_id The poll unique client id.
	 * @return array|null
	 */
	public function get_entity_poll_data( $poll_client_id ) {
		$platform_poll_data = Crowdsignal_Forms::instance()
			->get_post_poll_meta_gateway()
			->get_poll_data_for_poll_client_id( $this->post_id, $poll_client_id );

		// Append post_ID so Crowdsignal_Forms\Models\Poll::from_array
		// can inject the source_link.
		if ( empty( $platform_poll_data ) ) {
			// nothing in the key or key not existing. New poll.
			$platform_poll_data = array( 'post_id' => $this->post_id );
		} else {
			$platform_poll_data = array_merge( $platform_poll_data, array( 'post_id' => $this->post_id ) );
		}
		return $platform_poll_data;
	}

	/**
	 * Update the poll data saved in the entity for the specified client id.
	 *
	 * @since 1.0.0
	 * @param string $poll_client_id The poll unique client id.
	 * @param array  $result_array An updated poll array.
	 *
	 * @return mixed
	 */
	public function update_entity_poll_data( $poll_client_id, $result_array ) {
		return Crowdsignal_Forms::instance()->get_post_poll_meta_gateway()
			->update_poll_data_for_client_id( $this->post_id, $poll_client_id, $result_array );
	}

	/**
	 * Updates the list of poll ids saved in entity.
	 *
	 * @since 1.0.0
	 *
	 * @param array $poll_ids_present_in_content The polls that are currently part of the content.
	 *
	 * @return mixed
	 */
	public function update_poll_ids_present_in_entity( $poll_ids_present_in_content ) {
		return update_post_meta( $this->post_id, self::CROWDSIGNAL_FORMS_POLL_IDS, $poll_ids_present_in_content );
	}

	/**
	 * Get the post ID.
	 *
	 * @since 1.8.0
	 *
	 * @return int
	 */
	public function get_post_id() {
		return $this->post_id;
	}

	/**
	 * Check if the entity contains any survey blocks (NPS or Feedback).
	 *
	 * @since 1.8.0
	 *
	 * @return bool
	 */
	public function has_survey_blocks() {
		return has_blocks( $this->post ) && (
			has_block( 'crowdsignal-forms/nps', $this->post ) ||
			has_block( 'crowdsignal-forms/feedback', $this->post )
		);
	}

	/**
	 * Gets the survey IDs the entity has in its content.
	 *
	 * @since 1.8.0
	 *
	 * @return array
	 */
	public function get_survey_ids_saved_in_entity() {
		$survey_ids = get_post_meta( $this->post_id, Survey_Block_Synchronizer::CROWDSIGNAL_FORMS_SURVEY_IDS, true );
		return is_array( $survey_ids ) ? $survey_ids : array();
	}

	/**
	 * Get the survey data saved in the entity for the specified client id.
	 *
	 * @since 1.8.0
	 *
	 * @param string $survey_client_id The survey unique client id.
	 * @return array|null
	 */
	public function get_entity_survey_data( $survey_client_id ) {
		return Crowdsignal_Forms::instance()
			->get_post_survey_meta_gateway()
			->get_survey_data_for_client_id( $this->post_id, $survey_client_id );
	}

	/**
	 * Update the survey data saved in the entity for the specified client id.
	 *
	 * @since 1.8.0
	 *
	 * @param string $survey_client_id The survey unique client id.
	 * @param array  $result_array     An updated survey array.
	 * @return mixed
	 */
	public function update_entity_survey_data( $survey_client_id, $result_array ) {
		return Crowdsignal_Forms::instance()
			->get_post_survey_meta_gateway()
			->update_survey_data_for_client_id( $this->post_id, $survey_client_id, $result_array );
	}

	/**
	 * Updates the list of survey IDs saved in entity.
	 *
	 * @since 1.8.0
	 *
	 * @param array $survey_ids The surveys that are currently part of the content.
	 * @return mixed
	 */
	public function update_survey_ids_present_in_entity( $survey_ids ) {
		return update_post_meta( $this->post_id, Survey_Block_Synchronizer::CROWDSIGNAL_FORMS_SURVEY_IDS, $survey_ids );
	}
}
