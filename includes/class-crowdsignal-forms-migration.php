<?php
/**
 * Crowdsignal Forms Migration
 *
 * Handles UUID postmeta migration for existing Crowdsignal blocks.
 *
 * @package Crowdsignal_Forms
 * @since 1.8.0
 */

namespace Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Migration Class
 *
 * @since 1.8.0
 */
class Crowdsignal_Forms_Migration {

	/**
	 * Migration version.
	 *
	 * @var string
	 */
	const MIGRATION_VERSION = '1.0';

	/**
	 * Option name for tracking migration status.
	 *
	 * @var string
	 */
	const MIGRATION_OPTION = 'crowdsignal_forms_items_migration_version';

	/**
	 * Run the migration if needed.
	 *
	 * @since 1.8.0
	 * @return bool True if migration was successful or not needed, false on failure.
	 */
	public static function maybe_migrate() {

		$current_version = \get_option( self::MIGRATION_OPTION, '0.0' );

		if ( version_compare( $current_version, self::MIGRATION_VERSION, '>=' ) ) {
			return true; // Migration already completed.
		}

		if ( ! \is_admin() ) {
			return false;
		}

		// Run UUID postmeta migration only.
		return self::migrate_uuid_postmeta();
	}

	/**
	 * Get migration status.
	 *
	 * @since 1.8.0
	 * @return string Current migration version.
	 */
	public static function get_migration_status() {
		return \get_option( self::MIGRATION_OPTION, '0.0' );
	}

	/**
	 * Find posts containing specific blocks.
	 *
	 * @since 1.8.0
	 * @param string $block_name The block name to search for.
	 * @return array Array of post objects.
	 */
	private static function find_posts_with_blocks( $block_name ) {
		global $wpdb;

		$sql   = "SELECT ID, post_author, post_content FROM {$wpdb->posts}
			WHERE post_content LIKE '%" . $wpdb->esc_like( $block_name ) . "%'
			AND post_status IN ('publish', 'draft', 'pending', 'private')
			ORDER BY ID DESC";
		$posts = $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.NoCaching

		return $posts ? $posts : array();
	}

	/**
	 * Migrate existing NPS and Feedback blocks to use UUID postmeta.
	 *
	 * This migration creates UUID postmeta for existing NPS and Feedback blocks
	 * that have surveyId but no clientId, enabling the new UUID-based authorization system.
	 *
	 * @since 1.9.0
	 * @return bool True on success, false on failure.
	 */
	private static function migrate_uuid_postmeta() {
		$migrated_count = 0;
		$errors         = array();

		// Generate UUIDs for existing NPS blocks without clientId.
		$nps_posts = self::find_posts_with_blocks( 'crowdsignal-forms/nps' );
		foreach ( $nps_posts as $post ) {
			$result = self::create_uuid_postmeta_for_post( $post, 'nps' );
			if ( is_wp_error( $result ) ) {
				$errors[] = "Failed to migrate NPS UUIDs for post {$post->ID}: " . $result->get_error_message();
			} else {
				$migrated_count += $result;
			}
		}

		// Generate UUIDs for existing Feedback blocks without clientId.
		$feedback_posts = self::find_posts_with_blocks( 'crowdsignal-forms/feedback' );
		foreach ( $feedback_posts as $post ) {
			$result = self::create_uuid_postmeta_for_post( $post, 'feedback' );
			if ( is_wp_error( $result ) ) {
				$errors[] = "Failed to migrate Feedback UUIDs for post {$post->ID}: " . $result->get_error_message();
			} else {
				$migrated_count += $result;
			}
		}

		// Log any errors encountered during migration.
		if ( ! empty( $errors ) ) {
			\error_log( 'Crowdsignal Forms UUID Migration Errors: ' . implode( ', ', $errors ) );
		}

		// Log migration success.
		if ( $migrated_count > 0 ) {
			\error_log( "Crowdsignal Forms UUID Migration: Created {$migrated_count} UUID postmeta records" );
		}

		return true; // Always return true to avoid blocking the migration.
	}

	/**
	 * Create UUID postmeta for NPS/Feedback blocks in a specific post.
	 *
	 * @since 1.9.0
	 * @param \WP_Post $post The post object.
	 * @param string   $block_type The block type ('nps' or 'feedback').
	 * @return int|\WP_Error Number of postmeta records created, or WP_Error on failure.
	 */
	private static function create_uuid_postmeta_for_post( $post, $block_type ) {
		$blocks        = \parse_blocks( $post->post_content );
		$created_count = 0;

		foreach ( $blocks as $block ) {
			$result = self::process_block_for_uuid_migration( $block, $post->ID, $block_type );
			if ( is_wp_error( $result ) ) {
				return $result;
			}
			$created_count += $result;
		}

		return $created_count;
	}

	/**
	 * Process a block recursively for UUID migration.
	 *
	 * @since 1.9.0
	 * @param array  $block The block data.
	 * @param int    $post_id The post ID.
	 * @param string $block_type The block type ('nps' or 'feedback').
	 * @return int|\WP_Error Number of postmeta records created, or WP_Error on failure.
	 */
	private static function process_block_for_uuid_migration( $block, $post_id, $block_type ) {
		$created_count = 0;
		$block_name    = "crowdsignal-forms/{$block_type}";

		// Process the current block if it matches our target type.
		if ( $block_name === $block['blockName'] &&
			! empty( $block['attrs']['surveyId'] ) &&
			empty( $block['attrs']['clientId'] ) ) {

			// Generate a new UUID for this block.
			$client_uuid = self::generate_uuid();
			$meta_key    = "_cs_{$block_type}_{$client_uuid}";

			// Check if postmeta already exists for this surveyId.
			$existing_meta = self::find_existing_uuid_meta( $post_id, $block_type, $block['attrs']['surveyId'] );
			if ( ! $existing_meta ) {
				$meta_value = array(
					'surveyId' => $block['attrs']['surveyId'],
					'clientId' => $client_uuid,
					'title'    => $block['attrs']['title'] ?? '',
				);

				$result = \update_post_meta( $post_id, $meta_key, $meta_value );
				if ( $result ) {
					++$created_count;
				}
			}
		}

		// Process inner blocks recursively.
		if ( ! empty( $block['innerBlocks'] ) ) {
			foreach ( $block['innerBlocks'] as $inner_block ) {
				$result = self::process_block_for_uuid_migration( $inner_block, $post_id, $block_type );
				if ( is_wp_error( $result ) ) {
					return $result;
				}
				$created_count += $result;
			}
		}

		return $created_count;
	}

	/**
	 * Check if UUID postmeta already exists for a surveyId.
	 *
	 * @since 1.9.0
	 * @param int    $post_id The post ID.
	 * @param string $block_type The block type ('nps' or 'feedback').
	 * @param int    $survey_id The survey ID to check.
	 * @return array|null Existing meta value if found, null otherwise.
	 */
	private static function find_existing_uuid_meta( $post_id, $block_type, $survey_id ) {
		$meta_prefix = "_cs_{$block_type}_";
		$all_meta    = \get_post_meta( $post_id );

		foreach ( $all_meta as $key => $values ) {
			if ( strpos( $key, $meta_prefix ) === 0 ) {
				$meta_data = maybe_unserialize( $values[0] );
				if ( is_array( $meta_data ) &&
					isset( $meta_data['surveyId'] ) &&
					intval( $meta_data['surveyId'] ) === intval( $survey_id ) ) {
					return $meta_data;
				}
			}
		}

		return null;
	}

	/**
	 * Generate a UUID v4.
	 *
	 * @since 1.9.0
	 * @return string A UUID v4 string.
	 */
	private static function generate_uuid() {
		// Generate UUID v4 using PHP's built-in functions.
		$data    = random_bytes( 16 );
		$data[6] = chr( ord( $data[6] ) & 0x0f | 0x40 ); // Version 4.
		$data[8] = chr( ord( $data[8] ) & 0x3f | 0x80 ); // Variant bits.

		return sprintf(
			'%08x-%04x-%04x-%04x-%012x',
			unpack( 'N', substr( $data, 0, 4 ) )[1],
			unpack( 'n', substr( $data, 4, 2 ) )[1],
			unpack( 'n', substr( $data, 6, 2 ) )[1],
			unpack( 'n', substr( $data, 8, 2 ) )[1],
			unpack( 'N', substr( $data, 10, 4 ) )[1] . unpack( 'n', substr( $data, 14, 2 ) )[1]
		);
	}

	/**
	 * Reset migration status (for testing).
	 *
	 * @since 1.8.0
	 */
	public static function reset_migration() {
		\delete_option( self::MIGRATION_OPTION );
	}
}
