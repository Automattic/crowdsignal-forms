<?php
/**
 * Contains the Polls Controller Class
 *
 * @since 0.9.0
 * @package Crowdsignal_Forms\Rest_Api
 **/

namespace Crowdsignal_Forms\Rest_Api\Controllers;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Poll;
use Crowdsignal_Forms\Rest_Api\Controllers\Authorization_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Polls Controller Class
 *
 * @since 0.9.0
 **/
class Polls_Controller {
	/**
	 * The namespace.
	 *
	 * @var string
	 **/
	protected $namespace = 'crowdsignal-forms/v1';

	/**
	 * The rest api base.
	 *
	 * @var string
	 **/
	protected $rest_base = 'polls';

	/**
	 * Register the routes for manipulating polls
	 *
	 * @since 0.9.0
	 **/
	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_polls' ),
					'permission_callback' => array( $this, 'get_polls_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
			)
		);
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => \WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'create_poll' ),
					'permission_callback' => array( $this, 'create_or_update_poll_permissions_check' ),
				),
			)
		);

		// GET polls/:poll_uuid route.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_uuid>[a-f0-9\-]{36})',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_poll' ),
					'permission_callback' => array( $this, 'get_poll_permissions_check' ),
					'args'                => $this->get_poll_fetch_params(),
				),
			)
		);

		// GET polls/:poll_uuid/results route.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_uuid>[a-f0-9\-]{36})/results',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_poll_results' ),
					'permission_callback' => array( $this, 'get_poll_results_permissions_check' ),
				),
			)
		);

		// GET post-polls/:post_id.
		register_rest_route(
			$this->namespace,
			'/post-polls/(?P<post_id>\d+)/(?P<poll_uuid>[a-zA-Z0-9\-\_]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_post_poll_by_uuid' ),
					'permission_callback' => array( $this, 'get_post_poll_permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_uuid>[a-f0-9\-]{36})',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'update_poll' ),
					'permission_callback' => array( $this, 'update_poll_permissions_check' ),
					'args'                => $this->get_poll_fetch_params(),
				),
			)
		);

		/**
		 * Archives a poll
		 */
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_uuid>[a-f0-9\-]{36})/archive',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'archive_poll' ),
					'permission_callback' => array( $this, 'archive_poll_permissions_check' ),
				),
			)
		);

		/**
		 * Un-archives a poll, moving it to the last used user folder
		 */
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_uuid>[a-f0-9\-]{36})/unarchive',
			array(
				array(
					'methods'             => \WP_REST_Server::EDITABLE,
					'callback'            => array( $this, 'unarchive_poll' ),
					'permission_callback' => array( $this, 'unarchive_poll_permissions_check' ),
				),
			)
		);
	}

	/**
	 * Create a new poll.
	 *
	 * @param \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|\WP_Error
	 * @since 0.9.0
	 */
	public function create_poll( \WP_REST_Request $request ) {
		$data              = $request->get_json_params();
		$poll              = Poll::from_array( $data );
		$valid_or_wp_error = $poll->validate();
		if ( is_wp_error( $valid_or_wp_error ) ) {
			return $valid_or_wp_error;
		}

		$resulting_poll = Crowdsignal_Forms::instance()->get_api_gateway()->create_poll( $poll );
		if ( is_wp_error( $resulting_poll ) ) {
			return $resulting_poll;
		}

		return rest_ensure_response( $resulting_poll->to_array() );
	}

	/**
	 * Update a poll.
	 *
	 * @param \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|\WP_Error
	 * @since 0.9.0
	 */
	public function update_poll( \WP_REST_Request $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		$poll_id   = Authorization_Helper::convert_uuid_to_sequential_id( $poll_uuid, 'poll' );

		if ( ! $poll_id ) {
			return new \WP_Error( 'invalid_poll', 'Poll not found for UUID', array( 'status' => 404 ) );
		}

		$data              = $request->get_json_params();
		$poll              = Poll::from_array( $data );
		$valid_or_wp_error = $poll->validate();
		if ( is_wp_error( $valid_or_wp_error ) ) {
			return $valid_or_wp_error;
		}

		// Ensure the poll ID matches the UUID.
		if ( $poll->get_id() !== $poll_id ) {
			$poll->set_id( $poll_id );
		}

		$resulting_poll = Crowdsignal_Forms::instance()->get_api_gateway()->update_poll( $poll );
		if ( is_wp_error( $resulting_poll ) ) {
			return $resulting_poll;
		}

		return rest_ensure_response( $resulting_poll->to_array() );
	}

	/**
	 * Archive a poll (Moves poll to the archive folder, does not delete).
	 *
	 * @param \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|\WP_Error
	 * @since 0.9.0
	 */
	public function archive_poll( \WP_REST_Request $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		$poll_id   = Authorization_Helper::convert_uuid_to_sequential_id( $poll_uuid, 'poll' );

		if ( ! $poll_id ) {
			return new \WP_Error( 'invalid_poll', 'Poll not found for UUID', array( 'status' => 404 ) );
		}

		$resulting_poll = Crowdsignal_Forms::instance()->get_api_gateway()->archive_poll( $poll_id );
		if ( is_wp_error( $resulting_poll ) ) {
			return $resulting_poll;
		}

		return rest_ensure_response( $resulting_poll->to_array() );
	}

	/**
	 * Un-archive a poll (Moves poll to the most recently used user folder).
	 *
	 * @param \WP_REST_Request $request The API Request.
	 * @return \WP_REST_Response|\WP_Error
	 * @since 0.9.0
	 */
	public function unarchive_poll( \WP_REST_Request $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		$poll_id   = Authorization_Helper::convert_uuid_to_sequential_id( $poll_uuid, 'poll' );

		if ( ! $poll_id ) {
			return new \WP_Error( 'invalid_poll', 'Poll not found for UUID', array( 'status' => 404 ) );
		}

		$resulting_poll = Crowdsignal_Forms::instance()->get_api_gateway()->unarchive_poll( $poll_id );
		if ( is_wp_error( $resulting_poll ) ) {
			return $resulting_poll;
		}

		return rest_ensure_response( $resulting_poll->to_array() );
	}

	/**
	 * The permission check for updating a poll by UUID.
	 *
	 * @since 1.9.0
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 **/
	public function update_poll_permissions_check( $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		return Authorization_Helper::can_user_edit_item_by_uuid( $poll_uuid, 'poll' );
	}

	/**
	 * The permission check for archiving a poll by UUID.
	 *
	 * @since 1.9.0
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 **/
	public function archive_poll_permissions_check( $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		return Authorization_Helper::can_user_edit_item_by_uuid( $poll_uuid, 'poll' );
	}

	/**
	 * The permission check for unarchiving a poll by UUID.
	 *
	 * @since 1.9.0
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 **/
	public function unarchive_poll_permissions_check( $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		return Authorization_Helper::can_user_edit_item_by_uuid( $poll_uuid, 'poll' );
	}

	/**
	 * The permission check for getting poll results by UUID.
	 *
	 * @since 1.9.0
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 **/
	public function get_poll_results_permissions_check( $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		return Authorization_Helper::can_user_edit_item_by_uuid( $poll_uuid, 'poll' );
	}

	/**
	 * The permission check for creating a new poll.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 **/
	public function create_or_update_poll_permissions_check( $request = null ) {
		// For new poll creation, check publish_posts capability.
		if ( ! $request ) {
			return current_user_can( 'publish_posts' );
		}
		$data = $request->get_json_params();
		$poll = Poll::from_array( $data );

		// If the poll is in the request, check if the user can edit it.
		if ( $poll && $poll->get_id() ) {
			return Authorization_Helper::can_user_edit_item( $poll->get_id(), 'poll' );
		}

		// For post-based polls, check post edit permissions.
		$post_id   = $request->get_param( 'post_id' );
		$poll_uuid = $request->get_param( 'poll_uuid' );
		if ( $post_id && $poll_uuid ) {
			return Authorization_Helper::can_user_edit_item_by_client_id( $poll_uuid, $post_id );
		}

		// Fallback to publish_posts for new polls.
		return current_user_can( 'publish_posts' );
	}

	/**
	 * Get the polls.
	 *
	 * @since 0.9.0
	 *
	 * @return \WP_REST_Response
	 **/
	public function get_polls() {
		return rest_ensure_response( Crowdsignal_Forms::instance()->get_api_gateway()->get_polls() );
	}

	/**
	 * The permission check.
	 *
	 * @since 0.9.0
	 *
	 * @return bool
	 **/
	public function get_polls_permissions_check() {
		return true;
	}

	/**
	 * Get a poll by UUID.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response|\WP_Error
	 **/
	public function get_poll( $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		if ( null === $poll_uuid ) {
			return new \WP_Error(
				'invalid-poll-uuid',
				__( 'Invalid poll UUID', 'crowdsignal-forms' ),
				array( 'status' => 400 )
			);
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$use_cached = isset( $_REQUEST['cached'] );

		// Get poll data from postmeta using UUID.
		$poll_saved_in_meta = Crowdsignal_Forms::instance()
			->get_post_poll_meta_gateway()
			->get_poll_data_for_poll_client_id( null, $poll_uuid );

		if ( empty( $poll_saved_in_meta ) ) {
			return $this->resource_not_found();
		}

		if ( $use_cached ) {
			return rest_ensure_response( Poll::from_array( $poll_saved_in_meta )->to_array() );
		}

		$poll_id = $poll_saved_in_meta['id'];
		$poll    = Crowdsignal_Forms::instance()->get_api_gateway()->get_poll( $poll_id );

		if ( is_wp_error( $poll ) ) {
			return rest_ensure_response( $poll );
		}

		return rest_ensure_response( $poll->to_array() );
	}

	/**
	 * Get a post's poll given the post id and poll uuid.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request The HTTP request.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 **/
	public function get_post_poll_by_uuid( $request ) {
		$post_id   = $request->get_param( 'post_id' );
		$poll_uuid = $request->get_param( 'poll_uuid' );

		if ( null === $post_id || ! is_numeric( $post_id ) ) {
			return new \WP_Error(
				'invalid-post-id',
				__( 'Invalid post ID', 'crowdsignal-forms' ),
				array( 'status' => 400 )
			);
		}

		$the_post = get_post( $post_id );

		if ( empty( $the_post ) ) {
			return $this->resource_not_found();
		}

		if ( null === $poll_uuid ) {
			return new \WP_Error(
				'invalid-poll-id',
				__( 'Invalid poll ID', 'crowdsignal-forms' ),
				array( 'status' => 400 )
			);
		}

		$poll_saved_in_meta = Crowdsignal_Forms::instance()
			->get_post_poll_meta_gateway()
			->get_poll_data_for_poll_client_id( $post_id, $poll_uuid );

		if ( empty( $poll_saved_in_meta ) || ! isset( $poll_saved_in_meta['id'] ) ) {
			return $this->resource_not_found();
		}

		return rest_ensure_response( $poll_saved_in_meta );
	}

	/**
	 * Get poll results by UUID.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response|\WP_Error
	 **/
	public function get_poll_results( $request ) {
		$poll_uuid = $request->get_param( 'poll_uuid' );
		$poll_id   = Authorization_Helper::convert_uuid_to_sequential_id( $poll_uuid, 'poll' );

		if ( ! $poll_id ) {
			return new \WP_Error( 'invalid_poll', 'Poll not found for UUID', array( 'status' => 404 ) );
		}

		return rest_ensure_response( Crowdsignal_Forms::instance()->get_api_gateway()->get_poll_results( $poll_id ) );
	}

	/**
	 * Permission to get polls and results.
	 *
	 * @since 0.9.0
	 *
	 * @return bool
	 **/
	public function get_poll_permissions_check() {
		return true;
	}

	/**
	 * The permission check for getting a post poll by UUID.
	 *
	 * @since 1.7.3
	 *
	 * @param \WP_REST_Request $request The REST request.
	 * @return bool
	 **/
	public function get_post_poll_permissions_check( $request ) {
		return Authorization_Helper::can_user_edit_post_from_request( $request );
	}

	/**
	 * Gets the collection params.
	 *
	 * @since 0.9.0
	 * @return array
	 */
	protected function get_collection_params() {
		return array();
	}

	/**
	 * Returns a validator array for the get-a-poll by UUID params.
	 *
	 * @see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
	 * @since 0.9.0
	 * @return array
	 */
	protected function get_poll_fetch_params() {
		return array(
			'poll_uuid' => array(
				'validate_callback' => function ( $param, $request, $key ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
					return Authorization_Helper::is_valid_uuid( $param );
				},
			),
		);
	}

	/**
	 * For not-found.
	 *
	 * @since 0.9.0
	 * @return \WP_Error
	 */
	private function resource_not_found() {
		return new \WP_Error(
			'resource-not-found',
			__( 'Resource not found', 'crowdsignal-forms' ),
			array( 'status' => 404 )
		);
	}
}
