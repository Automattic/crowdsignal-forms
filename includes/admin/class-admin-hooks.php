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
use Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;
use Crowdsignal_Forms\Synchronization\Post_Sync_Entity;
use Crowdsignal_Forms\Synchronization\Comment_Sync_Entity;
use Crowdsignal_Forms\Synchronization\Poll_Block_Synchronizer;
use Crowdsignal_Forms\Synchronization\Survey_Block_Synchronizer;

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
	 * The survey block names that use surveyId/surveyClientId.
	 *
	 * @var array
	 */
	public static $survey_block_names = array(
		'crowdsignal-forms/nps',
		'crowdsignal-forms/feedback',
	);

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

		add_filter( 'wp_insert_post_data', array( $this, 'guard_survey_ids_in_content' ), 10, 2 );

		add_action( 'rest_api_init', array( $this, 'register_survey_meta_rest_hooks' ) );

		if ( is_admin() ) {
			add_action( 'load-post.php', array( $this, 'ensure_survey_meta_on_edit_screen' ) );
		}

		add_action( 'save_post', array( $this, 'save_polls_to_api' ), 10, 3 );
		add_action( 'save_post', array( $this, 'save_surveys_to_api' ), 10, 3 );
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

	/**
	 * Will save any pending surveys (NPS and Feedback).
	 *
	 * @param int      $post_ID   The post id.
	 * @param \WP_Post $post      The post.
	 * @param bool     $is_update Is this an update.
	 *
	 * @since 1.8.0
	 * @return void|bool
	 *
	 * @throws \Exception In case of bad request.
	 */
	public function save_surveys_to_api( $post_ID, $post, $is_update = false ) {
		$entity       = new Post_Sync_Entity( $post_ID, $post, $is_update );
		$synchronizer = new Survey_Block_Synchronizer( $entity );
		return $synchronizer->synchronize();
	}

	/**
	 * Guard against surveyId injection in post content.
	 *
	 * Prevents bare `surveyId` attributes from being introduced into post
	 * content through any save vector (editor, XML-RPC, REST API, wp_update_post).
	 * A bare `surveyId` in new content is only allowed if it existed in the old
	 * content OR has matching `_cs_survey_*` meta on this post.
	 *
	 * @param array $data    An array of slashed, sanitized post data.
	 * @param array $postarr An array of sanitized (and slashed) but otherwise unmodified post data.
	 * @return array Modified post data.
	 */
	public function guard_survey_ids_in_content( $data, $postarr ) {
		$content = wp_unslash( $data['post_content'] );

		$blocks         = array();
		$new_survey_ids = self::get_legacy_survey_ids_from_content( $content, $blocks );

		if ( empty( $new_survey_ids ) ) {
			return $data;
		}

		$post_id = ! empty( $postarr['ID'] ) ? (int) $postarr['ID'] : 0;

		// Get old content for comparison.
		$old_content    = $post_id ? (string) get_post_field( 'post_content', $post_id ) : '';
		$old_survey_ids = self::get_legacy_survey_ids_from_content( $old_content );

		$meta_gateway = Crowdsignal_Forms::instance()->get_post_survey_meta_gateway();
		$modified     = false;

		self::guard_blocks( $blocks, $old_survey_ids, $post_id, $meta_gateway, $modified );

		if ( $modified ) {
			$data['post_content'] = wp_slash( serialize_blocks( $blocks ) );
		}

		return $data;
	}

	/**
	 * Recursively guard blocks against surveyId injection.
	 *
	 * @param array                  $blocks        Blocks array (modified by reference).
	 * @param array                  $old_survey_ids Survey IDs present in old content.
	 * @param int                    $post_id       The post ID (0 for new posts).
	 * @param Post_Survey_Meta_Gateway $meta_gateway  The meta gateway.
	 * @param bool                   $modified      Whether any blocks were modified (by reference).
	 */
	private static function guard_blocks( &$blocks, $old_survey_ids, $post_id, $meta_gateway, &$modified ) {
		foreach ( $blocks as &$block ) {
			if (
				in_array( $block['blockName'], self::$survey_block_names, true )
				&& ! empty( $block['attrs']['surveyId'] )
				&& empty( $block['attrs']['surveyClientId'] )
			) {
				$survey_id = (int) $block['attrs']['surveyId'];

				// Allow if pre-existing in old content.
				if ( in_array( $survey_id, $old_survey_ids, true ) ) {
					continue;
				}

				// Allow if this post has matching meta.
				if ( $post_id && null !== $meta_gateway->get_client_id_for_survey_id( $post_id, $survey_id ) ) {
					continue;
				}

				// Unknown surveyId — replace with a fresh surveyClientId.
				unset( $block['attrs']['surveyId'] );
				$block['attrs']['surveyClientId'] = wp_generate_uuid4();
				$modified                         = true;
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::guard_blocks( $block['innerBlocks'], $old_survey_ids, $post_id, $meta_gateway, $modified );
			}
		}
	}

	/**
	 * Register REST API hooks for survey meta generation on edit.
	 *
	 * @return void
	 */
	public function register_survey_meta_rest_hooks() {
		$post_types = get_post_types( array( 'show_in_rest' => true ) );

		foreach ( $post_types as $post_type ) {
			add_filter( "rest_prepare_{$post_type}", array( $this, 'ensure_survey_meta_for_legacy_blocks_rest' ), 10, 3 );
		}
	}

	/**
	 * Generate `_cs_survey_{uuid}` meta for legacy survey blocks when a post is loaded for editing via REST API.
	 *
	 * @param \WP_REST_Response $response The response object.
	 * @param \WP_Post          $post     The post object.
	 * @param \WP_REST_Request  $request  The request object.
	 * @return \WP_REST_Response
	 */
	public function ensure_survey_meta_for_legacy_blocks_rest( $response, $post, $request ) {
		if ( 'edit' !== $request['context'] ) {
			return $response;
		}

		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			return $response;
		}

		$this->ensure_survey_meta_for_post( $post->ID, $post->post_content );

		return $response;
	}

	/**
	 * Generate `_cs_survey_{uuid}` meta for legacy survey blocks when the classic editor loads.
	 *
	 * @return void
	 */
	public function ensure_survey_meta_on_edit_screen() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['post'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_id = (int) $_GET['post'];

		if ( ! $post_id ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$post = get_post( $post_id );

		if ( ! $post ) {
			return;
		}

		$this->ensure_survey_meta_for_post( $post->ID, $post->post_content );
	}

	/**
	 * Ensure meta entries exist for all legacy survey blocks in a post's content.
	 *
	 * @param int    $post_id The post ID.
	 * @param string $content The post content.
	 * @return void
	 */
	private function ensure_survey_meta_for_post( $post_id, $content ) {
		$survey_ids = self::get_legacy_survey_ids_from_content( $content );

		if ( empty( $survey_ids ) ) {
			return;
		}

		$meta_gateway         = Crowdsignal_Forms::instance()->get_post_survey_meta_gateway();
		$tracking_survey_ids  = get_post_meta( $post_id, Survey_Block_Synchronizer::CROWDSIGNAL_FORMS_SURVEY_IDS, true );
		$tracking_survey_ids  = is_array( $tracking_survey_ids ) ? $tracking_survey_ids : array();
		$tracking_changed     = false;

		foreach ( $survey_ids as $survey_id ) {
			$meta_gateway->ensure_meta_for_survey_id( $post_id, $survey_id );

			if ( ! in_array( $survey_id, $tracking_survey_ids, true ) ) {
				$tracking_survey_ids[] = $survey_id;
				$tracking_changed      = true;
			}
		}

		if ( $tracking_changed ) {
			update_post_meta( $post_id, Survey_Block_Synchronizer::CROWDSIGNAL_FORMS_SURVEY_IDS, $tracking_survey_ids );
		}
	}

	/**
	 * Parse post content and return survey IDs from legacy blocks.
	 *
	 * A legacy block has `surveyId` in its attributes but no `surveyClientId`.
	 *
	 * @param string $content The post content.
	 * @param array  $blocks  Optional. Populated with parsed blocks by reference.
	 * @return array Array of integer survey IDs.
	 */
	public static function get_legacy_survey_ids_from_content( $content, &$blocks = null ) {
		$blocks = array();

		if ( empty( $content ) ) {
			return array();
		}

		// Cheap check: skip block parsing for content without survey blocks.
		$has_survey_block = false;
		foreach ( self::$survey_block_names as $block_name ) {
			if ( false !== strpos( $content, $block_name ) ) {
				$has_survey_block = true;
				break;
			}
		}

		if ( ! $has_survey_block ) {
			return array();
		}

		$blocks     = parse_blocks( $content );
		$survey_ids = array();

		self::collect_legacy_survey_ids( $blocks, $survey_ids );

		return $survey_ids;
	}

	/**
	 * Recursively collect legacy survey IDs from blocks.
	 *
	 * @param array $blocks     The blocks to search.
	 * @param array $survey_ids Collects survey IDs (modified by reference).
	 */
	private static function collect_legacy_survey_ids( $blocks, &$survey_ids ) {
		foreach ( $blocks as $block ) {
			if (
				in_array( $block['blockName'], self::$survey_block_names, true )
				&& ! empty( $block['attrs']['surveyId'] )
				&& empty( $block['attrs']['surveyClientId'] )
			) {
				$survey_ids[] = (int) $block['attrs']['surveyId'];
			}

			if ( ! empty( $block['innerBlocks'] ) ) {
				self::collect_legacy_survey_ids( $block['innerBlocks'], $survey_ids );
			}
		}
	}
}
