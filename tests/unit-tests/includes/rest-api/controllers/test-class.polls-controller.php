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
		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id', 1 );
		$response = $this->controller->get_poll_results( $req );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
	}
}
