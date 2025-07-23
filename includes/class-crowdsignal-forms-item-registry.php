<?php
/**
 * Crowdsignal Forms Item Registry
 *
 * Manages ownership tracking for all Crowdsignal items (polls, NPS, feedback, etc.)
 * using a dedicated database table for fast, indexed lookups.
 *
 * @package Crowdsignal_Forms
 * @since 1.8.0
 */

namespace Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Item Registry Class
 *
 * @since 1.8.0
 */
class Crowdsignal_Forms_Item_Registry {

	/**
	 * Table name for the items registry.
	 *
	 * @var string
	 */
	const TABLE_NAME = 'crowdsignal_forms_items';

	/**
	 * Check if the registry is disabled via constant.
	 *
	 * @since 1.8.0
	 * @return bool True if registry is disabled, false otherwise.
	 */
	public static function is_disabled() {
		return defined( 'CROWDSIGNAL_FORMS_DISABLE_REGISTRY' ) && CROWDSIGNAL_FORMS_DISABLE_REGISTRY;
	}

	/**
	 * Get the full table name with WordPress prefix.
	 *
	 * @return string
	 */
	private static function get_table_name() {
		global $wpdb;
		return $wpdb->prefix . self::TABLE_NAME;
	}

	/**
	 * Create the items registry table.
	 *
	 * @since 1.8.0
	 * @return bool True on success, false on failure.
	 */
	public static function create_table() {
		global $wpdb;

		$table_name = self::get_table_name();
		$charset_collate = $wpdb->get_charset_collate();

		$sql = "CREATE TABLE $table_name (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			item_id bigint(20) unsigned NOT NULL,
			item_type varchar(20) NOT NULL,
			post_id bigint(20) unsigned NOT NULL,
			user_id bigint(20) unsigned NOT NULL,
			created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			PRIMARY KEY (id),
			UNIQUE KEY item_lookup (item_id, item_type),
			KEY post_lookup (post_id),
			KEY user_lookup (user_id),
			KEY type_lookup (item_type)
		) $charset_collate;";

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		$result = \dbDelta( $sql );

		// Check if table was created successfully.
		$table_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name;

		if ( $table_exists ) {
			\update_option( 'crowdsignal_forms_items_table_version', '1.0' );
		}

		return $table_exists;
	}

	/**
	 * Drop the items registry table.
	 *
	 * @since 1.8.0
	 * @return bool True on success, false on failure.
	 */
	public static function drop_table() {
		global $wpdb;

		$table_name = self::get_table_name();
		$result     = $wpdb->query( "DROP TABLE IF EXISTS $table_name" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.SchemaChange

		if ( false !== $result ) {
			\delete_option( 'crowdsignal_forms_items_table_version' );
			return true;
		}

		return false;
	}

	/**
	 * Get the post ID that contains a specific item.
	 *
	 * @since 1.8.0
	 * @param int    $item_id   The item ID.
	 * @param string $item_type The item type (poll, nps, feedback, vote, applause).
	 * @return int|null The post ID if found, null otherwise.
	 */
	public static function get_post_id_for_item( $item_id, $item_type ) {
		global $wpdb;

		$table_name = self::get_table_name();

		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT post_id FROM $table_name WHERE item_id = %d AND item_type = %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$item_id,
				$item_type
			)
		);

		$result = $post_id ? intval( $post_id ) : null;

		return $result;
	}

	/**
	 * Get all items for a specific post.
	 *
	 * @since 1.8.0
	 * @param int    $post_id   The post ID.
	 * @param string $item_type Optional. Filter by item type.
	 * @return array Array of item records.
	 */
	public static function get_items_for_post( $post_id, $item_type = null ) {
		global $wpdb;

		$table_name = self::get_table_name();

		if ( $item_type ) {
			$items = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM $table_name WHERE post_id = %d AND item_type = %s ORDER BY created_at DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$post_id,
					$item_type
				),
				ARRAY_A
			);
		} else {
			$items = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM $table_name WHERE post_id = %d ORDER BY created_at DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$post_id
				),
				ARRAY_A
			);
		}

		return $items ? $items : array();
	}

	/**
	 * Get all items for a specific user.
	 *
	 * @since 1.8.0
	 * @param int    $user_id   The user ID.
	 * @param string $item_type Optional. Filter by item type.
	 * @return array Array of item records.
	 */
	public static function get_items_for_user( $user_id, $item_type = null ) {
		global $wpdb;

		$table_name = self::get_table_name();

		if ( $item_type ) {
			$items = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM $table_name WHERE user_id = %d AND item_type = %s ORDER BY created_at DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$user_id,
					$item_type
				),
				ARRAY_A
			);
		} else {
			$items = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT * FROM $table_name WHERE user_id = %d ORDER BY created_at DESC", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					$user_id
				),
				ARRAY_A
			);
		}

		return $items ? $items : array();
	}

	/**
	 * Register a single item.
	 *
	 * @since 1.8.0
	 * @param int    $item_id   The item ID.
	 * @param string $item_type The item type.
	 * @param int    $post_id   The post ID.
	 * @param int    $user_id   The user ID.
	 * @return bool True on success, false on failure.
	 */
	public static function register_item( $item_id, $item_type, $post_id, $user_id ) {
		global $wpdb;

		$table_name = self::get_table_name();

		// Check if item already exists.
		$existing = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM $table_name WHERE item_id = %d AND item_type = %s LIMIT 1", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$item_id,
				$item_type
			)
		);

		if ( $existing ) {
			// Update existing record.
			$result = $wpdb->update(
				$table_name,
				array(
					'post_id'   => $post_id,
					'user_id'   => $user_id,
					'updated_at' => \current_time( 'mysql' ),
				),
				array(
					'item_id'   => $item_id,
					'item_type' => $item_type,
				),
				array( '%d', '%d', '%s' ),
				array( '%d', '%s' )
			);
		} else {
			// Insert new record.
			$result = $wpdb->insert(
				$table_name,
				array(
					'item_id'   => $item_id,
					'item_type' => $item_type,
					'post_id'   => $post_id,
					'user_id'   => $user_id,
				),
				array( '%d', '%s', '%d', '%d' )
			);
		}

		if ( false !== $result ) {
			return true;
		}

		return false;
	}

	/**
	 * Unregister a single item.
	 *
	 * @since 1.8.0
	 * @param int    $item_id   The item ID.
	 * @param string $item_type The item type.
	 * @return bool True on success, false on failure.
	 */
	public static function unregister_item( $item_id, $item_type ) {
		global $wpdb;

		$table_name = self::get_table_name();

		$result = $wpdb->delete(
			$table_name,
			array(
				'item_id'   => $item_id,
				'item_type' => $item_type,
			),
			array( '%d', '%s' )
		);

		if ( false !== $result ) {
			return true;
		}

		return false;
	}

	/**
	 * Register multiple items for a post.
	 *
	 * @since 1.8.0
	 * @param int   $post_id The post ID.
	 * @param array $items   Array of items with keys: item_id, item_type.
	 * @param int   $user_id The user ID.
	 * @return bool True on success, false on failure.
	 */
	public static function register_items_for_post( $post_id, $items, $user_id ) {
		global $wpdb;

		$wpdb->query( 'START TRANSACTION' );

		try {
			foreach ( $items as $item ) {
				$result = self::register_item( $item['item_id'], $item['item_type'], $post_id, $user_id );
				if ( ! $result ) {
					$wpdb->query( 'ROLLBACK' );
					return false;
				}
			}

			$wpdb->query( 'COMMIT' );
			return true;
		} catch ( Exception $e ) {
			$wpdb->query( 'ROLLBACK' );
			return false;
		}
	}

	/**
	 * Unregister all items for a post.
	 *
	 * @since 1.8.0
	 * @param int $post_id The post ID.
	 * @return bool True on success, false on failure.
	 */
	public static function unregister_items_for_post( $post_id ) {
		global $wpdb;

		$table_name = self::get_table_name();

		$result = $wpdb->delete(
			$table_name,
			array( 'post_id' => $post_id ),
			array( '%d' )
		);

		if ( false !== $result ) {
			return true;
		}

		return false;
	}

	/**
	 * Unregister all items for a user.
	 *
	 * @since 1.8.0
	 * @param int $user_id The user ID.
	 * @return bool True on success, false on failure.
	 */
	public static function unregister_items_for_user( $user_id ) {
		global $wpdb;

		$table_name = self::get_table_name();

		$result = $wpdb->delete(
			$table_name,
			array( 'user_id' => $user_id ),
			array( '%d' )
		);

		if ( false !== $result ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if the items registry table exists.
	 *
	 * @since 1.8.0
	 * @return bool True if table exists, false otherwise.
	 */
	public static function table_exists() {
		global $wpdb;

		$table_name = self::get_table_name();
		return $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_name ) ) === $table_name;
	}
}
