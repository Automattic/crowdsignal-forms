<?php
/**
 * Tests for \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway;

/**
 * Class Post_Survey_Meta_Gateway_Test
 */
class Post_Survey_Meta_Gateway_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * The gateway under test.
	 *
	 * @var Post_Survey_Meta_Gateway
	 */
	private $gateway;

	/**
	 * Set up each test.
	 */
	public function set_up() {
		parent::set_up();
		$this->gateway = new Post_Survey_Meta_Gateway();
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_client_id_for_survey_id
	 */
	public function test_get_client_id_for_survey_id_returns_null_when_no_meta() {
		$post_id = $this->factory->post->create();
		$this->assertNull( $this->gateway->get_client_id_for_survey_id( $post_id, 12345 ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_client_id_for_survey_id
	 */
	public function test_get_client_id_for_survey_id_returns_matching_client_id() {
		$post_id   = $this->factory->post->create();
		$client_id = wp_generate_uuid4();
		$survey_id = 12345;

		$this->gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => $survey_id ) );

		$this->assertSame( $client_id, $this->gateway->get_client_id_for_survey_id( $post_id, $survey_id ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_client_id_for_survey_id
	 */
	public function test_get_client_id_for_survey_id_returns_lexicographically_first() {
		$post_id   = $this->factory->post->create();
		$survey_id = 99999;

		$uuid_a = '00000000-0000-0000-0000-000000000001';
		$uuid_b = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

		$this->gateway->update_survey_data_for_client_id( $post_id, $uuid_b, array( 'id' => $survey_id ) );
		$this->gateway->update_survey_data_for_client_id( $post_id, $uuid_a, array( 'id' => $survey_id ) );

		$this->assertSame( $uuid_a, $this->gateway->get_client_id_for_survey_id( $post_id, $survey_id ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::ensure_meta_for_survey_id
	 */
	public function test_ensure_meta_for_survey_id_creates_new_meta() {
		$post_id   = $this->factory->post->create();
		$survey_id = 54321;

		$client_id = $this->gateway->ensure_meta_for_survey_id( $post_id, $survey_id );

		$this->assertNotEmpty( $client_id );
		$this->assertMatchesRegularExpression(
			'/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/',
			$client_id
		);

		$data = $this->gateway->get_survey_data_for_client_id( $post_id, $client_id );
		$this->assertSame( $survey_id, $data['id'] );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::ensure_meta_for_survey_id
	 */
	public function test_ensure_meta_for_survey_id_returns_existing() {
		$post_id   = $this->factory->post->create();
		$client_id = wp_generate_uuid4();
		$survey_id = 11111;

		$this->gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => $survey_id ) );

		$result = $this->gateway->ensure_meta_for_survey_id( $post_id, $survey_id );

		$this->assertSame( $client_id, $result );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_survey_id
	 */
	public function test_get_original_post_id_for_survey_id_returns_null_when_not_found() {
		$this->assertNull( $this->gateway->get_original_post_id_for_survey_id( 99999 ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_survey_id
	 */
	public function test_get_original_post_id_for_survey_id_finds_post() {
		$post_id   = $this->factory->post->create();
		$survey_id = 77777;

		update_post_meta( $post_id, '_crowdsignal_forms_survey_ids', array( $survey_id ) );

		$this->assertSame( $post_id, $this->gateway->get_original_post_id_for_survey_id( $survey_id ) );
	}

	// =========================================================================
	// get_original_post_id_for_client_id tests
	// =========================================================================

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_client_id
	 */
	public function test_get_original_post_id_for_client_id_returns_null_when_not_found() {
		$this->assertNull( $this->gateway->get_original_post_id_for_client_id( wp_generate_uuid4() ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_client_id
	 */
	public function test_get_original_post_id_for_client_id_returns_null_for_null() {
		$this->assertNull( $this->gateway->get_original_post_id_for_client_id( null ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_client_id
	 */
	public function test_get_original_post_id_for_client_id_finds_post() {
		$post_id   = $this->factory->post->create();
		$client_id = wp_generate_uuid4();

		$this->gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => 33333 ) );

		$this->assertSame( $post_id, $this->gateway->get_original_post_id_for_client_id( $client_id ) );
	}

	/**
	 * When the same client_id is on multiple posts, the first one found is returned.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_client_id
	 */
	public function test_get_original_post_id_for_client_id_returns_first() {
		$client_id = wp_generate_uuid4();
		$post_id_1 = $this->factory->post->create();
		$post_id_2 = $this->factory->post->create();

		$this->gateway->update_survey_data_for_client_id( $post_id_1, $client_id, array( 'id' => 11111 ) );
		$this->gateway->update_survey_data_for_client_id( $post_id_2, $client_id, array( 'id' => 22222 ) );

		$result = $this->gateway->get_original_post_id_for_client_id( $client_id );
		// Should return one of the post IDs (the first found by the DB query).
		$this->assertContains( $result, array( $post_id_1, $post_id_2 ) );
	}

	// =========================================================================
	// get_survey_data_for_client_id edge cases
	// =========================================================================

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_survey_data_for_client_id
	 */
	public function test_get_survey_data_null_inputs() {
		$this->assertSame( array(), $this->gateway->get_survey_data_for_client_id( null, null ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_survey_data_for_client_id
	 */
	public function test_get_survey_data_nonexistent() {
		$post_id = $this->factory->post->create();
		$this->assertSame( array(), $this->gateway->get_survey_data_for_client_id( $post_id, 'nonexistent' ) );
	}

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_survey_data_for_client_id
	 */
	public function test_get_survey_data_round_trip() {
		$post_id   = $this->factory->post->create();
		$client_id = wp_generate_uuid4();
		$data      = array( 'id' => 44444, 'title' => 'Test Survey' );

		$this->gateway->update_survey_data_for_client_id( $post_id, $client_id, $data );

		$result = $this->gateway->get_survey_data_for_client_id( $post_id, $client_id );
		$this->assertSame( 44444, $result['id'] );
		$this->assertSame( 'Test Survey', $result['title'] );
	}

	// =========================================================================
	// get_original_post_id_for_survey_id with multiple surveys
	// =========================================================================

	/**
	 * @covers \Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway::get_original_post_id_for_survey_id
	 */
	public function test_get_original_post_id_for_survey_id_with_multiple_ids() {
		$post_id    = $this->factory->post->create();
		$survey_id1 = 88881;
		$survey_id2 = 88882;

		update_post_meta( $post_id, '_crowdsignal_forms_survey_ids', array( $survey_id1, $survey_id2 ) );

		$this->assertSame( $post_id, $this->gateway->get_original_post_id_for_survey_id( $survey_id1 ) );
		$this->assertSame( $post_id, $this->gateway->get_original_post_id_for_survey_id( $survey_id2 ) );
	}
}
