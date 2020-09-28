<?php
/**
 * File containing the model \Crowdsignal_Forms\Synchronization\Comment_Sync_Entity.
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
 * Class Comment_Sync_Entity
 *
 * @package Crowdsignal_Forms\Synchronization
 */
class Comment_Sync_Entity implements Synchronizable_Entity {

	/**
	 * The poll ids meta key prefix for a specific comment.
	 */
	const CROWDSIGNAL_FORMS_POST_COMMENTS_POLL_IDS = '_crowdsignal_forms_comment_poll_ids_';

	/**
	 * The comment id.
	 *
	 * @var int
	 */
	private $comment_id;

	/**
	 * Comment approved status.
	 *
	 * @var int|string|null
	 */
	private $comment_approved;

	/**
	 * Comment data.
	 *
	 * @var array
	 */
	private $commentdata;

	/**
	 * The comment.
	 *
	 * @var array|\WP_Comment|null
	 */
	private $comment;

	/**
	 * The post the comment belongs to.
	 *
	 * @var int
	 */
	private $post_id;

	/**
	 * Comment_Sync_Entity constructor.
	 *
	 * @param int             $comment_id       The comment id.
	 * @param int|string|null $comment_approved The comment status. If null, derived from the comment we fetch.
	 * @param array           $commentdata      The comment data.
	 */
	public function __construct( $comment_id, $comment_approved, $commentdata ) {
		$this->comment_id  = $comment_id;
		$this->commentdata = $commentdata;
		$this->comment     = get_comment( $comment_id );
		if ( null === $comment_approved ) {
			$comment_approved = empty( $this->comment ) ? 0 : $this->comment->comment_approved;
		}
		$this->comment_approved = $comment_approved;
		$this->post_id          = $this->comment->comment_post_ID;
	}

	/**
	 * Checks if the content is saveable.
	 *
	 * @since 1.0.0
	 *
	 * @return bool
	 */
	public function can_be_saved() {
		if ( 'spam' === $this->comment_approved ||
			0 === $this->comment_approved ||
			empty( $this->comment ) ||
			! isset( $this->comment->comment_content ) ) {
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
		$content = $this->comment->comment_content;
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
		$poll_ids_saved_in_entity = get_post_meta( $this->post_id, $this->get_comment_poll_ids_meta_key(), true );
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
		$content = $this->comment->comment_content;
		return has_blocks( $content ) && (
			has_block( 'crowdsignal-forms/poll', $content ) ||
			has_block( 'crowdsignal-forms/vote', $content ) ||
			has_block( 'crowdsignal-forms/applause', $content )
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

		if ( empty( $platform_poll_data ) ) {
			// nothing in the key or key not existing. New poll.
			$platform_poll_data = array(
				'post_id'    => $this->post_id,
				'comment_id' => $this->comment_id,
			);
		} else {
			$platform_poll_data = array_merge(
				$platform_poll_data,
				array(
					'post_id'    => $this->post_id,
					'comment_id' => $this->comment_id,
				)
			);
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
		return update_post_meta( $this->post_id, $this->get_comment_poll_ids_meta_key(), $poll_ids_present_in_content );
	}

	/**
	 * Get the meta key we use for storing the poll ids present on a given comment.
	 *
	 * @since 1.1.0
	 * @return string
	 */
	private function get_comment_poll_ids_meta_key() {
		return self::CROWDSIGNAL_FORMS_POST_COMMENTS_POLL_IDS . $this->comment_id;
	}
}
