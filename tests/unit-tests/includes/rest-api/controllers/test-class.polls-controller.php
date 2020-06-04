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
 */
class Polls_Controller_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * @var Polls_Controller
	 */
	private $controller = null;

	/**
	 * Set this up.
	 *
	 * @since 1.0.0
	 */
	public function setUp() {
		parent::setUp();
		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;

		do_action( 'rest_api_init' );
		$this->controller = new Polls_Controller();
	}

	/**
	 * Test specific teardown.
	 * @since 1.0.0
	 */
	public function tearDown() {
		parent::tearDown();

		global $wp_rest_server;
		$wp_rest_server = null;
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller
	 *
	 * @since 1.0.0
	 */
	public function test_has_get_polls() {
			$this->assertTrue( method_exists( $this->controller, 'get_polls' ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller
	 *
	 * @since 1.0.0
	 */
	public function test_has_get_poll() {
			$this->assertTrue( method_exists( $this->controller, 'get_poll' ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_polls
	 *
	 * @since 1.0.0
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
	 * @since 1.0.0
	 */
	public function test_get_poll() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id',  1 );
		$response = $this->controller->get_poll( $req );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll_results
	 *
	 * @since 1.0.0
	 */
	public function test_get_poll_results() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$req = new \WP_REST_Request( 'GET', '/polls' );
		$req->set_param( 'poll_id',  1 );
		$response = $this->controller->get_poll_results( $req );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::update_poll
	 *
	 * @since 1.0.0
	 */
	public function test_update_poll_400_when_incorrect_user_perms() {
		$this->login_as_default_user();
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$request = new \WP_REST_Request( 'POST', '/crowdsignal-forms/v1/polls' );
		$request->set_param( 'poll_id',  1 );

		$response = $this->server->dispatch( $request );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 401 );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::update_poll
	 *
	 * @since 1.0.0
	 */
	public function test_update_poll_succeed_when_correct_user_perms() {
		$this->login_as_editor();
		$gateway = $this->createMock( '\Crowdsignal_Forms\Gateways\Api_Gateway' );
		$gateway->expects( $this->once() )->method( 'update_poll' )->will(
			$this->returnValue(
				Poll::from_array(
					array(
						'id' => 1,
						'question' => 'Favorite polling plaftorm?',
						'answers' => array(
							array(
								'id' => 1,
								'answer_text' => 'Crowdsignal',
							),
							array(
								'id' => 2,
								'answer_text' => 'Crowdsignal I said!',
							)
						),
					)
				)
			)
		);
		$gateway->expects( $this->never() )->method( 'create_poll' );

		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$request = new \WP_REST_Request( 'POST', '/crowdsignal-forms/v1/polls/1'  );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_param( 'poll_id',  1 );
		$request->set_body( json_encode( array(
			'question' => 'Hello?',
		) ) );

		$response = $this->server->dispatch( $request );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( 200 === $response->get_status() );
	}
}
