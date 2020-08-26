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
		$should_sync_comment_polls = (bool) apply_filters( 'crowdsignal_forms_should_sync_comment_polls', true );
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
