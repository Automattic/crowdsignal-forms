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
	 * @param int    $post_id   The post we have embedded the poll.
	 * @param string $client_id The uuid we assigned to the poll block.
	 * @return array
	 */
	public function get_poll_data_for_poll_client_id( $post_id, $client_id ) {
		global $wpdb;

		if ( null === $client_id ) {
			return array();
		}

		$poll_meta_key = $this->get_poll_meta_key( $client_id );
		if ( null === $post_id ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
			$platform_poll_data_row = (array) $wpdb->get_row(
				$wpdb->prepare(
					"SELECT * from {$wpdb->postmeta} where meta_key = %s LIMIT 1",
					$poll_meta_key
				)
			);

			if ( ! empty( $platform_poll_data_row && isset( $platform_poll_data_row['meta_value'] ) ) ) {
				$platform_poll_data = maybe_unserialize( $platform_poll_data_row['meta_value'] );
			} else {
				$platform_poll_data = array();
			}
		} else {
			$platform_poll_data = (array) get_post_meta( $post_id, $poll_meta_key, true );
		}

		if ( empty( $platform_poll_data ) ) {
			return array();
		}

		return $platform_poll_data;
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
}
