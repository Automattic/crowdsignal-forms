<?php
/**
 * File containing tests for \Crowdsignal_Forms\Gateways\Api_Gateway_Interface.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways;

/**
 * Class Api_Gateway_Interface_Test
 */
class Api_Gateway_Interface_Test extends Crowdsignal_Forms_Unit_Test_Case {

    /**
     * @covers \Crowdsignal_Forms\Gateways\Api_Gateway_Interface
     *
     * @since 0.9.0
     */
    public function testInterfaceExists() {
        $this->assertTrue( interface_exists('\Crowdsignal_Forms\Gateways\Api_Gateway_Interface' ) );
    }

    /**
     * @covers \Crowdsignal_Forms\Gateways\Api_Gateway_Interface::get_poll\
     *
     * @since 0.9.0
     */
    public function testInterfaceDefinesGetPoll() {
        $this->assertTrue( method_exists('\Crowdsignal_Forms\Gateways\Api_Gateway_Interface', 'get_poll' ) );
    }

    /**
     * @covers \Crowdsignal_Forms\Gateways\Api_Gateway_Interface::create_poll
     *
     * @since 0.9.0
     */
    public function testInterfaceDefinesCreatePoll() {
        $this->assertTrue( method_exists('\Crowdsignal_Forms\Gateways\Api_Gateway_Interface', 'create_poll' ) );
    }
}
