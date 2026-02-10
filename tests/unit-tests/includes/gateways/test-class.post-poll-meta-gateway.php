<?php
/**
 * File containing tests for \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Crowdsignal_Forms;

/**
 * Class Post_Poll_Meta_Gateway_Test
 *
 * Tests for Post_Poll_Meta_Gateway::get_original_location_for_client_id() covering:
 * - Unmapped client_id
 * - Unsynced poll (no platform poll_id yet)
 * - Poll originated in post
 * - Poll originated in comment
 * - Fallback to post origin
 */
class Post_Poll_Meta_Gateway_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * The gateway instance.
	 *
	 * @var \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway
	 */
	private $gateway;

	/**
	 * Set up test fixtures.
	 */
	public function set_up() {
		parent::set_up();
		$this->gateway = Crowdsignal_Forms::instance()->get_post_poll_meta_gateway();
	}

	/**
	 * Set up poll meta for a post-originated poll.
	 *
	 * @param int    $post_id   The post ID.
	 * @param string $client_id The poll client ID.
	 * @param int    $poll_id   The platform poll ID.
	 */
	private function setup_post_poll_meta( $post_id, $client_id, $poll_id ) {
		// Store the poll client_id → poll_id mapping.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id,
			array(
				'id'       => $poll_id,
				'question' => 'Test question?',
			)
		);

		// Track poll_id in the post's poll list.
		update_post_meta( $post_id, '_crowdsignal_forms_poll_ids', array( $poll_id ) );
	}

	/**
	 * Set up poll meta for a comment-originated poll.
	 *
	 * @param int    $post_id    The post ID.
	 * @param string $client_id  The poll client ID.
	 * @param int    $poll_id    The platform poll ID.
	 * @param int    $comment_id The comment ID.
	 */
	private function setup_comment_poll_meta( $post_id, $client_id, $poll_id, $comment_id ) {
		// Store the poll client_id → poll_id mapping.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id,
			array(
				'id'       => $poll_id,
				'question' => 'Test question?',
			)
		);

		// Track poll_id in the comment's poll list.
		update_post_meta( $post_id, '_crowdsignal_forms_comment_poll_ids_' . $comment_id, array( $poll_id ) );
	}

	/**
	 * Set up poll meta for an unsynced poll (no platform poll_id yet).
	 *
	 * @param int    $post_id   The post ID.
	 * @param string $client_id The poll client ID.
	 */
	private function setup_unsynced_poll_meta( $post_id, $client_id ) {
		// Store the poll client_id mapping without poll_id.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id,
			array(
				'question' => 'Test question?',
				// No 'id' key - poll hasn't been synced yet.
			)
		);
	}

	// =========================================================================
	// Test Cases
	// =========================================================================

	/**
	 * Test that unmapped client_id returns null for both post and comment.
	 */
	public function test_unmapped_client_id() {
		$result = $this->gateway->get_original_location_for_client_id( 'nonexistent-client-id' );

		$this->assertIsArray( $result );
		$this->assertNull( $result['post_id'] );
		$this->assertNull( $result['comment_id'] );
	}

	/**
	 * Test that unsynced poll (no platform poll_id) returns post_id but null comment_id.
	 */
	public function test_unsynced_poll() {
		$client_id = 'unsynced-poll-' . uniqid();
		$post_id   = wp_insert_post(
			array(
				'post_title'   => 'Test Post',
				'post_content' => 'Some content',
				'post_status'  => 'publish',
			)
		);

		$this->setup_unsynced_poll_meta( $post_id, $client_id );

		$result = $this->gateway->get_original_location_for_client_id( $client_id );

		$this->assertIsArray( $result );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertNull( $result['comment_id'] );

		wp_delete_post( $post_id, true );
	}

	/**
	 * Test that poll originated in post returns correct location.
	 */
	public function test_poll_originated_in_post() {
		$client_id = 'post-poll-' . uniqid();
		$poll_id   = 12345;
		$post_id   = wp_insert_post(
			array(
				'post_title'   => 'Test Post',
				'post_content' => 'Some content',
				'post_status'  => 'publish',
			)
		);

		$this->setup_post_poll_meta( $post_id, $client_id, $poll_id );

		$result = $this->gateway->get_original_location_for_client_id( $client_id );

		$this->assertIsArray( $result );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertNull( $result['comment_id'] );

		wp_delete_post( $post_id, true );
	}

	/**
	 * Test that poll originated in comment returns correct location.
	 */
	public function test_poll_originated_in_comment() {
		$client_id  = 'comment-poll-' . uniqid();
		$poll_id    = 12346;
		$post_id    = wp_insert_post(
			array(
				'post_title'   => 'Test Post',
				'post_content' => 'Some content',
				'post_status'  => 'publish',
			)
		);
		$comment_id = wp_insert_comment(
			array(
				'comment_post_ID' => $post_id,
				'comment_content' => 'Test comment',
				'comment_approved' => 1,
			)
		);

		$this->setup_comment_poll_meta( $post_id, $client_id, $poll_id, $comment_id );

		$result = $this->gateway->get_original_location_for_client_id( $client_id );

		$this->assertIsArray( $result );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertSame( $comment_id, $result['comment_id'] );

		wp_delete_comment( $comment_id, true );
		wp_delete_post( $post_id, true );
	}

	/**
	 * Test that poll_id not found in either array falls back to post origin.
	 */
	public function test_fallback_to_post_origin() {
		$client_id = 'orphan-poll-' . uniqid();
		$poll_id   = 12347;
		$post_id   = wp_insert_post(
			array(
				'post_title'   => 'Test Post',
				'post_content' => 'Some content',
				'post_status'  => 'publish',
			)
		);

		// Store the poll mapping but DON'T add to any tracking array.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id,
			array(
				'id'       => $poll_id,
				'question' => 'Test question?',
			)
		);
		// Note: Intentionally not setting _crowdsignal_forms_poll_ids or comment poll ids.

		$result = $this->gateway->get_original_location_for_client_id( $client_id );

		$this->assertIsArray( $result );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertNull( $result['comment_id'] );

		wp_delete_post( $post_id, true );
	}

	/**
	 * Test with multiple polls on same post - correct one is found.
	 */
	public function test_multiple_polls_on_post() {
		$client_id_1 = 'poll-1-' . uniqid();
		$client_id_2 = 'poll-2-' . uniqid();
		$poll_id_1   = 12348;
		$poll_id_2   = 12349;
		$post_id     = wp_insert_post(
			array(
				'post_title'   => 'Test Post',
				'post_content' => 'Some content',
				'post_status'  => 'publish',
			)
		);

		// Set up poll 1 in post.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id_1,
			array( 'id' => $poll_id_1 )
		);

		// Set up poll 2 in post.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id_2,
			array( 'id' => $poll_id_2 )
		);

		// Track both in post.
		update_post_meta( $post_id, '_crowdsignal_forms_poll_ids', array( $poll_id_1, $poll_id_2 ) );

		// Both should be found as post-originated.
		$result_1 = $this->gateway->get_original_location_for_client_id( $client_id_1 );
		$result_2 = $this->gateway->get_original_location_for_client_id( $client_id_2 );

		$this->assertSame( $post_id, $result_1['post_id'] );
		$this->assertNull( $result_1['comment_id'] );

		$this->assertSame( $post_id, $result_2['post_id'] );
		$this->assertNull( $result_2['comment_id'] );

		wp_delete_post( $post_id, true );
	}

	/**
	 * Test with multiple comments with polls - correct comment is found.
	 */
	public function test_multiple_comments_with_polls() {
		$client_id_1 = 'comment-poll-1-' . uniqid();
		$client_id_2 = 'comment-poll-2-' . uniqid();
		$poll_id_1   = 12350;
		$poll_id_2   = 12351;
		$post_id     = wp_insert_post(
			array(
				'post_title'   => 'Test Post',
				'post_content' => 'Some content',
				'post_status'  => 'publish',
			)
		);
		$comment_id_1 = wp_insert_comment(
			array(
				'comment_post_ID' => $post_id,
				'comment_content' => 'Comment 1',
				'comment_approved' => 1,
			)
		);
		$comment_id_2 = wp_insert_comment(
			array(
				'comment_post_ID' => $post_id,
				'comment_content' => 'Comment 2',
				'comment_approved' => 1,
			)
		);

		// Set up poll 1 in comment 1.
		$this->setup_comment_poll_meta( $post_id, $client_id_1, $poll_id_1, $comment_id_1 );

		// Set up poll 2 in comment 2.
		update_post_meta(
			$post_id,
			'_cs_poll_' . $client_id_2,
			array( 'id' => $poll_id_2 )
		);
		update_post_meta( $post_id, '_crowdsignal_forms_comment_poll_ids_' . $comment_id_2, array( $poll_id_2 ) );

		// Each should be found in its correct comment.
		$result_1 = $this->gateway->get_original_location_for_client_id( $client_id_1 );
		$result_2 = $this->gateway->get_original_location_for_client_id( $client_id_2 );

		$this->assertSame( $post_id, $result_1['post_id'] );
		$this->assertSame( $comment_id_1, $result_1['comment_id'] );

		$this->assertSame( $post_id, $result_2['post_id'] );
		$this->assertSame( $comment_id_2, $result_2['comment_id'] );

		wp_delete_comment( $comment_id_1, true );
		wp_delete_comment( $comment_id_2, true );
		wp_delete_post( $post_id, true );
	}

	// =========================================================================
	// get_poll_data_for_poll_client_id tests
	// =========================================================================

	/**
	 * Returns empty array for null client_id.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway::get_poll_data_for_poll_client_id
	 */
	public function test_get_poll_data_null_client_id() {
		$post_id = $this->factory->post->create();
		$result  = $this->gateway->get_poll_data_for_poll_client_id( $post_id, null );
		$this->assertSame( array(), $result );
	}

	/**
	 * Returns poll data for a specific post and client_id.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway::get_poll_data_for_poll_client_id
	 */
	public function test_get_poll_data_for_specific_post() {
		$client_id = 'test-poll-' . uniqid();
		$post_id   = $this->factory->post->create();
		$poll_data = array( 'id' => 999, 'question' => 'Hello?' );

		$this->gateway->update_poll_data_for_client_id( $post_id, $client_id, $poll_data );

		$result = $this->gateway->get_poll_data_for_poll_client_id( $post_id, $client_id );
		$this->assertSame( 999, $result['id'] );
		$this->assertSame( 'Hello?', $result['question'] );
	}

	/**
	 * Returns empty array when client_id doesn't exist on the post.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway::get_poll_data_for_poll_client_id
	 */
	public function test_get_poll_data_nonexistent_client_id() {
		$post_id = $this->factory->post->create();
		$result  = $this->gateway->get_poll_data_for_poll_client_id( $post_id, 'nonexistent' );
		$this->assertSame( array(), $result );
	}

	/**
	 * Cross-post search (null post_id) finds poll data across all posts.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway::get_poll_data_for_poll_client_id
	 */
	public function test_get_poll_data_cross_post_search() {
		$client_id = 'cross-post-' . uniqid();
		$post_id   = $this->factory->post->create();
		$poll_data = array( 'id' => 777, 'question' => 'Cross?' );

		$this->gateway->update_poll_data_for_client_id( $post_id, $client_id, $poll_data );

		// Search across all posts (null post_id).
		$result = $this->gateway->get_poll_data_for_poll_client_id( null, $client_id );
		$this->assertSame( 777, $result['id'] );
	}

	/**
	 * Cross-post search returns empty array for nonexistent client_id.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway::get_poll_data_for_poll_client_id
	 */
	public function test_get_poll_data_cross_post_search_not_found() {
		$result = $this->gateway->get_poll_data_for_poll_client_id( null, 'does-not-exist' );
		$this->assertSame( array(), $result );
	}

	// =========================================================================
	// update_poll_data_for_client_id tests
	// =========================================================================

	/**
	 * update_poll_data_for_client_id stores and retrieves data correctly.
	 *
	 * @covers \Crowdsignal_Forms\Gateways\Post_Poll_Meta_Gateway::update_poll_data_for_client_id
	 */
	public function test_update_poll_data_round_trip() {
		$client_id = 'round-trip-' . uniqid();
		$post_id   = $this->factory->post->create();

		$this->gateway->update_poll_data_for_client_id( $post_id, $client_id, array( 'id' => 111 ) );
		$result = $this->gateway->get_poll_data_for_poll_client_id( $post_id, $client_id );
		$this->assertSame( 111, $result['id'] );

		// Update with new data.
		$this->gateway->update_poll_data_for_client_id( $post_id, $client_id, array( 'id' => 222, 'question' => 'Updated?' ) );
		$result = $this->gateway->get_poll_data_for_poll_client_id( $post_id, $client_id );
		$this->assertSame( 222, $result['id'] );
		$this->assertSame( 'Updated?', $result['question'] );
	}
}
