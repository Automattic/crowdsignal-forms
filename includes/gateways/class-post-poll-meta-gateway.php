<?php
/**
 * File containing \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway
 *
 * @package crowdsignal-forms/Gateways
 * @since 0.9.0
 */

namespace Crowdsignal_Forms\Gateways;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Post_Poll_Meta_Gateway
 *
 * @package Crowdsignal_Forms\Gateways
 */
class Post_Poll_Meta_Gateway {
	/**
	 * Prefix for meta entries.
	 */
	const META_PREFIX = '_cs_poll_';

	/**
	 * Get a client id's associated poll data.
	 *
	 * @param int|null $post_id   The post we have embedded the poll, or null to search all posts.
	 * @param string   $client_id The uuid we assigned to the poll block.
	 * @return array
	 */
	public function get_poll_data_for_poll_client_id( $post_id, $client_id ) {
		global $wpdb;

		if ( null === $client_id ) {
			return array();
		}

		$poll_meta_key = $this->get_poll_meta_key( $client_id );

		if ( null === $post_id ) {
			// Search across all posts for this client_id.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
			$row = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s LIMIT 1",
					$poll_meta_key
				)
			);

			if ( $row && ! empty( $row->meta_value ) ) {
				$data = maybe_unserialize( $row->meta_value );
				return is_array( $data ) ? $data : array();
			}

			return array();
		}

		$meta_value = get_post_meta( $post_id, $poll_meta_key, true );

		return is_array( $meta_value ) ? $meta_value : array();
	}

	/**
	 * Update a client id's associated poll data.
	 *
	 * @param int    $post_id   The post.
	 * @param string $client_id The client id.
	 * @param array  $data      Data as array.
	 *
	 * @return bool|int
	 */
	public function update_poll_data_for_client_id( $post_id, $client_id, $data ) {
		return update_post_meta( $post_id, $this->get_poll_meta_key( $client_id ), $data );
	}

	/**
	 * Return the meta key for a poll block client ID.
	 *
	 * @param string $poll_id_on_block The client id.
	 * @return string
	 */
	private function get_poll_meta_key( $poll_id_on_block ) {
		return self::META_PREFIX . $poll_id_on_block;
	}

	/**
	 * Get the original location (post and/or comment) where a client_id is mapped.
	 *
	 * Algorithm:
	 * 1. Find _cs_poll_{client_id} meta → gives post_id + poll_id
	 * 2. Check if poll_id is in _crowdsignal_forms_poll_ids on that post
	 * 3. If yes → originated in post
	 * 4. If no → scan _crowdsignal_forms_comment_poll_ids_{*} to find comment
	 *
	 * @since 1.8.0
	 *
	 * @param string $client_id The poll client ID.
	 * @return array{post_id: int|null, comment_id: int|null} The original location.
	 */
	public function get_original_location_for_client_id( $client_id ) {
		global $wpdb;

		$poll_meta_key = $this->get_poll_meta_key( $client_id );

		// Step 1: Get the meta row (post_id + meta_value with poll_id).
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$result = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s LIMIT 1",
				$poll_meta_key
			)
		);

		if ( ! $result ) {
			return array(
				'post_id'    => null,
				'comment_id' => null,
			);
		}

		$post_id   = (int) $result->post_id;
		$poll_data = maybe_unserialize( $result->meta_value );
		$poll_id   = isset( $poll_data['id'] ) ? (int) $poll_data['id'] : 0;

		if ( ! $poll_id ) {
			// No platform poll_id yet - poll hasn't been synced.
			return array(
				'post_id'    => $post_id,
				'comment_id' => null,
			);
		}

		// Step 2: Check if poll_id is in post's _crowdsignal_forms_poll_ids.
		$post_poll_ids = get_post_meta( $post_id, '_crowdsignal_forms_poll_ids', true );
		if ( is_array( $post_poll_ids ) && in_array( $poll_id, $post_poll_ids, true ) ) {
			// Poll is in the post directly.
			return array(
				'post_id'    => $post_id,
				'comment_id' => null,
			);
		}

		// Step 3: Scan comment poll metas to find which comment has this poll_id.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$comment_metas = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT meta_key, meta_value FROM {$wpdb->postmeta}
				 WHERE post_id = %d AND meta_key LIKE %s AND meta_value LIKE %s",
				$post_id,
				$wpdb->esc_like( '_crowdsignal_forms_comment_poll_ids_' ) . '%',
				'%' . $wpdb->esc_like( ':' . $poll_id . ';' ) . '%'
			)
		);

		foreach ( $comment_metas as $meta ) {
			$comment_poll_ids = maybe_unserialize( $meta->meta_value );
			if ( is_array( $comment_poll_ids ) && in_array( $poll_id, $comment_poll_ids, true ) ) {
				// Extract comment_id from meta_key suffix.
				$comment_id = (int) str_replace( '_crowdsignal_forms_comment_poll_ids_', '', $meta->meta_key );
				return array(
					'post_id'    => $post_id,
					'comment_id' => $comment_id,
				);
			}
		}

		// Fallback: poll_id not found in either - treat as post origin.
		return array(
			'post_id'    => $post_id,
			'comment_id' => null,
		);
	}
}
