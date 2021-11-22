<?php
/**
 * File containing the model \Crowdsignal_Forms\Synchronization\Poll_Block_Synchronizer.
 *
 * @package crowdsignal-forms/Synchronization
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Synchronization;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Poll;
use \WP_Block_Type_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Poll_Block_Synchronizer
 *
 * @package Crowdsignal_Forms\Synchronization
 */
class Poll_Block_Synchronizer {

	/**
	 * The authenticator object.
	 *
	 * @since 1.0.0
	 * @var \Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator|null
	 */
	protected $authenticator;

	/**
	 * The api gateway.
	 *
	 * @since 1.0.0
	 * @var \Crowdsignal_Forms\Gateways\Api_Gateway_Interface
	 */
	protected $gateway;

	/**
	 * The entity we are saving the sync result to.
	 *
	 * @since 1.0.0
	 * @var Synchronizable_Entity;
	 */
	protected $entity_bridge;

	/**
	 * Poll_Block_Synchronizer constructor.
	 *
	 * @since 1.0.0
	 * @param Synchronizable_Entity $sync_entity The entity which will persist the sync results.
	 */
	public function __construct( $sync_entity ) {
		$this->entity_bridge = $sync_entity;
	}

	/**
	 * Save function.
	 *
	 * @return bool|void
	 * @throws \Exception Thrown in cases where severe failures happen.
	 */
	public function synchronize() {
		if ( ! $this->entity_bridge->can_be_saved() ) {
			return;
		}

		$this->authenticator = Crowdsignal_Forms::instance()->get_api_authenticator();

		// if there aren't any CS blocks AND a user code hasn't been requested yet, then there is nothing to sync.
		if ( ! $this->entity_bridge->has_crowdsignal_forms_blocks()
			&& ! $this->authenticator->has_user_code() ) {
			return;
		}

		if ( ! $this->authenticator->get_user_code() ) {
			// Plugin hasn't been authenticated yet, abort sync.
			return;
		}

		$poll_ids_saved_in_entity = $this->entity_bridge->get_poll_ids_saved_in_entity();

		if ( ! $this->entity_bridge->has_crowdsignal_forms_blocks() ) {
			// No poll blocks, proactively archive any polls that were previously saved.
			$this->archive_polls_with_ids( $poll_ids_saved_in_entity );
			if ( ! empty( $poll_ids_saved_in_entity ) ) {
				$this->entity_bridge->update_poll_ids_present_in_entity( array() );
			}

			return;
		}

		$this->gateway = Crowdsignal_Forms::instance()->get_api_gateway();

		$blocks = $this->entity_bridge->get_blocks();
		try {
			$poll_ids_present_in_content = $this->process_blocks( $blocks );

			$poll_ids_to_archive = array_diff( $poll_ids_saved_in_entity, $poll_ids_present_in_content );
			$this->archive_polls_with_ids( $poll_ids_to_archive );

			$this->entity_bridge->update_poll_ids_present_in_entity( $poll_ids_present_in_content );
		} catch ( \Exception $sync_exception ) {
			$this->handle_api_sync_exception( $sync_exception );
			return;
		}

		return true;
	}

	/**
	 * Archive polls with these ids.
	 *
	 * @param array $poll_ids_to_archive Ids to archive.
	 */
	protected function archive_polls_with_ids( $poll_ids_to_archive ) {
		if ( empty( $poll_ids_to_archive ) ) {
			return;
		}

		$this->gateway = Crowdsignal_Forms::instance()->get_api_gateway();
		foreach ( $poll_ids_to_archive as $id_to_archive ) {
			$this->gateway->archive_poll( $id_to_archive );
		}
	}

	/**
	 * Processes all blocks in the content to find any poll blocks that need to be saved.
	 *
	 * @param array $blocks List of blocks to check.
	 *
	 * @return array
	 *
	 * @throws \Exception In case of bad request. This is temporary.
	 * @since 1.0.0
	 */
	protected function process_blocks( $blocks ) {
		// search for all poll blocks at top level and nested in other blocks.
		$poll_blocks                 = array();
		$blocks_to_process           = $blocks;
		$poll_ids_present_in_content = array();

		while ( ! empty( $blocks_to_process ) ) {
			$blocks_to_process_next_iteration = array();

			foreach ( $blocks_to_process as $block ) {
				if ( in_array( $block['blockName'], array( 'crowdsignal-forms/poll', 'crowdsignal-forms/vote', 'crowdsignal-forms/applause' ), true ) ) {
					if ( empty( $block['attrs']['pollId'] ) ) {
						// this means somehow a newly created poll still not saved, let it there to maybe sync next time.
						continue;
					}
					$poll_blocks[] = $block;
					continue;
				}

				if ( empty( $block['innerBlocks'] ) ) {
					continue;
				}
				$blocks_to_process_next_iteration = array_merge( $blocks_to_process_next_iteration, $block['innerBlocks'] );
			}

			$blocks_to_process = $blocks_to_process_next_iteration;
		}

		// process the found blocks.
		foreach ( $poll_blocks as $poll_block ) {
			$poll_client_id = $poll_block['attrs']['pollId'];
			if ( empty( $poll_client_id ) ) {
				// This is sorta serious, means the poll block is invalid, what to do?
				// for now, throw!
				throw new \Exception( 'No poll client_id' );
			}

			$platform_poll_data = $this->entity_bridge->get_entity_poll_data( $poll_client_id );

			$poll = Poll::from_array( $platform_poll_data );

			$this->apply_block_attribute_defaults( $poll_block );

			$poll->update_from_block( $poll_block );
			if ( $poll->get_id() < 1 ) {
				$result = $this->gateway->create_poll( $poll );
			} else {
				$result = $this->gateway->update_poll( $poll );
			}

			if ( ! is_wp_error( $result ) ) {
				$poll_ids_present_in_content[] = $result->get_id();
				$this->entity_bridge->update_entity_poll_data( $poll_client_id, $result->to_array() );

			} else {
				// TODO: Pretty serious, we didn't get a poll response. What to do? Throw!
				throw new \Exception( $result->get_error_code() );
			}
		}

		return $poll_ids_present_in_content;
	}

	/**
	 * Sets block attribute default values on the provided block object.
	 *
	 * @param array $block
	 * @return void
	 */
	private function apply_block_attribute_defaults( &$block ) {
		$block_type         = WP_Block_Type_Registry::get_instance()->get_registered( $block['blockName'] );
		$default_attributes = $block_type->attributes;

		foreach ( $default_attributes as $attribute_name => $attribute ) {
			if ( ! isset( $block['attrs'][ $attribute_name ] ) ) {
				// phpcs:ignore Generic.Formatting.MultipleStatementAlignment.NotSameWarning
				$default = isset( $attribute['default'] ) ? $attribute['default'] : null;
				$block['attrs'][ $attribute_name ] = $default;
			}
		}
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
		 * @param \Exception              $sync_exception The exception that was thrown.
		 * @param Poll_Block_Synchronizer $this           This block sync instance.
		 * @since 1.0.0
		 */
		do_action( 'crowdsignal_forms_poll_sync_exception', $sync_exception, $this );
	}
}
