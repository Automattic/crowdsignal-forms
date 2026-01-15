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
			return false; // if the item is not found, the user cannot edit it.
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
		$post_id = self::get_post_id_for_client_id( $client_id );

		if ( ! $post_id ) {
			return false; // if the item is not found, the user cannot edit it.
		}

		// Check if user can edit the specific post.
		return \current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Get the post ID for a client ID.
	 *
	 * @param string $client_id The client ID (UUID).
	 * @return int|null The post ID if found, null otherwise.
	 */
	public static function get_post_id_for_client_id( $client_id ) {
		// Extract the item uuid and item type from the client id.
		$item_uuid = self::extract_item_uuid_from_client_id( $client_id );
		$item_type = self::extract_item_type_from_client_id( $client_id );

		// Find the post containing this client_id.
		return self::find_post_by_item_uuid( $item_uuid, $item_type );
	}

	/**
	 * Extract the item uuid from the client id.
	 *
	 * @param string $client_id The client ID (UUID).
	 * @return string The item UUID.
	 */
	public static function extract_item_uuid_from_client_id( $client_id ) {
		// client_id is in the format of "cs_<item_type>_<uuid>".
		return substr( $client_id, strrpos( $client_id, '_' ) + 1 );
	}

	/**
	 * Extract the item type from the client id.
	 *
	 * @param string $client_id The client ID (UUID).
	 * @return string The item type.
	 */
	public static function extract_item_type_from_client_id( $client_id ) {
		// client_id is in the format of "cs_<item_type>_<uuid>".
		return substr( $client_id, 3, strrpos( $client_id, '_' ) - 3 );
	}

	/**
	 * Validate if a string is a valid UUID format.
	 *
	 * @param string $uuid The UUID string to validate.
	 * @return bool True if valid UUID format, false otherwise.
	 */
	public static function is_valid_uuid( $uuid ) {
		if ( ! is_string( $uuid ) ) {
			return false;
		}

		// UUID v4 pattern: 8-4-4-4-12 hex characters with dashes.
		$pattern = '/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i';
		return (bool) preg_match( $pattern, $uuid );
	}

	/**
	 * Find the post ID that contains a specific item by its UUID.
	 *
	 * @param string $item_uuid The item UUID.
	 * @param string $item_type The item type (nps, feedback, poll).
	 * @return int|null The post ID if found, null otherwise.
	 */
	public static function find_post_by_item_uuid( $item_uuid, $item_type ) {
		if ( ! self::is_valid_uuid( $item_uuid ) ) {
			return null;
		}

		// Use caching to avoid repeated queries.
		$cache_key      = "cs_{$item_type}_uuid_{$item_uuid}_post_id";
		$cached_post_id = \get_transient( $cache_key );

		if ( false !== $cached_post_id ) {
			return $cached_post_id;
		}

		// All item types use the same postmeta format: _cs_{item_type}_{uuid}.
		$meta_key = "_cs_{$item_type}_{$item_uuid}";
		$posts    = \get_posts(
			array(
				'meta_key'       => $meta_key,
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
				'post_type'      => 'any',
			)
		);

		$result = ! empty( $posts ) ? $posts[0] : null;
		\set_transient( $cache_key, $result, 30 ); // Cache for 30 seconds.

		return $result;
	}

	/**
	 * Get item data from UUID postmeta.
	 *
	 * @param string $item_uuid The item UUID.
	 * @param string $item_type The item type (nps, feedback, poll).
	 * @return array|null The item data if found, null otherwise.
	 */
	public static function get_item_data_by_uuid( $item_uuid, $item_type ) {
		$post_id = self::find_post_by_item_uuid( $item_uuid, $item_type );

		if ( ! $post_id ) {
			return null;
		}

		$meta_key  = "_cs_{$item_type}_{$item_uuid}";
		$item_data = \get_post_meta( $post_id, $meta_key, true );

		return is_array( $item_data ) ? $item_data : null;
	}

	/**
	 * Convert UUID to sequential ID for API calls.
	 *
	 * @param string $item_uuid The item UUID.
	 * @param string $item_type The item type (nps, feedback, poll).
	 * @return int|null The sequential ID if found, null otherwise.
	 */
	public static function convert_uuid_to_sequential_id( $item_uuid, $item_type ) {
		$item_data = self::get_item_data_by_uuid( $item_uuid, $item_type );

		if ( ! $item_data ) {
			return null;
		}

		if ( 'poll' === $item_type ) {
			if ( empty( $item_data['id'] ) ) {
				return null;
			}

			return intval( $item_data['id'] );
		}

		if ( empty( $item_data['surveyId'] ) ) {
			return null;
		}

		return intval( $item_data['surveyId'] );
	}

	/**
	 * Check if a user can edit an item by its UUID.
	 *
	 * @param string $item_uuid The item UUID.
	 * @param string $item_type The item type (nps, feedback, poll).
	 * @return bool True if user can edit, false otherwise.
	 */
	public static function can_user_edit_item_by_uuid( $item_uuid, $item_type ) {
		// Use the unified UUID lookup method for all item types.
		$post_id = self::find_post_by_item_uuid( $item_uuid, $item_type );

		if ( ! $post_id ) {
			return false;
		}

		return \current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Check if a user can edit an item in a specific post.
	 *
	 * @param int    $post_id   The post ID.
	 * @param string $item_uuid The item UUID.
	 * @param string $item_type The item type (nps, feedback, poll).
	 * @return bool True if user can edit and item exists in post, false otherwise.
	 */
	public static function can_user_edit_item_in_post( $post_id, $item_uuid, $item_type ) {
		// First check if user can edit the post.
		if ( ! \current_user_can( 'edit_post', $post_id ) ) {
			return false;
		}

		// Then verify the item actually exists in that post.
		return self::item_exists_in_post( $post_id, $item_uuid, $item_type );
	}

	/**
	 * Find the post ID that contains a specific Crowdsignal item.
	 *
	 * @param int|string $item_id The Crowdsignal item ID.
	 * @param string     $item_type The type of item (poll, nps, feedback, etc.).
	 * @return int|null The post ID if found, null otherwise.
	 */
	private static function find_post_containing_item( $item_id, $item_type = 'poll' ) {
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
			\set_transient( $cache_key, $result, 30 ); // Cache for 30 seconds.
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
				$sql = 'SELECT post_id, meta_value FROM ' . $wpdb->postmeta . '
					WHERE meta_key LIKE "_cs_poll_%"
					ORDER BY meta_id DESC
					LIMIT ' . $batch_size . ' OFFSET ' . $offset;

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.NoCaching
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
	 * Check if a specific item UUID exists in a given post.
	 *
	 * @param int    $post_id   The post ID to check.
	 * @param string $item_uuid The item UUID to look for.
	 * @param string $item_type The item type (nps, feedback, poll).
	 * @return bool True if the item exists in the post, false otherwise.
	 */
	public static function item_exists_in_post( $post_id, $item_uuid, $item_type ) {
		if ( ! $post_id || ! $item_uuid || ! $item_type ) {
			return false;
		}

		// Check if the item's postmeta exists for this specific post.
		$meta_key   = "_cs_{$item_type}_{$item_uuid}";
		$meta_value = \get_post_meta( $post_id, $meta_key, true );

		return ! empty( $meta_value );
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
