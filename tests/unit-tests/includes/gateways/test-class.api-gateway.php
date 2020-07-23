<?php
/**
 * File containing tests for \Crowdsignal_Forms\Gateways\Api_Gateway
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways;

/**
 * Class Api_Gateway
 */
class Api_Gateway_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Api_Gateway
	 *
	 * @since 0.9.0
	 */
	public function test_exists() {
		$this->assertTrue( class_exists('\Crowdsignal_Forms\Gateways\Api_Gateway' ) );
	}
}
