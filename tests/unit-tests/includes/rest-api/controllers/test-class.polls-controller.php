<?php
/**
 * File containing tests for \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways\Canned_Api_Gateway;
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
		$this->controller = new Polls_Controller();
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
}
