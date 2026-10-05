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

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Polls Controller Class
 *
 * Poll mutations (create, update, archive) are handled via the save_post hook
 * in Poll_Block_Synchronizer, not through REST API endpoints. This controller
 * only provides read-only endpoints for fetching poll data.
 *
 * @since 0.9.0
 **/
class Polls_Controller {
	use Post_Readability_Trait;

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
	 * Register the routes for fetching polls
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

		// GET polls/:poll_id route.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_id>[a-zA-Z0-9\-\_]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_poll' ),
					'permission_callback' => array( $this, 'get_poll_permissions_check' ),
					'args'                => $this->get_poll_fetch_params(),
				),
			)
		);

		// GET polls/:poll_id/results route.
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<poll_id>[a-zA-Z0-9\-\_]+)/results',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_poll_results' ),
					'permission_callback' => array( $this, 'get_poll_results_permissions_check' ),
				),
			)
		);

		// GET post-polls/:post_id/:poll_uuid route.
		register_rest_route(
			$this->namespace,
			'/post-polls/(?P<post_id>\d+)/(?P<poll_uuid>[a-zA-Z0-9\-\_]+)',
			array(
				array(
					'methods'             => \WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_post_poll_by_uuid' ),
					'permission_callback' => array( $this, 'get_poll_permissions_check' ),
				),
			)
		);
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
	 * Get a poll by ID.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response|\WP_Error
	 **/
	public function get_poll( $request ) {
		$poll_id = $request->get_param( 'poll_id' );
		if ( null === $poll_id ) {
			return new \WP_Error(
				'invalid-poll-id',
				__( 'Invalid poll ID', 'crowdsignal-forms' ),
				array( 'status' => 400 )
			);
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$use_cached = isset( $_REQUEST['cached'] );

		$resolved = $this->resolve_readable_poll( $poll_id );

		if ( null === $resolved ) {
			return $this->resource_not_found();
		}

		list( $poll_id, $poll_saved_in_meta ) = $resolved;

		if ( $use_cached && null !== $poll_saved_in_meta ) {
			return rest_ensure_response( Poll::from_array( $poll_saved_in_meta )->to_array() );
		}

		$poll = Crowdsignal_Forms::instance()->get_api_gateway()->get_poll( $poll_id );

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

		if ( ! $this->is_owning_post_readable( $post_id ) ) {
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
	 * Get poll results by ID.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request $request
	 *
	 * @return \WP_REST_Response
	 **/
	public function get_poll_results( $request ) {
		$poll_id = $request->get_param( 'poll_id' );

		$resolved = $this->resolve_readable_poll( $poll_id );

		if ( null === $resolved ) {
			return $this->resource_not_found();
		}

		$poll_id = $resolved[0];

		return rest_ensure_response( Crowdsignal_Forms::instance()->get_api_gateway()->get_poll_results( $poll_id ) );
	}

	/**
	 * The get-a-poll by ID permission check.
	 *
	 * Client UUIDs and post-bound lookups stay public, subject to the owning post's
	 * readability. A numeric platform poll id is not needed by anonymous visitors, so
	 * it requires an editing capability.
	 *
	 * @since 0.9.0
	 *
	 * @param \WP_REST_Request|null $request The HTTP request.
	 *
	 * @return bool|\WP_Error
	 **/
	public function get_poll_permissions_check( $request = null ) {
		if ( $request && is_numeric( $request->get_param( 'poll_id' ) ) ) {
			return $this->editor_permission_check();
		}

		return true;
	}

	/**
	 * The get-poll-results permission check.
	 *
	 * @since $$next-version$$
	 *
	 * @return bool|\WP_Error
	 **/
	public function get_poll_results_permissions_check() {
		return $this->editor_permission_check();
	}

	/**
	 * Allow users who can edit posts; anonymous users get 401, others 403.
	 *
	 * @return bool|\WP_Error
	 **/
	private function editor_permission_check() {
		if ( current_user_can( 'edit_posts' ) ) {
			return true;
		}

		return new \WP_Error(
			'rest_forbidden',
			__( 'Sorry, you are not allowed to do that.', 'crowdsignal-forms' ),
			array( 'status' => rest_authorization_required_code() )
		);
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
	 * Returns a validator array for the get-a-poll by ID params.
	 *
	 * @see https://developer.wordpress.org/rest-api/extending-the-rest-api/adding-custom-endpoints/
	 * @since 0.9.0
	 * @return array
	 */
	protected function get_poll_fetch_params() {
		return array(
			'poll_id' => array(
				'validate_callback' => function ( $param, $request, $key ) {
					return true;
				},
			),
		);
	}

	/**
	 * Resolve a client UUID or numeric poll id to a numeric platform poll id the
	 * current user may read.
	 *
	 * Fails closed: a client UUID needs saved poll data whose owning post is
	 * readable; a numeric id needs at least one local owning post, and every
	 * owning post must be readable.
	 *
	 * @param string|int $poll_id Client UUID or numeric poll id.
	 * @return array{0: int|string, 1: array|null}|null The numeric poll id and, for a
	 *                                                   client UUID, its saved poll data;
	 *                                                   null if not found or unreadable.
	 */
	private function resolve_readable_poll( $poll_id ) {
		$gateway = Crowdsignal_Forms::instance()->get_post_poll_meta_gateway();

		if ( is_numeric( $poll_id ) ) {
			$post_ids = $gateway->get_post_ids_for_poll_id( $poll_id );

			// No local owner means a poll this site never recorded (e.g. one from another
			// site on the same Crowdsignal account), so fail closed rather than proxy it.
			if ( empty( $post_ids ) ) {
				return null;
			}

			foreach ( $post_ids as $post_id ) {
				if ( ! $this->is_owning_post_readable( $post_id ) ) {
					return null;
				}
			}

			return array( $poll_id, null );
		}

		$poll_saved_in_meta = $gateway->get_poll_data_for_poll_client_id( null, $poll_id );

		if ( empty( $poll_saved_in_meta['id'] ) ) {
			return null;
		}

		$location = $gateway->get_original_location_for_client_id( $poll_id );

		if ( ! $this->is_owning_post_readable( $location['post_id'] ) ) {
			return null;
		}

		return array( $poll_saved_in_meta['id'], $poll_saved_in_meta );
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
