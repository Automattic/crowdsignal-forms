<?php
/**
 * File containing tests for \Crowdsignal_Forms\Auth\Crowdsignal_Forms_Auth.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Gateways\Api_Gateway_Interface;
use Crowdsignal_Forms\Models\Poll;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

/**
 * Class Crowdsignal_Auth_Test
 */
class Crowdsignal_Forms_Admin_Hooks_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * Does not call create_poll if post contains no poll blocks
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::save_polls_to_api
	 */
	public function test_will_not_call_create_poll_on_save_if_no_poll_block() {
		$gateway = $this->createMock( Api_Gateway_Interface::class );

		$gateway->expects( $this->never() )
			->method( 'create_poll' );

		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$this->factory->post->create( array( 'post_title' => 'My Title' ) );
	}

	/**
	 * Calls create_poll if post contains a poll block that is not already "saved"
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::save_polls_to_api
	 */
	public function test_will_call_create_poll_on_save_if_poll_block() {
		$poll_client_id = '9c3abf7a-9f15-4304-8f13-77b8ae4467ea';

		$poll_block_attrs = [
			'pollId' => $poll_client_id,
			'question' => 'A poll for testing creating on the api',
	  		'note' => 'with a note',
			"answers" => [
				[
					'answerId' => '1386199c-f3da-4ddf-a23c-031eb1205bd4',
					"text"=> "An answer",
				],
				[
					'answerId' => '9c3abf7a-9f15-4304-8f13-77b8ae4467ea',
					"text"=> "green",
				],
				[
					'answerId' => '0bf73c9d-b087-4d67-b7c5-104c347c30c0',
					"text"=> "blue",
				],
				[
					'answerId' => '80f3376d-ead3-4010-9dd2-e7c7e7d7da57',
					"text"=> "blue",
				],
			],
		];

		$serialized_attrs = json_encode( $poll_block_attrs );

		$post_content_with_a_poll_block = '<!-- wp:crowdsignal-forms/poll ' . $serialized_attrs . ' /-->';
		$gateway = $this->createMock( Api_Gateway_Interface::class );

		$gateway->expects( $this->once() )
			->method( 'create_poll' )->will( $this->returnValue( Poll::from_array(
				array(
					'id' => 1,
	  				'client_id' => $poll_client_id,
	  				'question'  => $poll_block_attrs['question'],
	  				'note'      => $poll_block_attrs['note'],
	  				"answers" => [
	  					[
	  						"id"=> 123000,
							'client_id' => '1386199c-f3da-4ddf-a23c-031eb1205bd4',
							"answer_text"=> "An answer",
							"answer_count"=> 42
						],
						[
							"id"=> 123400,
							'client_id' => '9c3abf7a-9f15-4304-8f13-77b8ae4467ea',
							"answer_text"=> "green",
							"answer_count"=> 11
						],
						[
							"id"=> 123450,
							'client_id' => '0bf73c9d-b087-4d67-b7c5-104c347c30c0',
							"answer_text"=> "blue",
							"answer_count"=> 42
						],
						[
							"id"=> 123456,
							'client_id' => '80f3376d-ead3-4010-9dd2-e7c7e7d7da57',
							"answer_text"=> "blue",
							"answer_count"=> 42
						],
					]
				)
			) ) );

		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$authenticator = $this->createMock( Crowdsignal_Forms_Api_Authenticator::class );
		$authenticator->expects( $this->once() )
			->method( 'get_user_code' )
			->will( $this->returnValue( 'asdf1234' ) );

		Crowdsignal_Forms::instance()->set_api_authenticator( $authenticator );

		$post_id = $this->factory->post->create( array(
			'post_title' => 'My Title',
			'post_content' => $post_content_with_a_poll_block,
		) );

		$meta = Crowdsignal_Forms::instance()->get_post_poll_meta_gateway()
			->get_poll_data_for_poll_client_id( $post_id, $poll_client_id );

		$this->assertNotEmpty( $meta );
		$this->assertArrayHasKey( 'client_id', $meta );
		$this->assertSame( $meta['client_id'], $poll_client_id );
	}
}
