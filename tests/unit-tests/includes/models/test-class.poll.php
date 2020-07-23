<?php
/**
 * File containing tests for \Crowdsignal_Forms\Rest_Api\Models\Poll
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Models\Poll;

/**
 * Class Polls_Controller_Test
 */
class Poll_Test extends Crowdsignal_Forms_Unit_Test_Case {
	/**
		* Set this up.
		*
	 * @since 0.9.0
	 */
	public function setUp() {
		parent::setUp();
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Poll::from_array
	 *
	 * @since 0.9.0
	 */
	public function test_from_array_defaults() {
		$poll = Poll::from_array( array() );
		$this->assertTrue( is_a( $poll,Poll::class ) );
		$this->assertSame( 0, $poll->get_id() );
		$this->assertSame( '', $poll->get_question() );
		$this->assertSame( 0, count( $poll->get_answers() ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Poll::from_array
	 *
	 * @since 0.9.0
	 */
	public function test_from_array() {
		$data = array(
			'answers' => array(),
			'settings' => array(),
			'id' => 1,
			'question' => 'Best Sci-fi film ever?'
		);
		$poll = Poll::from_array( $data );
		$this->assertTrue( is_a( $poll,Poll::class ) );
		$this->assertSame( 1, $poll->get_id() );
		$this->assertSame( 'Best Sci-fi film ever?', $poll->get_question() );
		$this->assertSame( 0, count( $poll->get_answers() ) );
	}
}
