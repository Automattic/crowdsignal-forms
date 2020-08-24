<?php
/**
 * Contains the Admin_Hooks class
 *
 * @package Crowdsignal_Forms\Admin
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin;
use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;
use Crowdsignal_Forms\Models\Poll;
use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;
use Crowdsignal_Forms\Synchronization\Post_Sync_Entity;
use Crowdsignal_Forms\Synchronization\Comment_Sync_Entity;
use Crowdsignal_Forms\Synchronization\Poll_Block_Synchronizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin_Hooks
 */
class Admin_Hooks {
	/**
	 * The poll ids meta key.
	 */
	const CROWDSIGNAL_FORMS_POLL_IDS = '_crowdsignal_forms_poll_ids';
	/**
	 * Is the class hooked.
	 *
	 * @var bool Is the class hooked.
	 */
	private $is_hooked = false;

	/**
	 * The admin page.
	 *
	 * @var Crowdsignal_Forms_Admin
	 */
	private $admin;

	/**
	 * Perform any hooks.
	 *
	 * @since 0.9.0
	 *
	 * @return $this
	 */
	public function hook() {
		if ( $this->is_hooked ) {
			return $this;
		}
		$this->is_hooked = true;
		// Do any hooks required.
		if ( is_admin() && apply_filters( 'crowdsignal_forms_show_admin', true ) ) {
			$this->admin = new Crowdsignal_Forms_Admin();

			// admin page.
			add_action( 'admin_init', array( $this->admin, 'admin_init' ) );
			add_action( 'admin_menu', array( $this->admin, 'admin_menu' ), 12 );
			add_action( 'admin_enqueue_scripts', array( $this->admin, 'admin_enqueue_scripts' ) );

			// admin notices.
			add_action( 'crowdsignal_forms_init_admin_notices', 'Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices::init_core_notices' );
			add_action( 'admin_notices', 'Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices::display_notices' );
			add_action( 'wp_loaded', 'Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices::dismiss_notices' );
		}

		add_action( 'save_post', array( $this, 'save_polls_to_api' ), 10, 3 );
		/**
		 * Should we synchronize poll blocks in comments too?
		 *
		 * @since 1.0.0
		 *
		 * @param bool $should_sync Synchronize the poll blocks in comments.
		 * @return bool
		 */
		$should_sync_comment_polls = (bool) apply_filters( 'crowdsignal_forms_should_sync_comment_polls', false );
		if ( $should_sync_comment_polls ) {
			add_action( 'comment_post', array( $this, 'save_polls_to_api_from_new_comment' ), 10, 3 );
			add_action( 'edit_comment', array( $this, 'save_polls_to_api_from_updated_comment' ), 10, 2 );
		}

		return $this;
	}

	/**
	 * Save polls in new comments.
	 *
	 * @param  int        $comment_id       The comment id.
	 * @param int|string $comment_approved Comment approved status.
	 * @param array      $commentdata      The comment data.
	 *
	 * @return void|bool
	 *
	 * @throws \Exception In case of bad request. This is temporary.
	 *
	 * @since 1.0.0
	 */
	public function save_polls_to_api_from_new_comment( $comment_id, $comment_approved, $commentdata ) {
		$saver        = new Comment_Sync_Entity( $comment_id, $comment_approved, $commentdata );
		$synchronizer = new Poll_Block_Synchronizer( $saver );
		return $synchronizer->synchronize();

	}

	/**
	 * Save polls in updated comments.
	 *
	 * @param int   $comment_id  The comment id.
	 * @param array $commentdata The comment data.
	 *
	 * @return void|bool
	 *
	 * @throws \Exception In case of bad request. This is temporary.
	 *
	 * @since 1.0.0
	 */
	public function save_polls_to_api_from_updated_comment( $comment_id, $commentdata ) {
		$saver        = new Comment_Sync_Entity( $comment_id, null, $commentdata );
		$synchronizer = new Poll_Block_Synchronizer( $saver );
		return $synchronizer->synchronize();
	}

	/**
	 * Will save any pending polls.
	 *
	 * @param int      $post_ID The id.
	 * @param \WP_Post $post The post.
	 * @param bool     $is_update Is this an update.
	 *
	 * @since 0.9.0
	 * @return void|bool
	 *
	 * @throws \Exception In case of bad request. This is temporary.
	 */
	public function save_polls_to_api( $post_ID, $post, $is_update = false ) {
		$saver        = new Post_Sync_Entity( $post_ID, $post, $is_update );
		$synchronizer = new Poll_Block_Synchronizer( $saver );
		return $synchronizer->synchronize();
	}

	/**
	 * Processes all blocks in the content to find any poll blocks that need to be saved.
	 *
	 * @param array  $blocks List of blocks to check.
	 * @param int    $post_ID ID of the current poll.
	 * @param object $gateway crowdsignal api gateway instance.
	 * @param array  $poll_ids_present_in_content Array to track IDs that are present in the content.
	 *
	 * @since 0.9.0
	 * @return void
	 * @throws \Exception In case of bad request. This is temporary.
	 */
	private function process_blocks( $blocks, $post_ID, $gateway, &$poll_ids_present_in_content ) {
		// search for all poll blocks at top level and nested in other blocks.
		$poll_blocks       = array();
		$blocks_to_process = $blocks;

		while ( ! empty( $blocks_to_process ) ) {
			$blocks_to_process_next_iteration = array();

			foreach ( $blocks_to_process as $block ) {
				if ( 'crowdsignal-forms/poll' === $block['blockName'] ) {
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
		foreach ( $poll_blocks as &$poll_block ) {
			$poll_client_id = $poll_block['attrs']['pollId'];
			if ( empty( $poll_client_id ) ) {
				// This is sorta serious, means the poll block is invalid, what to do?
				// for now, throw!
				throw new \Exception( 'No poll client_id' );
			}

			$platform_poll_data = Crowdsignal_Forms::instance()
				->get_post_poll_meta_gateway()
				->get_poll_data_for_poll_client_id( $post_ID, $poll_client_id );

			// Append post_ID so Crowdsignal_Forms\Models\Poll::from_array
			// can inject the source_link.
			if ( empty( $platform_poll_data ) ) {
				// nothing in the key or key not existing. New poll.
				$platform_poll_data = array( 'post_id' => $post_ID );
			} else {
				$platform_poll_data = array_merge( $platform_poll_data, array( 'post_id' => $post_ID ) );
			}

			$poll = Poll::from_array( $platform_poll_data );

			$poll->update_from_block_attrs( $poll_block['attrs'] );
			if ( $poll->get_id() < 1 ) {
				$result = $gateway->create_poll( $poll );
			} else {
				$result = $gateway->update_poll( $poll );
			}

			if ( ! is_wp_error( $result ) ) {
				$poll_ids_present_in_content[] = $result->get_id();
				Crowdsignal_Forms::instance()
					->get_post_poll_meta_gateway()
					->update_poll_data_for_client_id( $post_ID, $poll_client_id, $result->to_array() );
			} else {
				// TODO: Pretty serious, we didn't get a poll response. What to do? Throw!
				throw new \Exception( $result->get_error_code() );
			}
		}
	}

	/**
	 * Archive polls with these ids.
	 *
	 * @param array $poll_ids_to_archive Ids to archive.
	 */
	private function archive_polls_with_ids( $poll_ids_to_archive ) {
		if ( empty( $poll_ids_to_archive ) ) {
			return;
		}
		$gateway = Crowdsignal_Forms::instance()->get_api_gateway();
		foreach ( $poll_ids_to_archive as $id_to_archive ) {
			$gateway->archive_poll( $id_to_archive );
		}
	}
}
