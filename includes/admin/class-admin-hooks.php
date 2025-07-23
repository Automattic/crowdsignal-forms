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
use Crowdsignal_Forms\Rest_Api\Controllers\Authorization_Helper;

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
		add_action( 'save_post', array( $this, 'update_items_registry' ), 20, 3 );
		add_action( 'before_delete_post', array( $this, 'cleanup_items_registry' ), 10, 1 );

		/**
		 * Should we synchronize poll blocks in comments too?
		 *
		 * @since 1.0.0
		 *
		 * @param bool $should_sync Synchronize the poll blocks in comments.
		 * @return bool
		 */
		$should_sync_comment_polls = (bool) apply_filters( 'crowdsignal_forms_should_sync_comment_polls', true );
		if ( $should_sync_comment_polls ) {
			add_action( 'comment_post', array( $this, 'save_polls_to_api_from_new_comment' ), 10, 3 );
			add_action( 'edit_comment', array( $this, 'save_polls_to_api_from_updated_comment' ), 10, 2 );
		}

		return $this;
	}

	/**
	 * Update the items registry when a post is saved.
	 *
	 * @param int      $post_id The post ID.
	 * @param \WP_Post $post    The post object.
	 * @param bool     $update  Whether this is an update.
	 *
	 * @since 1.8.0
	 */
	public function update_items_registry( $post_id, $post, $update ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed

		// Skip autosaves and revisions.
		if ( \wp_is_post_autosave( $post_id ) || \wp_is_post_revision( $post_id ) ) {
			return;
		}

		// Skip if post is not published, draft, pending, or private.
		if ( ! in_array( $post->post_status, array( 'publish', 'draft', 'pending', 'private' ), true ) ) {
			return;
		}

		// Skip registry operations if disabled.
		if ( \Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::is_disabled() ) {
			return;
		}

		// Clear existing items for this post.
		\Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::unregister_items_for_post( $post_id );

		// Extract and register new items.
		$items = $this->extract_items_from_post( $post );

		if ( ! empty( $items ) ) {
			\Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::register_items_for_post( $post_id, $items, $post->post_author );
		}
	}

	/**
	 * Clean up the items registry when a post is deleted.
	 *
	 * @param int $post_id The post ID.
	 *
	 * @since 1.8.0
	 */
	public function cleanup_items_registry( $post_id ) {
		// Skip registry operations if disabled.
		if ( \Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::is_disabled() ) {
			return;
		}

		\Crowdsignal_Forms\Crowdsignal_Forms_Item_Registry::unregister_items_for_post( $post_id );
	}

	/**
	 * Extract all Crowdsignal items from a post.
	 *
	 * @param \WP_Post $post The post object.
	 * @return array Array of items with item_id and item_type.
	 *
	 * @since 1.8.0
	 */
	private function extract_items_from_post( $post ) {
		$items  = array();
		$blocks = \parse_blocks( $post->post_content );

		// Extract items from blocks.
		$items = array_merge( $items, $this->extract_items_from_blocks( $blocks ) );

		// Extract polls from postmeta (for backward compatibility).
		$poll_items = $this->extract_polls_from_postmeta( $post->ID );
		$items      = array_merge( $items, $poll_items );

		return $items;
	}

	/**
	 * Extract items from blocks recursively.
	 *
	 * @param array $blocks Array of blocks.
	 * @return array Array of items.
	 *
	 * @since 1.8.0
	 */
	private function extract_items_from_blocks( $blocks ) {
		$items = array();

		foreach ( $blocks as $block ) {
			// NPS blocks.
			if ( 'crowdsignal-forms/nps' === $block['blockName'] && ! empty( $block['attrs']['surveyId'] ) ) {
				$items[] = array(
					'item_id'   => $block['attrs']['surveyId'],
					'item_type' => 'nps',
				);
			}

			// Feedback blocks.
			if ( 'crowdsignal-forms/feedback' === $block['blockName'] && ! empty( $block['attrs']['surveyId'] ) ) {
				$items[] = array(
					'item_id'   => $block['attrs']['surveyId'],
					'item_type' => 'feedback',
				);
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_items = $this->extract_items_from_blocks( $block['innerBlocks'] );
				$items       = array_merge( $items, $inner_items );
			}
		}

		return $items;
	}

	/**
	 * Extract polls from postmeta for backward compatibility.
	 *
	 * @param int $post_id The post ID.
	 * @return array Array of poll items.
	 *
	 * @since 1.8.0
	 */
	private function extract_polls_from_postmeta( $post_id ) {
		global $wpdb;

		$items = array();

		// Get the post content to validate against.
		$post = \get_post( $post_id );
		if ( ! $post ) {
			return $items;
		}

		// Parse blocks to get all poll client IDs that actually exist in the post.
		$blocks                = \parse_blocks( $post->post_content );
		$valid_poll_client_ids = $this->extract_poll_client_ids_from_blocks( $blocks );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.NoCaching
		$poll_meta_keys = $wpdb->get_col(
			'SELECT meta_key FROM ' . $wpdb->postmeta . ' WHERE post_id = ' . intval( $post_id ) . ' AND meta_key LIKE "_cs_poll_%"'
		);

		foreach ( $poll_meta_keys as $meta_key ) {
			// Extract client ID from meta key (e.g., "_cs_poll_abc123" -> "abc123").
			$client_id = str_replace( '_cs_poll_', '', $meta_key );

			// Only process if this client ID actually exists in the post content.
			if ( ! in_array( $client_id, $valid_poll_client_ids, true ) ) {
				continue;
			}

			$poll_data = \get_post_meta( $post_id, $meta_key, true );

			if ( is_array( $poll_data ) && ! empty( $poll_data['id'] ) ) {
				$items[] = array(
					'item_id'   => $poll_data['id'],
					'item_type' => 'poll',
				);
			}
		}

		return $items;
	}

	/**
	 * Extract poll client IDs from blocks recursively.
	 *
	 * @param array $blocks Array of blocks.
	 * @return array Array of poll client IDs.
	 *
	 * @since 1.8.0
	 */
	private function extract_poll_client_ids_from_blocks( $blocks ) {
		$client_ids = array();

		foreach ( $blocks as $block ) {
			// Poll blocks.
			if ( 'crowdsignal-forms/poll' === $block['blockName'] && ! empty( $block['attrs']['pollId'] ) ) {
				$client_ids[] = $block['attrs']['pollId'];
			}

			// Check inner blocks.
			if ( ! empty( $block['innerBlocks'] ) ) {
				$inner_client_ids = $this->extract_poll_client_ids_from_blocks( $block['innerBlocks'] );
				$client_ids       = array_merge( $client_ids, $inner_client_ids );
			}
		}

		return $client_ids;
	}

	/**
	 * Check if the current user can edit the post that this comment belongs to.
	 *
	 * @param int $comment_id The comment id.
	 * @return bool
	 *
	 * @since 1.8.0
	 */
	private function can_commenter_edit_poll( $comment_id ) {
		// Get the comment and post information.
		$comment = \get_comment( $comment_id );
		if ( ! $comment ) {
			return false;
		}

		// Check if the current user can edit the post that this comment belongs to.
		if ( ! Authorization_Helper::can_user_edit_post_from_request( new \WP_REST_Request( 'POST', '', array( 'post_id' => $comment->comment_post_ID ) ) ) ) {
			// If no user is logged in or user lacks permissions, don't process blocks in comments.
			return false;
		}

		return true;
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
		if ( ! $this->can_commenter_edit_poll( $comment_id ) ) {
			return false;
		}

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
		if ( ! $this->can_commenter_edit_poll( $comment_id ) ) {
			return false;
		}

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
