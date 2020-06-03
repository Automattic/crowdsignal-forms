<?php

class Crowdsignal_Forms_Unit_Test_Case extends WP_UnitTestCase {
	/**
	 * Default User ID
	 *
	 * @var int
	 */
	protected $default_user_id;

	/**
	 * Sets up each test.
	 */
	public function setUp() {
		parent::setUp();

		$this->default_user_id = get_current_user_id();
	}

	/**
	 * Retrieve a test user of a particular role.
	 *
	 * @param string $role Role of the user to create.
	 * @return int
	 */
	protected function get_user_by_role( $role ) {
		$user_prefix = 'crowdsignal_forms_';
		$user = get_user_by( 'email', $user_prefix . $role . '_user@example.com' );
		if ( empty( $user ) ) {
			$user_id = wp_create_user(
				$user_prefix . $role . '_user',
				$user_prefix . $role . '_user',
				$user_prefix . $role . '_user@example.com'
			);
			$user    = get_user_by( 'ID', $user_id );
			$user->set_role( $role );
		}
		return $user->ID;
	}

	/**
	 * Login as an admin user.
	 *
	 * @return self
	 */
	protected function login_as_admin() {
		return $this->login_as( $this->get_user_by_role( 'administrator' ) );
	}

	/**
	 * Login as an editor user.
	 *
	 * @return self
	 */
	protected function login_as_editor() {
		return $this->login_as( $this->get_user_by_role( 'editor' ) );
	}

	/**
	 * Login as the default user.
	 *
	 * @return self
	 */
	protected function login_as_default_user() {
		return $this->login_as( $this->default_user_id );
	}

	/**
	 * Login as a particular user.
	 *
	 * @param int $user_id ID for the user to login as.
	 * @return self
	 */
	protected function login_as( $user_id ) {
		wp_set_current_user( $user_id );
		return $this;
	}

}
