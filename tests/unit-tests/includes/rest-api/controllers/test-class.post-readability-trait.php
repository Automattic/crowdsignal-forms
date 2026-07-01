<?php
/**
 * Tests for Post_Readability_Trait.
 *
 * @package crowdsignal-forms\Tests
 */

/**
 * Test double exposing the protected trait method.
 */
class Post_Readability_Trait_Test_Double {
	use \Crowdsignal_Forms\Rest_Api\Controllers\Post_Readability_Trait;

	/**
	 * Public wrapper.
	 *
	 * @param int|null $post_id The post id.
	 * @return bool
	 */
	public function check( $post_id ) {
		return $this->is_owning_post_readable( $post_id );
	}
}

/**
 * Class Post_Readability_Trait_Test
 */
class Post_Readability_Trait_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * The test double.
	 *
	 * @var Post_Readability_Trait_Test_Double
	 */
	private $subject;

	/**
	 * Set up.
	 */
	public function set_up() {
		parent::set_up();
		wp_set_current_user( 0 );
		$this->subject = new Post_Readability_Trait_Test_Double();
	}

	public function test_published_post_is_readable() {
		$post_id = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$this->assertTrue( $this->subject->check( $post_id ) );
	}

	public function test_private_post_is_not_readable_for_anonymous() {
		$post_id = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$this->assertFalse( $this->subject->check( $post_id ) );
	}

	public function test_draft_post_is_not_readable_for_anonymous() {
		$post_id = $this->factory->post->create( array( 'post_status' => 'draft' ) );
		$this->assertFalse( $this->subject->check( $post_id ) );
	}

	public function test_password_protected_post_is_not_readable_for_anonymous() {
		$post_id = $this->factory->post->create(
			array(
				'post_status'   => 'publish',
				'post_password' => 'secret',
			)
		);
		$this->assertFalse( $this->subject->check( $post_id ) );
	}

	public function test_missing_post_is_not_readable() {
		$this->assertFalse( $this->subject->check( 999999 ) );
	}

	public function test_null_post_id_is_not_readable() {
		$this->assertFalse( $this->subject->check( null ) );
	}

	public function test_private_post_is_readable_for_editor() {
		$editor_id = $this->factory->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $editor_id );
		$post_id = $this->factory->post->create(
			array(
				'post_status' => 'private',
				'post_author' => $editor_id,
			)
		);
		$this->assertTrue( $this->subject->check( $post_id ) );
	}
}
