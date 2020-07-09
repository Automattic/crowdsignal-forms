<?php
/**
 * File containing tests for \Crowdsignal_Forms\Auth\Crowdsignal_Forms_Auth.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;
use Crowdsignal_Forms\Auth\Api_Auth_Provider_Interface;

/**
 * Class Crowdsignal_Auth_Test
 */
class Crowdsignal_Forms_Api_Auth_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * Tests that a custom auth provider is used when the filter has been set.
	 */
	public function test_custom_provider() {
		/**
		 * Hook into filter to use a custom provider.
		 *
		 * @return TestProvider
		 */
		function register_provider() {
			return new TestProvider();
		}
		add_filter( 'crowdsignal_forms_get_auth_provider', 'register_provider' );

		$cs_auth = new Crowdsignal_Forms_Api_Authenticator();

		$this->assertEquals( 'test-user-code', $cs_auth->get_user_code() );
	}
}

class TestProvider implements Api_Auth_Provider_Interface {

	public function get_user_code( $user_id ) {
		return 'test-user-code';
	}

	/**
	 * @inheritDoc
	 */
	public function fetch_user_code( $user_id ) {
		// TODO: Implement fetch_user_code() method.
		return 'test-user-code';
	}

	/**
	 * @inheritDoc
	 */
	public function fetch_user_code_for_key( $api_key ) {
		// TODO: Implement fetch_user_code_for_key() method.
		return 'test-user-code';
	}
}
