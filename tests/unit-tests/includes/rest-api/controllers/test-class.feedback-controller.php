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
	 * @param int    $survey_id The platform survey id to store.
	 */
	private function setup_survey_meta( $post_id, $client_id, $survey_id = 555 ) {
		update_post_meta(
			$post_id,
			'_cs_survey_' . $client_id,
			array(
				'id'    => $survey_id,
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

	public function test_get_survey_denies_password_protected_post() {
		$post_id   = $this->factory->post->create(
			array(
				'post_status'   => 'publish',
				'post_password' => 'secret',
			)
		);
		$client_id = 'uuid-feedback-password';
		$this->setup_survey_meta( $post_id, $client_id );

		$req = new \WP_REST_Request( 'GET', '/feedback' );
		$req->set_param( 'survey_client_id', $client_id );

		$response = $this->controller->get_survey( $req );
		$this->assertWPError( $response );
		$this->assertEquals( 404, $response->get_error_data()['status'] );
	}

	/**
	 * When the same client_id is stored on two posts (a copy/paste scenario),
	 * the data returned and the post whose readability is checked must come
	 * from the same row. Here the readable (published) post has the lower
	 * post_id, so the deterministic resolution serves ITS data - never the
	 * private copy's - proving the two gateway queries agree on one row.
	 */
	public function test_get_survey_binds_data_to_the_readability_checked_post() {
		$client_id = 'uuid-feedback-shared';

		// Lower post_id, published: this is the row both queries must resolve to.
		$public_post_id = $this->factory->post->create( array( 'post_status' => 'publish' ) );
		$this->setup_survey_meta( $public_post_id, $client_id, 111 );

		// Higher post_id, private: must not influence the served data.
		$private_post_id = $this->factory->post->create( array( 'post_status' => 'private' ) );
		$this->setup_survey_meta( $private_post_id, $client_id, 222 );

		$req = new \WP_REST_Request( 'GET', '/feedback' );
		$req->set_param( 'survey_client_id', $client_id );

		$response = $this->controller->get_survey( $req );
		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertSame( 111, $response->get_data()['id'] );
	}
}
