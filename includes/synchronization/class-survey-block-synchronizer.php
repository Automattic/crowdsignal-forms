<?php
/**
 * File containing the model \Crowdsignal_Forms\Synchronization\Survey_Block_Synchronizer.
 *
 * @package crowdsignal-forms/Synchronization
 * @since 1.8.0
 */

namespace Crowdsignal_Forms\Synchronization;

use Crowdsignal_Forms\Admin\Admin_Hooks;
use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Nps_Survey;
use Crowdsignal_Forms\Models\Feedback_Survey;
use WP_Block_Type_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Survey_Block_Synchronizer
 *
 * Handles synchronization of NPS and Feedback survey blocks on post save.
 * This replaces the REST API-based sync, eliminating the REST API attack surface.
 *
 * @package Crowdsignal_Forms\Synchronization
 */
class Survey_Block_Synchronizer {

	/**
	 * The survey IDs meta key.
	 */
	const CROWDSIGNAL_FORMS_SURVEY_IDS = '_crowdsignal_forms_survey_ids';

	/**
	 * The entity we are saving the sync result to.
	 *
	 * @var Synchronizable_Survey_Entity
	 */
	protected $entity_bridge;

	/**
	 * The authenticator object.
	 *
	 * @var \Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator|null
	 */
	protected $authenticator;

	/**
	 * The api gateway.
	 *
	 * @var \Crowdsignal_Forms\Gateways\Api_Gateway_Interface
	 */
	protected $gateway;

	/**
	 * The survey meta gateway.
	 *
	 * @var \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway
	 */
	protected $meta_gateway;

	/**
	 * Survey_Block_Synchronizer constructor.
	 *
	 * @param Synchronizable_Survey_Entity $sync_entity The entity which will persist the sync results.
	 */
	public function __construct( $sync_entity ) {
		$this->entity_bridge = $sync_entity;
	}

	/**
	 * Synchronize survey blocks with the Crowdsignal API.
	 *
	 * @return bool|void
	 * @throws \Exception Thrown in cases where severe failures happen.
	 */
	public function synchronize() {
		if ( ! $this->entity_bridge->can_be_saved() ) {
			return;
		}

		$this->authenticator = Crowdsignal_Forms::instance()->get_api_authenticator();

		// If there aren't any survey blocks AND a user code hasn't been requested yet, nothing to sync.
		if ( ! $this->entity_bridge->has_survey_blocks() && ! $this->authenticator->has_user_code() ) {
			return;
		}

		if ( ! $this->authenticator->get_user_code() ) {
			// Plugin hasn't been authenticated yet, abort sync.
			return;
		}

		$survey_ids_saved_in_entity = $this->entity_bridge->get_survey_ids_saved_in_entity();

		if ( ! $this->entity_bridge->has_survey_blocks() ) {
			// No survey blocks, proactively archive any surveys that were previously saved.
			$this->archive_surveys_with_ids( $survey_ids_saved_in_entity );
			if ( ! empty( $survey_ids_saved_in_entity ) ) {
				$this->entity_bridge->update_survey_ids_present_in_entity( array() );
			}
			return;
		}

		$this->gateway      = Crowdsignal_Forms::instance()->get_api_gateway();
		$this->meta_gateway = Crowdsignal_Forms::instance()->get_post_survey_meta_gateway();

		$blocks = $this->entity_bridge->get_blocks();
		try {
			$survey_ids_present_in_content = $this->process_blocks( $blocks );

			$survey_ids_to_archive = array_diff( $survey_ids_saved_in_entity, $survey_ids_present_in_content );
			$this->archive_surveys_with_ids( $survey_ids_to_archive );

			$this->entity_bridge->update_survey_ids_present_in_entity( $survey_ids_present_in_content );
		} catch ( \Exception $sync_exception ) {
			$this->handle_api_sync_exception( $sync_exception );
			return;
		}

		return true;
	}

	/**
	 * Process all blocks in the content to find survey blocks that need syncing.
	 *
	 * @param array $blocks List of blocks to check.
	 * @return array Array of platform survey IDs present in the content.
	 * @throws \Exception In case of bad request.
	 */
	protected function process_blocks( $blocks ) {
		// Phase 1: Collect all survey blocks at top level and nested in other blocks.
		$survey_blocks                 = array();
		$blocks_to_process             = $blocks;
		$survey_ids_present_in_content = array();

		while ( ! empty( $blocks_to_process ) ) {
			$blocks_to_process_next_iteration = array();

			foreach ( $blocks_to_process as $block ) {
				if ( in_array( $block['blockName'], Admin_Hooks::$survey_block_names, true ) ) {
					$survey_client_id = $this->get_survey_client_id( $block );

					if ( empty( $survey_client_id ) ) {
						continue;
					}

					$block['attrs']['surveyClientId'] = $survey_client_id;
					$survey_blocks[]                  = $block;
					continue;
				}

				if ( empty( $block['innerBlocks'] ) ) {
					continue;
				}
				$blocks_to_process_next_iteration = array_merge( $blocks_to_process_next_iteration, $block['innerBlocks'] );
			}

			$blocks_to_process = $blocks_to_process_next_iteration;
		}

		// Phase 2: Process the found survey blocks.
		foreach ( $survey_blocks as $survey_block ) {
			$survey_client_id = $survey_block['attrs']['surveyClientId'];

			// Security check: verify user can sync copied surveys.
			if ( ! $this->can_sync_survey( $survey_client_id ) ) {
				continue;
			}

			$existing_data = $this->entity_bridge->get_entity_survey_data( $survey_client_id );

			$this->apply_block_attribute_defaults( $survey_block );

			$result = null;

			if ( 'crowdsignal-forms/nps' === $survey_block['blockName'] ) {
				$result = $this->sync_nps_block( $survey_block, $existing_data );
			} elseif ( 'crowdsignal-forms/feedback' === $survey_block['blockName'] ) {
				$result = $this->sync_feedback_block( $survey_block, $existing_data );
			}

			if ( null !== $result && ! is_wp_error( $result ) ) {
				$survey_ids_present_in_content[] = (int) $result->get_id();
				$this->entity_bridge->update_entity_survey_data(
					$survey_client_id,
					$result->to_array()
				);
			} elseif ( is_wp_error( $result ) ) {
				throw new \Exception( esc_html( $result->get_error_code() ) );
			}
		}

		return $survey_ids_present_in_content;
	}

	/**
	 * Get the survey client ID for a block.
	 *
	 * For modern blocks, returns the surveyClientId attribute directly.
	 * For legacy blocks (bare surveyId, no surveyClientId), resolves
	 * the client ID from post meta.
	 *
	 * @param array $block The block data.
	 * @return string|null The client ID, or null if unresolvable.
	 */
	private function get_survey_client_id( $block ) {
		if ( ! empty( $block['attrs']['surveyClientId'] ) ) {
			return $block['attrs']['surveyClientId'];
		}

		if ( empty( $block['attrs']['surveyId'] ) ) {
			return null;
		}

		return $this->resolve_legacy_survey_client_id( (int) $block['attrs']['surveyId'] );
	}

	/**
	 * Resolve a legacy surveyId to a surveyClientId via post meta.
	 *
	 * Checks the current post first, then falls back to looking up
	 * which post originally owns this survey ID.
	 *
	 * @param int $survey_id The platform survey ID.
	 * @return string|null The client ID, or null if unresolvable.
	 */
	private function resolve_legacy_survey_client_id( $survey_id ) {
		$post_id = $this->entity_bridge->get_post_id();

		// Check the current post's meta first.
		$client_id = $this->meta_gateway->get_client_id_for_survey_id( $post_id, $survey_id );

		if ( $client_id ) {
			return $client_id;
		}

		// Not on this post. Check if it belongs to another post (cross-post paste).
		$original_post_id = $this->meta_gateway->get_original_post_id_for_survey_id( $survey_id );

		if ( null === $original_post_id ) {
			return null;
		}

		if ( $original_post_id !== $post_id && ! current_user_can( 'edit_post', $original_post_id ) ) {
			return null;
		}

		return $this->meta_gateway->get_client_id_for_survey_id( $original_post_id, $survey_id );
	}

	/**
	 * Check if a survey can be synced from this post.
	 *
	 * If the survey client_id is mapped to a different post (copy/paste scenario),
	 * the user must have edit permission on the original post.
	 *
	 * @param string $survey_client_id The survey client ID (UUID).
	 * @return bool True if the user can sync this survey.
	 */
	private function can_sync_survey( $survey_client_id ) {
		$post_id          = $this->entity_bridge->get_post_id();
		$original_post_id = $this->meta_gateway->get_original_post_id_for_client_id( $survey_client_id );

		// Not mapped yet — this is a new survey, allow it.
		if ( null === $original_post_id ) {
			return true;
		}

		// Same post — this is the original survey, allow it.
		if ( $original_post_id === $post_id ) {
			return true;
		}

		// Different post — allow only if the user can edit the original.
		return current_user_can( 'edit_post', $original_post_id );
	}

	/**
	 * Sync an NPS block to the Crowdsignal API.
	 *
	 * @param array $block         The block data.
	 * @param array $existing_data Existing survey data from meta.
	 * @return Nps_Survey|\WP_Error|null
	 */
	private function sync_nps_block( $block, $existing_data ) {
		$attrs = $block['attrs'];

		// Get the platform ID from existing meta only.
		// Never trust surveyId from block attributes — an attacker with author access
		// could craft a block with any surveyId to overwrite someone else's survey.
		$platform_id = ! empty( $existing_data['id'] ) ? (int) $existing_data['id'] : 0;

		$source_link = get_permalink( $this->entity_bridge->get_post_id() );

		$survey = new Nps_Survey(
			$platform_id,
			! empty( $attrs['title'] ) ? $attrs['title'] : $attrs['ratingQuestion'],
			$attrs['ratingQuestion'],
			$attrs['feedbackQuestion'],
			$source_link
		);

		return $this->gateway->update_nps( $survey );
	}

	/**
	 * Sync a Feedback block to the Crowdsignal API.
	 *
	 * @param array $block         The block data.
	 * @param array $existing_data Existing survey data from meta.
	 * @return Feedback_Survey|\WP_Error|null
	 */
	private function sync_feedback_block( $block, $existing_data ) {
		$attrs = $block['attrs'];

		// Get the platform ID from existing meta only.
		// Never trust surveyId from block attributes — an attacker with author access
		// could craft a block with any surveyId to overwrite someone else's survey.
		$platform_id = ! empty( $existing_data['id'] ) ? (int) $existing_data['id'] : 0;

		$source_link = get_permalink( $this->entity_bridge->get_post_id() );

		$survey = new Feedback_Survey(
			$platform_id,
			! empty( $attrs['title'] ) ? $attrs['title'] : $attrs['header'],
			$attrs['feedbackPlaceholder'],
			$attrs['emailPlaceholder'],
			$source_link,
			isset( $attrs['emailResponses'] ) ? $attrs['emailResponses'] : true
		);

		return $this->gateway->update_feedback( $survey );
	}

	/**
	 * Sets block attribute default values on the provided block object.
	 *
	 * @param array $block The block to apply defaults to.
	 * @return void
	 */
	private function apply_block_attribute_defaults( &$block ) {
		$block_type = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );

		if ( ! $block_type || ! isset( $block_type->attributes ) ) {
			return;
		}

		$default_attributes = $block_type->attributes;

		foreach ( $default_attributes as $attribute_name => $attribute ) {
			if ( ! isset( $block['attrs'][ $attribute_name ] ) ) {
				$default                           = isset( $attribute['default'] ) ? $attribute['default'] : null;
				$block['attrs'][ $attribute_name ] = $default;
			}
		}
	}

	/**
	 * Archive surveys with these IDs.
	 *
	 * @param array $survey_ids_to_archive IDs to archive.
	 */
	protected function archive_surveys_with_ids( $survey_ids_to_archive ) {
		// Note: The Crowdsignal API doesn't currently have archive endpoints for NPS/Feedback.
		// This method is a placeholder for future implementation.
		// For now, we just update the local tracking.
	}

	/**
	 * Fire any exception handling code here.
	 *
	 * @param \Exception $sync_exception The sync exception.
	 */
	private function handle_api_sync_exception( $sync_exception ) {
		/**
		 * Sync failed for some reason. We might want to do something about this by hooking into this action.
		 *
		 * @param \Exception               $sync_exception The exception that was thrown.
		 * @param Survey_Block_Synchronizer $this           This block sync instance.
		 * @since 1.8.0
		 */
		do_action( 'crowdsignal_forms_survey_sync_exception', $sync_exception, $this );
	}
}
