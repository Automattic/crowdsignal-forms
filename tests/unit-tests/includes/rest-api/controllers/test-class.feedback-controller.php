<?php
/**
 * Tests for Feedback_Controller.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Rest_Api\Controllers\Feedback_Controller;

/**
 * Class Feedback_Controller_Test
 */
class Feedback_Controller_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * @var Feedback_Controller
	 */
	private $controller;

	/**
	 * Set up.
	 */
	public function set_up() {
		parent::set_up();
		wp_set_current_user( 0 );
		$this->controller = new Feedback_Controller();
	}

	/**
	 * Store survey meta on a post.
	 *
	 * @param int    $post_id   The post id.
	 * @param string $client_id The survey client uuid.
	 */
	private function setup_survey_meta( $post_id, $client_id ) {
		update_post_meta(
			$post_id,
			'_cs_survey_' . $client_id,
			array(
				'id'    => 555,
				'title' => 'Secret survey',
			)
		);
	}

	public function test_get_survey_denies_private_post() {
		$post_id   = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$client_id = 'uuid-feedback-private';
		$this->setup_survey_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/feedback' );
		$req->set_param( 'survey_client_id', $client_id );

		$response = $this->controller->get_survey( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	public function test_get_survey_allows_published_post() {
		$post_id   = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$client_id = 'uuid-feedback-public';
		$this->setup_survey_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/feedback' );
		$req->set_param( 'survey_client_id', $client_id );

		$response = $this->controller->get_survey( $req );
		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
	}
}
