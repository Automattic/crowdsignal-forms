<?php
/**
 * File containing \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway
 *
 * @package crowdsignal-forms/Gateways
 * @since 1.8.0
 */

namespace Crowdsignal_Forms\Gateways;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Post_Survey_Meta_Gateway
 *
 * Handles storage and retrieval of survey data (NPS and Feedback) in post meta.
 * Surveys are identified by a client-generated UUID (surveyClientId) that is
 * stored in the block markup. The platform survey ID is stored in post meta
 * and never exposed in the frontend.
 *
 * @package Crowdsignal_Forms\Gateways
 */
class Post_Survey_Meta_Gateway {
	/**
	 * Prefix for meta entries.
	 */
	const META_PREFIX = '_cs_survey_';

	/**
	 * Get a survey's data for a given client ID.
	 *
	 * @param int    $post_id   The post where the survey block is embedded.
	 * @param string $client_id The UUID assigned to the survey block.
	 * @return array The survey data or empty array if not found.
	 */
	public function get_survey_data_for_client_id( $post_id, $client_id ) {
		global $wpdb;

		if ( null === $client_id ) {
			return array();
		}

		$survey_meta_key = $this->get_survey_meta_key( $client_id );

		if ( null === $post_id ) {
			// Search across all posts for this client_id.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
			$row = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s LIMIT 1",
					$survey_meta_key
				)
			);

			if ( $row && ! empty( $row->meta_value ) ) {
				$data = maybe_unserialize( $row->meta_value );
				return is_array( $data ) ? $data : array();
			}

			return array();
		}

		$meta_value = get_post_meta( $post_id, $survey_meta_key, true );

		return is_array( $meta_value ) ? $meta_value : array();
	}

	/**
	 * Update a survey's data for a given client ID.
	 *
	 * @param int    $post_id   The post ID.
	 * @param string $client_id The client ID (UUID).
	 * @param array  $data      Data to store.
	 *
	 * @return bool|int
	 */
	public function update_survey_data_for_client_id( $post_id, $client_id, $data ) {
		return update_post_meta( $post_id, $this->get_survey_meta_key( $client_id ), $data );
	}

	/**
	 * Get the original post ID where a survey client ID was first created.
	 *
	 * This is used for copy/paste protection - if a survey block is copied
	 * to a different post, the new post should not be able to sync changes
	 * to the original survey.
	 *
	 * @param string $client_id The client ID (UUID).
	 * @return int|null The post ID, or null if not found.
	 */
	public function get_original_post_id_for_client_id( $client_id ) {
		global $wpdb;

		if ( null === $client_id ) {
			return null;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s LIMIT 1",
				$this->get_survey_meta_key( $client_id )
			)
		);

		return $post_id ? (int) $post_id : null;
	}

	/**
	 * Find the client_id (UUID) whose stored meta data maps to a given survey_id.
	 *
	 * Scans all `_cs_survey_*` meta on the given post to find one whose
	 * stored array contains `'id' => $survey_id`.
	 *
	 * @param int $post_id   The post ID.
	 * @param int $survey_id The platform survey ID.
	 * @return string|null The client_id (UUID) or null if not found.
	 */
	public function get_client_id_for_survey_id( $post_id, $survey_id ) {
		$meta = get_post_meta( $post_id );

		if ( ! is_array( $meta ) ) {
			return null;
		}

		$matches = array();

		foreach ( $meta as $key => $values ) {
			if ( 0 !== strpos( $key, self::META_PREFIX ) ) {
				continue;
			}

			$client_id = substr( $key, strlen( self::META_PREFIX ) );
			$data      = maybe_unserialize( $values[0] );

			if ( is_array( $data ) && isset( $data['id'] ) && (int) $data['id'] === (int) $survey_id ) {
				$matches[] = $client_id;
			}
		}

		if ( empty( $matches ) ) {
			return null;
		}

		sort( $matches );
		return $matches[0];
	}

	/**
	 * Ensure a `_cs_survey_{uuid}` meta entry exists for a given survey_id on a post.
	 *
	 * If a mapping already exists, returns the existing client_id.
	 * Otherwise generates a new UUID, stores the mapping, and returns it.
	 *
	 * @param int $post_id   The post ID.
	 * @param int $survey_id The platform survey ID.
	 * @return string The client_id (UUID).
	 */
	public function ensure_meta_for_survey_id( $post_id, $survey_id ) {
		$existing = $this->get_client_id_for_survey_id( $post_id, $survey_id );

		if ( null !== $existing ) {
			return $existing;
		}

		$client_id = wp_generate_uuid4();
		$this->update_survey_data_for_client_id(
			$post_id,
			$client_id,
			array( 'id' => (int) $survey_id )
		);

		return $client_id;
	}

	/**
	 * Find which post owns a survey_id by querying `_crowdsignal_forms_survey_ids` meta.
	 *
	 * The meta stores a serialized array of integer IDs. We search for
	 * the serialized integer format `i:{survey_id};` using a LIKE query.
	 *
	 * @param int $survey_id The platform survey ID.
	 * @return int|null The post ID, or null if not found.
	 */
	public function get_original_post_id_for_survey_id( $survey_id ) {
		global $wpdb;

		$survey_id = (int) $survey_id;

		$like = '%' . $wpdb->esc_like( 'i:' . $survey_id . ';' ) . '%';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
		$post_id = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_crowdsignal_forms_survey_ids' AND meta_value LIKE %s LIMIT 1",
				$like
			)
		);

		return $post_id ? (int) $post_id : null;
	}

	/**
	 * Return the meta key for a survey block client ID.
	 *
	 * @param string $client_id The client ID (UUID).
	 * @return string
	 */
	private function get_survey_meta_key( $client_id ) {
		return self::META_PREFIX . $client_id;
	}
}
