<?php
/**
 * File containing tests for \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways\Canned_Api_Gateway;
use Crowdsignal_Forms\Models\Poll;
use Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller;

/**
 * Class Polls_Controller_Test
 *
 * Note: Poll mutation endpoints (create, update, archive) have been removed.
 * Poll mutations are handled via save_post hook in Poll_Block_Synchronizer.
 * This test class only covers the read-only endpoints.
 */
class Polls_Controller_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * @var Polls_Controller
	 */
	private $controller = null;

	/**
	 * Set this up.
	 *
	 * @since 0.9.0
	 */
	public function set_up() {
		parent::set_up();
		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;

		do_action( 'rest_api_init' );
		$this->controller = new Polls_Controller();
	}

	/**
	 * Test specific teardown.
	 * @since 0.9.0
	 */
	public function tear_down() {
		parent::tear_down();

		global $wp_rest_server;
		$wp_rest_server = null;
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller
	 *
	 * @since 0.9.0
	 */
	public function test_has_get_polls() {
			$this->assertTrue( method_exists( $this->controller, 'get_polls' ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller
	 *
	 * @since 0.9.0
	 */
	public function test_has_get_poll() {
			$this->assertTrue( method_exists( $this->controller, 'get_poll' ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_polls
	 *
	 * @since 0.9.0
	 */
	public function test_get_polls() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$response = $this->controller->get_polls();
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 *
	 * @since 0.9.0
	 */
	public function test_get_poll() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$this->setup_poll_meta( $post_id, 'uuid-test_get_poll', 1 );
		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', 1 );
		$response = $this->controller->get_poll( $req );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll_results
	 *
	 * @since 0.9.0
	 */
	public function test_get_poll_results() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$this->setup_poll_meta( $post_id, 'uuid-test_get_poll_results', 1 );
		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', 1 );
		$response = $this->controller->get_poll_results( $req );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
	}

	/**
	 * Helper: store poll meta on a post.
	 *
	 * @param int    $post_id   The post id.
	 * @param string $client_id The poll client uuid.
	 */
	private function setup_poll_meta( $post_id, $client_id, $poll_id = 123 ) {
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id,
			array(
				'id'       => $poll_id,
				'question' => 'Secret question?',
			)
		);
		update_post_meta( $post_id, '_crowdsignal_forms_poll_ids', array( $poll_id ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_post_poll_by_uuid
	 */
	public function test_post_poll_by_uuid_denies_private_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$client_id = 'uuid-private-poll';
		$this->setup_poll_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/post-polls' );
		$req->set_param( 'post_id', $post_id );
		$req->set_param( 'poll_uuid', $client_id );

		$response = $this->controller->get_post_poll_by_uuid( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_post_poll_by_uuid
	 */
	public function test_post_poll_by_uuid_allows_published_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$client_id = 'uuid-public-poll';
		$this->setup_poll_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/post-polls' );
		$req->set_param( 'post_id', $post_id );
		$req->set_param( 'poll_uuid', $client_id );

		$response = $this->controller->get_post_poll_by_uuid( $req );
		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_cached_denies_private_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$client_id = 'uuid-cached-private';
		$this->setup_poll_meta( $post_id, $client_id );

		$_REQUEST['cached'] = '1';
		$req                = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', $client_id );

		$response = $this->controller->get_poll( $req );
		unset( $_REQUEST['cached'] );

		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_cached_allows_published_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$client_id = 'uuid-cached-public';
		$this->setup_poll_meta( $post_id, $client_id );

		$_REQUEST['cached'] = '1';
		$req                = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', $client_id );

		$response = $this->controller->get_poll( $req );
		unset( $_REQUEST['cached'] );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_cached_denies_password_protected_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create(
			array(
				'post_status'   => 'publish',
				'post_password' => 'secret',
			)
		);
		$client_id = 'uuid-cached-password';
		$this->setup_poll_meta( $post_id, $client_id );

		$_REQUEST['cached'] = '1';
		$req                = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', $client_id );

		$response = $this->controller->get_poll( $req );
		unset( $_REQUEST['cached'] );

		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_post_poll_by_uuid
	 */
	public function test_post_poll_by_uuid_denies_password_protected_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create(
			array(
				'post_status'   => 'publish',
				'post_password' => 'secret',
			)
		);
		$client_id = 'uuid-uuid-password';
		$this->setup_poll_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/post-polls' );
		$req->set_param( 'post_id', $post_id );
		$req->set_param( 'poll_uuid', $client_id );

		$response = $this->controller->get_post_poll_by_uuid( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * When the same client_id is stored on two posts (a copy/paste scenario),
	 * the cached poll data returned and the post whose readability is checked
	 * must come from the same row. Here the readable (published) post has the
	 * lower post_id, so the deterministic resolution serves ITS poll - never
	 * the private copy's - proving the data and location queries agree.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_cached_binds_data_to_the_readability_checked_post() {
		wp_set_current_user( 0 );
		$client_id = 'uuid-cached-shared';

		// Lower post_id, published: this is the row both queries must resolve to.
		$public_post_id = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$this->setup_poll_meta( $public_post_id, $client_id, 111 );

		// Higher post_id, private: must not influence the served data.
		$private_post_id = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$this->setup_poll_meta( $private_post_id, $client_id, 222 );

		$_REQUEST['cached'] = '1';
		$req                = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', $client_id );

		$response = $this->controller->get_poll( $req );
		unset( $_REQUEST['cached'] );

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertSame( 111, $response->get_data()['id'] );
	}

	/**
	 * Data provider: [ owning post args ] that an anonymous user must not read.
	 *
	 * @return array
	 */
	public function unreadable_post_provider() {
		return array(
			'private'            => array( array( 'post_status' => 'private' ) ),
			'draft'              => array( array( 'post_status' => 'draft' ) ),
			'password protected' => array(
				array(
					'post_status'   => 'publish',
					'post_password' => 'secret',
				)
			),
		);
	}

	/**
	 * @dataProvider unreadable_post_provider
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_by_numeric_id_denies_unreadable_post( $post_args ) {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id = $this->factory->post->create( $post_args );
		$this->setup_poll_meta( $post_id, 'uuid-numeric-denied', 456 );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', '456' );

		$response = $this->controller->get_poll( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * @dataProvider unreadable_post_provider
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll_results
	 */
	public function test_get_poll_results_by_numeric_id_denies_unreadable_post( $post_args ) {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id = $this->factory->post->create( $post_args );
		$this->setup_poll_meta( $post_id, 'uuid-results-numeric-denied', 456 );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', '456' );

		$response = $this->controller->get_poll_results( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * @dataProvider unreadable_post_provider
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll_results
	 */
	public function test_get_poll_results_by_uuid_denies_unreadable_post( $post_args ) {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id   = $this->factory->post->create( $post_args );
		$client_id = 'uuid-results-uuid-denied';
		$this->setup_poll_meta( $post_id, $client_id, 456 );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', $client_id );

		$response = $this->controller->get_poll_results( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * Regression test for the full scenario: a poll is readable while its post is
	 * published, then 404s on every route once the post is made private.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll_results
	 */
	public function test_numeric_poll_routes_follow_post_status_transitions() {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$this->setup_poll_meta( $post_id, 'uuid-transition', 1 );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', 1 );

		$this->assertEquals( 200, $this->controller->get_poll( $req )->get_status() );
		$this->assertEquals( 200, $this->controller->get_poll_results( $req )->get_status() );

		wp_update_post(
			array(
				'ID'          => $post_id,
				'post_status' => 'private',
			)
		);

		$this->assertWPError( $this->controller->get_poll( $req ) );
		$this->assertWPError( $this->controller->get_poll_results( $req ) );
	}

	/**
	 * A numeric id with no local association fails closed.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll_results
	 */
	public function test_numeric_poll_id_without_local_post_is_not_found() {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', '987654' );

		$response = $this->controller->get_poll( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );

		$response = $this->controller->get_poll_results( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * If any post carrying the poll is unreadable, deny.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_numeric_poll_id_shared_with_unreadable_post_is_denied() {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$public_post_id  = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$private_post_id = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$this->setup_poll_meta( $public_post_id, 'uuid-shared-a', 321 );
		$this->setup_poll_meta( $private_post_id, 'uuid-shared-b', 321 );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', '321' );

		$this->assertWPError( $this->controller->get_poll( $req ) );
	}

	/**
	 * Logged-in users who can read the post (e.g. editors of a private post) still get the poll.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_by_numeric_id_allows_user_who_can_read_post() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		wp_set_current_user( $this->factory->user->create( array( 'role' => 'administrator' ) ) );
		$post_id = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$this->setup_poll_meta( $post_id, 'uuid-admin-private', 1 );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', 1 );

		$this->assertEquals( 200, $this->controller->get_poll( $req )->get_status() );
	}

	/**
	 * A poll that belongs to a comment on a private post is still gated by that post.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 */
	public function test_get_poll_by_numeric_id_denies_comment_poll_on_private_post() {
		wp_set_current_user( 0 );
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$post_id = $this->factory->post->create( array( 'post_status' => 'private' ) );
		update_post_meta( $post_id, '_crowdsignal_forms_comment_poll_ids_5', array( 555 ) );

		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', '555' );

		$this->assertWPError( $this->controller->get_poll( $req ) );
	}
}
