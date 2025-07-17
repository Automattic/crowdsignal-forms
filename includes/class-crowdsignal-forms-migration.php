<?php
/**
 * Crowdsignal Forms Migration
 *
 * Handles migration of existing Crowdsignal items to the new registry table.
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

		// Only run if in wp-admin to reduce load.
		if ( ! \is_admin() ) {
			return false;
		}

		if ( version_compare( $current_version, self::MIGRATION_VERSION, '>=' ) ) {
			return true; // Migration already completed.
		}

		return self::migrate_items_to_registry();
	}

	/**
	 * Migrate existing items to the registry.
	 *
	 * @since 1.8.0
	 * @return bool True on success, false on failure.
	 */
	private static function migrate_items_to_registry() {
		global $wpdb;

		// Check if registry table exists.
		if ( ! Crowdsignal_Forms_Item_Registry::table_exists() ) {
			return false;
		}

		$migrated_count = 0;
		$errors         = array();

		// Migrate polls from postmeta.
		$poll_meta_keys = $wpdb->get_col(
			"SELECT meta_key FROM {$wpdb->postmeta} WHERE meta_key LIKE '_cs_poll_%'"
		);

		foreach ( $poll_meta_keys as $meta_key ) {
			$client_id = str_replace( '_cs_poll_', '', $meta_key );

			// Get post ID for this poll.
			$post_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s LIMIT 1",
					$meta_key
				)
			);

			if ( ! $post_id ) {
				continue;
			}

			// Get poll data.
			$poll_data = \get_post_meta( $post_id, $meta_key, true );

			if ( ! is_array( $poll_data ) || empty( $poll_data['id'] ) ) {
				continue;
			}

			// Get post author.
			$post = \get_post( $post_id );
			if ( ! $post ) {
				continue;
			}

			// Register the poll.
			$result = Crowdsignal_Forms_Item_Registry::register_item(
				$poll_data['id'],
				'poll',
				$post_id,
				$post->post_author
			);

			if ( $result ) {
				$migrated_count++;
			} else {
				$errors[] = "Failed to migrate poll {$poll_data['id']} from post {$post_id}";
			}
		}

		// Migrate NPS blocks from post content.
		$nps_posts = self::find_posts_with_blocks( 'crowdsignal-forms/nps' );
		foreach ( $nps_posts as $post ) {
			$nps_items = self::extract_nps_items_from_post( $post );

			foreach ( $nps_items as $item ) {
				$result = Crowdsignal_Forms_Item_Registry::register_item(
					$item['surveyId'],
					'nps',
					$post->ID,
					$post->post_author
				);

				if ( $result ) {
					++$migrated_count;
				} else {
					$errors[] = "Failed to migrate NPS {$item['surveyId']} from post {$post->ID}";
				}
			}
		}

		// Migrate feedback blocks from post content.
		$feedback_posts = self::find_posts_with_blocks( 'crowdsignal-forms/feedback' );
		foreach ( $feedback_posts as $post ) {
			$feedback_items = self::extract_feedback_items_from_post( $post );

			foreach ( $feedback_items as $item ) {
				$result = Crowdsignal_Forms_Item_Registry::register_item(
					$item['surveyId'],
					'feedback',
					$post->ID,
					$post->post_author
				);

				if ( $result ) {
					++$migrated_count;
				} else {
					$errors[] = "Failed to migrate feedback {$item['surveyId']} from post {$post->ID}";
				}
			}
		}

		// Log migration results.
		if ( ! empty( $errors ) ) {
			\error_log( 'Crowdsignal Forms Migration Errors: ' . implode( ', ', $errors ) );
		}

		// Update migration version.
		\update_option( self::MIGRATION_OPTION, self::MIGRATION_VERSION );

		return true;
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

		$posts = $wpdb->get_results(
			"SELECT ID, post_author, post_content FROM {$wpdb->posts} 
			WHERE post_content LIKE '%" . $wpdb->esc_like( $block_name ) . "%'
			AND post_status IN ('publish', 'draft', 'pending', 'private')
			ORDER BY ID DESC"
		);

		return $posts ? $posts : array();
	}

	/**
	 * Extract NPS items from post content.
	 *
	 * @since 1.8.0
	 * @param \WP_Post $post The post object.
	 * @return array Array of NPS items with surveyId.
	 */
	private static function extract_nps_items_from_post( $post ) {
		$items  = array();
		$blocks = \parse_blocks( $post->post_content );

		foreach ( $blocks as $block ) {
			if ( 'crowdsignal-forms/nps' === $block['blockName'] && ! empty( $block['attrs']['surveyId'] ) ) {
				$items[] = array(
					'surveyId' => $block['attrs']['surveyId'],
				);
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = self::extract_nps_items_from_blocks( $block['innerBlocks'] );
				$items       = array_merge( $items, $inner_items );
			}
		}

		return $items;
	}

	/**
	 * Extract feedback items from post content.
	 *
	 * @since 1.8.0
	 * @param \WP_Post $post The post object.
	 * @return array Array of feedback items with surveyId.
	 */
	private static function extract_feedback_items_from_post( $post ) {
		$items = array();
		$blocks = \parse_blocks( $post->post_content );

		foreach ( $blocks as $block ) {
			if ( 'crowdsignal-forms/feedback' === $block['blockName'] && ! empty( $block['attrs']['surveyId'] ) ) {
				$items[] = array(
					'surveyId' => $block['attrs']['surveyId'],
				);
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = self::extract_feedback_items_from_blocks( $block['innerBlocks'] );
				$items       = array_merge( $items, $inner_items );
			}
		}

		return $items;
	}

	/**
	 * Extract NPS items from blocks recursively.
	 *
	 * @since 1.8.0
	 * @param array $blocks Array of blocks.
	 * @return array Array of NPS items.
	 */
	private static function extract_nps_items_from_blocks( $blocks ) {
		$items = array();

		foreach ( $blocks as $block ) {
			if ( 'crowdsignal-forms/nps' === $block['blockName'] && ! empty( $block['attrs']['surveyId'] ) ) {
				$items[] = array(
					'surveyId' => $block['attrs']['surveyId'],
				);
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = self::extract_nps_items_from_blocks( $block['innerBlocks'] );
				$items       = array_merge( $items, $inner_items );
			}
		}

		return $items;
	}

	/**
	 * Extract feedback items from blocks recursively.
	 *
	 * @since 1.8.0
	 * @param array $blocks Array of blocks.
	 * @return array Array of feedback items.
	 */
	private static function extract_feedback_items_from_blocks( $blocks ) {
		$items = array();

		foreach ( $blocks as $block ) {
			if ( 'crowdsignal-forms/feedback' === $block['blockName'] && ! empty( $block['attrs']['surveyId'] ) ) {
				$items[] = array(
					'surveyId' => $block['attrs']['surveyId'],
				);
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = self::extract_feedback_items_from_blocks( $block['innerBlocks'] );
				$items = array_merge( $items, $inner_items );
			}
		}

		return $items;
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
	 * Reset migration status (for testing).
	 *
	 * @since 1.8.0
	 */
	public static function reset_migration() {
		\delete_option( self::MIGRATION_OPTION );
	}
} 