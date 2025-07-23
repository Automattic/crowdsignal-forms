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

		if ( version_compare( $current_version, self::MIGRATION_VERSION, '>=' ) ) {
			return true; // Migration already completed.
		}

		if ( ! \is_admin() ) {
			return false;
		}

		// Check if we need to create the table.
		if ( ! Crowdsignal_Forms_Item_Registry::table_exists() ) {
			Crowdsignal_Forms_Item_Registry::create_table();
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

		// Migrate polls from posts that contain poll blocks.
		$poll_posts = self::find_posts_with_blocks( 'crowdsignal-forms/poll' );
		foreach ( $poll_posts as $post ) {
			$poll_items = self::extract_poll_items_from_post( $post );

			foreach ( $poll_items as $item ) {
				$result = Crowdsignal_Forms_Item_Registry::register_item(
					$item['poll_id'],
					'poll',
					$post->ID,
					$post->post_author
				);

				if ( $result ) {
					++$migrated_count;
				} else {
					$errors[] = "Failed to migrate poll {$item['poll_id']} from post {$post->ID}";
				}
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
			\error_log( 'Crowdsignal Forms Migration Errors: ' . implode( ', ', $errors ) ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
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

		$sql   = "SELECT ID, post_author, post_content FROM {$wpdb->posts}
			WHERE post_content LIKE '%" . $wpdb->esc_like( $block_name ) . "%'
			AND post_status IN ('publish', 'draft', 'pending', 'private')
			ORDER BY ID DESC";
		$posts = $wpdb->get_results( $sql ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.NoCaching

		return $posts ? $posts : array();
	}

	/**
	 * Extract poll items from post content.
	 *
	 * @since 1.8.0
	 * @param \WP_Post $post The post object.
	 * @return array Array of poll items with poll_id.
	 */
	private static function extract_poll_items_from_post( $post ) {
		$items  = array();
		$blocks = \parse_blocks( $post->post_content );

		foreach ( $blocks as $block ) {
			if ( 'crowdsignal-forms/poll' === $block['blockName'] && ! empty( $block['attrs']['pollId'] ) ) {
				$client_id = $block['attrs']['pollId'];

				// Get poll data from postmeta using the client ID.
				$poll_data = \get_post_meta( $post->ID, "_cs_poll_{$client_id}", true );

				// Only migrate if we have valid poll data AND the block exists in the post content.
				if ( is_array( $poll_data ) && ! empty( $poll_data['id'] ) ) {
					$items[] = array(
						'poll_id' => $poll_data['id'],
					);
				}
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = self::extract_poll_items_from_blocks( $block['innerBlocks'], $post->ID );
				$items       = array_merge( $items, $inner_items );
			}
		}

		return $items;
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
		$items  = array();
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
	 * Extract poll items from blocks recursively.
	 *
	 * @since 1.8.0
	 * @param array $blocks Array of blocks.
	 * @param int   $post_id The post ID for looking up postmeta.
	 * @return array Array of poll items.
	 */
	private static function extract_poll_items_from_blocks( $blocks, $post_id ) {
		$items = array();

		foreach ( $blocks as $block ) {
			if ( 'crowdsignal-forms/poll' === $block['blockName'] && ! empty( $block['attrs']['pollId'] ) ) {
				$client_id = $block['attrs']['pollId'];

				// Get poll data from postmeta using the client ID.
				$poll_data = \get_post_meta( $post_id, "_cs_poll_{$client_id}", true );

				// Only migrate if we have valid poll data AND the block exists in the post content.
				if ( is_array( $poll_data ) && ! empty( $poll_data['id'] ) ) {
					$items[] = array(
						'poll_id' => $poll_data['id'],
					);
				}
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = self::extract_poll_items_from_blocks( $block['innerBlocks'], $post_id );
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
				$items       = array_merge( $items, $inner_items );
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
