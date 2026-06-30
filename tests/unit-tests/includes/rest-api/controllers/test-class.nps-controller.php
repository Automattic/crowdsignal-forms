<?php
/**
 * File containing tests for \Crowdsignal_Forms\Rest_Api\Controllers\Nps_Controller
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways\Canned_Api_Gateway;
use Crowdsignal_Forms\Rest_Api\Controllers\Nps_Controller;
use Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_Block;

/**
 * Test double exposing a canned NPS response so the accept path can be
 * exercised without hitting the real Crowdsignal API. update_nps_response is
 * not part of Api_Gateway_Interface, so Canned_Api_Gateway does not provide it.
 */
class Nps_Controller_Test_Gateway extends Canned_Api_Gateway {
	/**
	 * The last data passed to update_nps_response, or null if never called.
	 *
	 * @var array|null
	 */
	public $received = null;

	/**
	 * Record the call and return a canned response.
	 *
	 * @param  int   $survey_id Survey ID.
	 * @param  array $data      Request data.
	 * @return array
	 */
	public function update_nps_response( $survey_id, array $data ) {
		$this->received = $data;
		return array( 'r' => '12345' );
	}
}

/**
 * Class Nps_Controller_Test
 */
class Nps_Controller_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * @var Nps_Controller
	 */
	private $controller = null;

	public function set_up() {
		parent::set_up();
		$this->controller = new Nps_Controller();
	}

	/**
	 * Build a response submission request.
	 *
	 * @param array $body JSON body params.
	 * @return \WP_REST_Request
	 */
	private function make_request( array $body ) {
		$request = new \WP_REST_Request( 'POST', '/crowdsignal-forms/v1/nps/1/response' );
		$request->set_param( 'survey_id', 1 );
		$request->set_header( 'content-type', 'application/json' );
		$request->set_body( wp_json_encode( $body ) );
		return $request;
	}

	/**
	 * The checksum produced for a response id must not be derivable from the
	 * response id and nonce alone: it must depend on a server-side secret.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Nps_Controller::upsert_nps_response
	 */
	public function test_update_with_forged_unkeyed_checksum_is_rejected() {
		$nonce = wp_create_nonce( Crowdsignal_Forms_Nps_Block::NONCE );
		$r     = '987654';

		// The pre-fix scheme any attacker could compute: sha1( r . nonce ).
		$forged = hash( 'sha1', $r . $nonce );

		$response = $this->controller->upsert_nps_response(
			$this->make_request(
				array(
					'nonce'    => $nonce,
					'r'        => $r,
					'checksum' => $forged,
					'feedback' => 'attacker',
				)
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'Forbidden', $response->get_error_code() );
	}

	/**
	 * An update ( r present ) with no checksum must be rejected.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Nps_Controller::upsert_nps_response
	 */
	public function test_update_without_checksum_is_rejected() {
		$nonce = wp_create_nonce( Crowdsignal_Forms_Nps_Block::NONCE );

		$response = $this->controller->upsert_nps_response(
			$this->make_request(
				array(
					'nonce'    => $nonce,
					'r'        => '987654',
					'checksum' => '',
					'feedback' => 'attacker',
				)
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'Forbidden', $response->get_error_code() );
	}

	/**
	 * An invalid nonce is always rejected.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Nps_Controller::upsert_nps_response
	 */
	public function test_invalid_nonce_is_rejected() {
		$response = $this->controller->upsert_nps_response(
			$this->make_request(
				array(
					'nonce' => 'not-a-real-nonce',
					'score' => 5,
				)
			)
		);

		$this->assertWPError( $response );
		$this->assertSame( 'Forbidden', $response->get_error_code() );
	}

	/**
	 * Store survey meta on a post.
	 *
	 * @param int    $post_id   The post id.
	 * @param string $client_id The survey client uuid.
	 */
	private function setup_nps_survey_meta( $post_id, $client_id ) {
		update_post_meta(
			$post_id,
			'_cs_survey_' . $client_id,
			array(
				'id'    => 777,
				'title' => 'Secret NPS',
			)
		);
	}

	public function test_get_survey_denies_private_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$client_id = 'uuid-nps-private';
		$this->setup_nps_survey_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/nps' );
		$req->set_param( 'survey_client_id', $client_id );

		$response = $this->controller->get_survey( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	public function test_get_survey_allows_published_post() {
		wp_set_current_user( 0 );
		$post_id   = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$client_id = 'uuid-nps-public';
		$this->setup_nps_survey_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/nps' );
		$req->set_param( 'survey_client_id', $client_id );

		$response = $this->controller->get_survey( $req );
		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
	}

	/**
	 * A first submission ( no r ) does not require a checksum, and the
	 * controller returns a checksum the original submitter can later use to
	 * update that response.
	 *
	 * @covers \Crowdsignal_Forms\Rest_Api\Controllers\Nps_Controller::upsert_nps_response
	 */
	public function test_create_returns_checksum_that_authorizes_update() {
		$gateway = new Nps_Controller_Test_Gateway();
		Crowdsignal_Forms\Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$nonce = wp_create_nonce( Crowdsignal_Forms_Nps_Block::NONCE );

		// Create: no r, no checksum required.
		$created = $this->controller->upsert_nps_response(
			$this->make_request(
				array(
					'nonce' => $nonce,
					'score' => 7,
				)
			)
		);

		$this->assertInstanceOf( \WP_REST_Response::class, $created );
		$data = $created->get_data();
		$this->assertSame( '12345', $data['r'] );
		$this->assertNotEmpty( $data['checksum'] );

		// The issued checksum authorizes an update of that response id.
		$updated = $this->controller->upsert_nps_response(
			$this->make_request(
				array(
					'nonce'    => $nonce,
					'r'        => $data['r'],
					'checksum' => $data['checksum'],
					'feedback' => 'legit follow-up',
				)
			)
		);

		$this->assertInstanceOf( \WP_REST_Response::class, $updated );
		$this->assertSame( 'legit follow-up', $gateway->received['feedback'] );
	}
}
