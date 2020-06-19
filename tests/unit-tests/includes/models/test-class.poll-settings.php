<?php
/**
 * File containing tests for \Crowdsignal_Forms\Rest_Api\Models\Poll_Settings
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Models\Poll_Settings;

/**
 * Class Polls_SettingsTest
 */
class Poll_SettingsTest extends Crowdsignal_Forms_Unit_Test_Case {
	/**
		* Set this up.
		*
	 * @since 1.0.0
	 */
	public function setUp() {
		parent::setUp();
	}

	/**
	 * @covers \Crowdsignal_Forms\Models\Poll_Settings::from_block
	 *
	 * @since 1.0.0
	 */
	public function test_from_array() {
		$tests_dir = Crowdsignal_Forms_Unit_Tests_Bootstrap::instance()->tests_dir;
		$data = file_get_contents( $tests_dir . '/canned-data/block-data-empty.json' );
		$poll_settings = Poll_Settings::from_array( json_decode( $data, true ) );
		$this->assertTrue( is_a( $poll_settings, Poll_Settings::class ) );
		$poll_array = $poll_settings->to_array();
		$this->assertTrue( array_key_exists( 'title', $poll_array ), 'Poll array should have a "title" prop' );
		$this->assertTrue( array_key_exists( 'after_vote', $poll_array ), 'Poll array should have a "after_vote" prop' );
		$this->assertTrue( array_key_exists( 'after_message', $poll_array ), 'Poll array should have a "after_message" prop' );
		$this->assertTrue( array_key_exists( 'redirect_url', $poll_array ), 'Poll array should have a "redirect_url" prop' );
		$this->assertTrue( array_key_exists( 'randomize_answers', $poll_array ), 'Poll array should have a "randomize_answers" prop' );
		$this->assertTrue( array_key_exists( 'restrict_vote_repeat', $poll_array ), 'Poll array should have a "restrict_vote_repeat" prop' );
		$this->assertTrue( array_key_exists( 'captcha', $poll_array ), 'Poll array should have a "captcha" prop' );
		$this->assertTrue( array_key_exists( 'multiple_choice', $poll_array ), 'Poll array should have a "multiple_choice" prop' );
		$this->assertTrue( array_key_exists( 'close_status', $poll_array ), 'Poll array should have a "close_status" prop' );
		$this->assertTrue( array_key_exists( 'close_after', $poll_array ), 'Poll array should have a "close_after" prop' );
	}
}
