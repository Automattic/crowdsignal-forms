<?php
/**
 * File containing tests for \Crowdsignal_Forms\Auth\Crowdsignal_Forms_Auth.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Auth;

/**
 * Class Crowdsignal_Auth_Test
 */
class Crowdsignal_Forms_Api_Auth_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * Tests that the default auth provider is used when no filter has been set.
	 * TODO: Update this test after actually implementing default provider.
	 */
	public function test_default_provider() {
		$cs_auth = new Crowdsignal_Forms_Api_Authenticator();

		$this->assertEquals( '', $cs_auth->get_user_code() );
	}

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

class TestProvider implements Auth\Api_Auth_Provider_Interface {

	public function get_user_code( $user_id )
	{
		return 'test-user-code';
	}
}
