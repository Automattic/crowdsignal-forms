<?php
/**
 * File containing tests for \Crowdsignal_Forms\Gateways\Canned_Api_Gateway.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways;

/**
 * Class Canned_Api_Gateway_Test
 */
class Canned_Api_Gateway_Test extends Crowdsignal_Forms_Unit_Test_Case {
	/**
	 * @covers \Crowdsignal_Forms\Gateways\Canned_Api_Gateway
	 *
	 * @since 0.9.0
	 */
	public function test_exists() {
		$this->assertTrue( class_exists('\Crowdsignal_Forms\Gateways\Canned_Api_Gateway' ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Canned_Api_Gateway::get_poll
	 *
	 * @since 0.9.0
	 */
	public function test_get_poll_returns_poll_if_in_canned_data() {
		$gateway = new Gateways\Canned_Api_Gateway();
		$poll = $gateway->get_poll( 1 );
		$this->assertTrue( ! is_wp_error( $poll ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Canned_Api_Gateway::get_poll
	 *
	 * @since 0.9.0
	 */
	public function test_get_poll_returns_error_if_not_in_canned_data() {
		$gateway = new Gateways\Canned_Api_Gateway();
		$poll = $gateway->get_poll( 666 );
		$this->assertTrue( is_wp_error( $poll ) );
	}
}
