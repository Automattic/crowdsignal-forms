<?php
/**
 * File containing tests for \Crowdsignal_Forms\Rest_Api\Controllers\Account_Controller
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways\Canned_Api_Gateway;
use Crowdsignal_Forms\Rest_Api\Controllers\Account_Controller;

/**
 * Class Account_Controller_Test
 */
class Account_Controller_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * @var Account_Controller
	 */
	private $controller = null;

	/**
	 * Set this up.
	 *
	 * @since 0.9.0
	 */
	public function setUp() {
		parent::setUp();
		global $wp_rest_server;
		$wp_rest_server = new WP_REST_Server();
		$this->server   = $wp_rest_server;

		do_action( 'rest_api_init' );
		$this->controller = new Account_Controller();
	}

	/**
	 * Test specific teardown.
	 * @since 0.9.0
	 */
	public function tearDown() {
		parent::tearDown();

		global $wp_rest_server;
		$wp_rest_server = null;
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Polls_Controller::get_poll
	 *
	 * @since 0.9.0
	 */
	public function test_get_capabilities() {
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( new Canned_Api_Gateway() );
		$req = new \WP_REST_Request( 'GET', '/account/capabilities' );
		$response = $this->controller->get_capabilities( $req );
		$this->assertTrue( is_a( $response, \WP_REST_Response::class ) );
		$this->assertTrue( $response->get_status() === 200 );
		$this->assertTrue( in_array( 'hide-branding', $response->data ) );
	}
}
