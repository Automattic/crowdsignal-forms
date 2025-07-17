<?php
/**
 * Authorization Helper for Crowdsignal Forms REST API
 *
 * @package Crowdsignal_Forms\Rest_Api\Controllers
 * @since 1.7.3
 */

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Authorization Helper Class
 *
 * Provides shared authorization methods for all Crowdsignal Forms REST API controllers.
 */
class Authorization_Helper {

	/**
	 * Check if the current user can edit a specific Crowdsignal item.
	 *
	 * @param int|string $item_id The Crowdsignal item ID (poll, NPS, feedback, etc.).
	 * @param string     $item_type The type of item (poll, nps, feedback, etc.).
	 * @return bool True if user can edit the item, false otherwise.
	 */
	public static function can_user_edit_item( $item_id, $item_type = 'poll' ) {
		// For new items (no ID), check if user can publish posts.
		if ( empty( $item_id ) ) {
			return \current_user_can( 'publish_posts' );
		}

		// Find the post containing this item.
		$post_id = self::find_post_containing_item( $item_id, $item_type );
		if ( ! $post_id ) {
			// If no post found, fall back to publish_posts check.
			return \current_user_can( 'publish_posts' );
		}

		// Check if user can edit the specific post.
		return \current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Check if the current user can edit an item by its client ID (UUID).
	 *
	 * @param string $client_id The client ID (UUID) of the item.
	 * @param int    $post_id   The post ID where the item is located.
	 * @return bool True if user can edit the item, false otherwise.
	 */
	public static function can_user_edit_item_by_client_id( $client_id, $post_id = null ) {
		// For new items (no client_id), check if user can publish posts.
		if ( empty( $client_id ) ) {
			return \current_user_can( 'publish_posts' );
		}

		// If post_id is provided, use it directly.
		if ( $post_id ) {
			return \current_user_can( 'edit_post', $post_id );
		}

		// Find the post containing this client_id.
		$post_id = self::find_post_containing_client_id( $client_id );

		if ( ! $post_id ) {
			// If no post found, fall back to publish_posts check.
			return \current_user_can( 'publish_posts' );
		}

		// Check if user can edit the specific post.
		return \current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Find the post ID that contains a specific Crowdsignal item.
	 *
	 * @param int|string $item_id The Crowdsignal item ID.
	 * @param string     $item_type The type of item (poll, nps, feedback, etc.).
	 * @return int|null The post ID if found, null otherwise.
	 */
	private static function find_post_containing_item( $item_id, $item_type = 'poll' ) {
		// First, try to find the item using the new registry table.
		$post_id = \Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::get_post_id_for_item( $item_id, $item_type );
		if ( $post_id ) {
			return $post_id;
		}
		// Fallback to old methods for backward compatibility.
		global $wpdb;

		// Use caching to avoid repeated expensive queries.
		$cache_key      = "cs_item_{$item_type}_{$item_id}_post_id";
		$cached_post_id = \get_transient( $cache_key );

		if ( false !== $cached_post_id ) {
			return $cached_post_id;
		}

		// For NPS surveys, search in post content since they don't use postmeta.
		if ( 'nps' === $item_type ) {
			$result = self::find_post_containing_nps_survey( $item_id );
			\set_transient( $cache_key, $result, 30 ); // Cache for 30 seconds
			return $result;
		}

		// For feedback surveys, search in post content since they don't use postmeta.
		if ( 'feedback' === $item_type ) {
			$result = self::find_post_containing_feedback_survey( $item_id );
			\set_transient( $cache_key, $result, 30 ); // Cache for 30 seconds.
			return $result;
		}

		// For polls, use a more efficient approach.
		if ( 'poll' === $item_type ) {
			// Fetch rows in batches and check meta_value in PHP to avoid unindexed LIKE queries.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$offset     = 0;
			$batch_size = 2;

			while ( true ) {
				$sql = "SELECT post_id, meta_value FROM {$wpdb->postmeta}
					WHERE meta_key LIKE '_cs_poll_%'
					ORDER BY meta_id DESC
					LIMIT {$batch_size} OFFSET {$offset}";

				$results = $wpdb->get_results( $sql );

				if ( empty( $results ) ) {
					break; // No more results.
				}

				foreach ( $results as $row ) {
					// Check if meta_value contains the item_id.
					if ( strpos( $row->meta_value, '"id";i:' . intval( $item_id ) ) !== false ) {
						$result = intval( $row->post_id );
						\set_transient( $cache_key, $result, 10 ); // Cache for 10 seconds.
						return $result;
					}
				}

				$offset += $batch_size;
			}

			// Not found.
			\set_transient( $cache_key, null, 10 ); // Cache for 10 seconds.
			return null;
		}

		// For other item types, use a similar optimized approach.
		$meta_key_pattern = '_cs_' . $item_type . '_%';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta} 
				WHERE meta_key LIKE %s 
				AND meta_value LIKE %s 
				LIMIT 1",
				$meta_key_pattern,
				'%"id":' . intval( $item_id ) . '%'
			)
		);

		$result = $post_id ? intval( $post_id ) : null;
		\set_transient( $cache_key, $result, 10 ); // Cache for 10 seconds.
		return $result;
	}

	/**
	 * Find the post ID that contains a specific client ID.
	 *
	 * @param string $client_id The client ID (UUID).
	 * @return int|null The post ID if found, null otherwise.
	 */
	private static function find_post_containing_client_id( $client_id ) {
		// Use the existing efficient method from Post_Poll_Meta_Gateway.
		return Crowdsignal_Forms::instance()
			->get_post_poll_meta_gateway()
			->get_post_id_for_client_id( $client_id );
	}

	/**
	 * Find the post ID that contains a specific NPS survey ID by searching post content.
	 *
	 * @param int $survey_id The NPS survey ID.
	 * @return int|null The post ID if found, null otherwise.
	 */
	private static function find_post_containing_nps_survey( $survey_id ) {
		global $wpdb;

		// Use caching to avoid repeated expensive queries.
		$cache_key      = "cs_nps_survey_{$survey_id}_post_id";
		$cached_post_id = \get_transient( $cache_key );

		if ( false !== $cached_post_id ) {
			return $cached_post_id;
		}

		// Search for posts containing NPS blocks with the specific survey ID.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$post = $wpdb->get_row(
			"SELECT ID, post_author FROM {$wpdb->posts} 
			WHERE post_content LIKE '%\"surveyId\":" . intval( $survey_id ) . "%'
			AND post_status IN ('publish', 'draft', 'pending', 'private')
			LIMIT 1"
		);

		$result = $post ? intval( $post->ID ) : null;
		\set_transient( $cache_key, $result, 10 ); // Cache for 10 seconds.

		if ( $result ) {
			\Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::register_item(
				$survey_id,
				'nps',
				$post->ID,
				$post->post_author
			);
		}
		return $result;
	}

	/**
	 * Find the post ID that contains a specific feedback survey ID by searching post content.
	 *
	 * @param int $survey_id The feedback survey ID.
	 * @return int|null The post ID if found, null otherwise.
	 */
	private static function find_post_containing_feedback_survey( $survey_id ) {
		global $wpdb;

		// Use caching to avoid repeated expensive queries.
		$cache_key      = "cs_feedback_survey_{$survey_id}_post_id";
		$cached_post_id = \get_transient( $cache_key );

		if ( false !== $cached_post_id ) {
			return $cached_post_id;
		}

		// Search for posts containing feedback blocks with the specific survey ID.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$post_id = $wpdb->get_var(
			"SELECT ID FROM {$wpdb->posts} 
			WHERE post_content LIKE '%\"surveyId\":" . intval( $survey_id ) . "%'
			AND post_status IN ('publish', 'draft', 'pending', 'private')
			LIMIT 1"
		);

		$result = $post_id ? intval( $post_id ) : null;
		\set_transient( $cache_key, $result, 10 ); // Cache for 10 seconds.
		return $result;
	}

	/**
	 * Check if the current user can edit a post based on post ID from request.
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool True if user can edit the post, false otherwise.
	 */
	public static function can_user_edit_post_from_request( $request ) {
		$post_id = $request->get_param( 'post_id' );

		if ( ! $post_id ) {
			return \current_user_can( 'publish_posts' );
		}

		return \current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Get poll data from post meta and extract the Crowdsignal item ID.
	 *
	 * @param int    $post_id The post ID.
	 * @param string $client_id The client ID (UUID).
	 * @return array|null Poll data if found, null otherwise.
	 */
	public static function get_item_data_from_post_meta( $post_id, $client_id ) {
		$poll_data = Crowdsignal_Forms::instance()
			->get_post_poll_meta_gateway()
			->get_poll_data_for_poll_client_id( $post_id, $client_id );

		return ! empty( $poll_data ) ? $poll_data : null;
	}
}
