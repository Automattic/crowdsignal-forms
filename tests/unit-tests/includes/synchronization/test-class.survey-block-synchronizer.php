<?php
/**
 * Tests for \Crowdsignal_Forms\Synchronization\Survey_Block_Synchronizer.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Gateways\Api_Gateway;
use Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway;
use Crowdsignal_Forms\Models\Nps_Survey;
use Crowdsignal_Forms\Models\Feedback_Survey;
use Crowdsignal_Forms\Synchronization\Survey_Block_Synchronizer;
use Crowdsignal_Forms\Synchronization\Post_Sync_Entity;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

/**
 * Class Survey_Block_Synchronizer_Test
 * @covers \Crowdsignal_Forms\Synchronization\Survey_Block_Synchronizer
 */
class Survey_Block_Synchronizer_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * The meta gateway.
	 *
	 * @var Post_Survey_Meta_Gateway
	 */
	private $meta_gateway;

	/**
	 * Set up each test.
	 */
	public function set_up() {
		parent::set_up();
		$this->meta_gateway = new Post_Survey_Meta_Gateway();
		Crowdsignal_Forms::instance()->set_post_survey_meta_gateway( $this->meta_gateway );

		$this->login_as_admin();
	}

	/**
	 * Helper to create a post with the factory while temporarily disabling
	 * the wp_insert_post_data guard and save_post hooks so legacy content
	 * is preserved and sync doesn't fire during setup.
	 *
	 * @param string $content The post content.
	 * @return int The post ID.
	 */
	private function create_post_bypassing_hooks( $content ) {
		global $wp_filter;

		$saved_insert = isset( $wp_filter['wp_insert_post_data'] ) ? $wp_filter['wp_insert_post_data'] : null;
		$saved_save   = isset( $wp_filter['save_post'] ) ? $wp_filter['save_post'] : null;

		remove_all_filters( 'wp_insert_post_data' );
		remove_all_actions( 'save_post' );

		$post_id = $this->factory->post->create( array( 'post_content' => $content ) );

		if ( null !== $saved_insert ) {
			$wp_filter['wp_insert_post_data'] = $saved_insert;
		}
		if ( null !== $saved_save ) {
			$wp_filter['save_post'] = $saved_save;
		}

		return $post_id;
	}

	/**
	 * Helper to set up a mock authenticator.
	 */
	private function mock_authenticator() {
		$authenticator = $this->createMock( Crowdsignal_Forms_Api_Authenticator::class );
		$authenticator->method( 'has_user_code' )->willReturn( true );
		$authenticator->method( 'get_user_code' )->willReturn( 'test-user-code' );
		Crowdsignal_Forms::instance()->set_api_authenticator( $authenticator );
	}

	/**
	 * Legacy NPS block with surveyId and matching meta should sync using existing platform ID.
	 *
	 */
	public function test_legacy_block_with_meta_syncs() {
		$survey_id = 12345;
		$client_id = wp_generate_uuid4();

		$attrs   = wp_json_encode( array(
			'surveyId'         => $survey_id,
			'ratingQuestion'   => 'How likely?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		// Set up meta so the synchronizer can find the client_id.
		$this->meta_gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => $survey_id ) );
		update_post_meta( $post_id, '_crowdsignal_forms_survey_ids', array( $survey_id ) );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( $survey_id, 'Test', 'How likely?', 'Why?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturn( $survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	/**
	 * Legacy block with no meta and no tracking should be skipped.
	 *
	 */
	public function test_legacy_block_without_meta_is_skipped() {
		$attrs   = wp_json_encode( array(
			'surveyId'         => 99999,
			'ratingQuestion'   => 'How likely?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		$this->mock_authenticator();

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->never() )->method( 'update_nps' );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$synchronizer->synchronize();
	}

	/**
	 * Block with no surveyId and no surveyClientId should be skipped.
	 *
	 */
	public function test_block_with_no_id_is_skipped() {
		$attrs   = wp_json_encode( array(
			'ratingQuestion'   => 'How likely?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		$this->mock_authenticator();

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->never() )->method( 'update_nps' );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$synchronizer->synchronize();
	}

	/**
	 * Modern block with surveyClientId still works.
	 *
	 */
	public function test_modern_block_with_client_id_syncs() {
		$client_id = wp_generate_uuid4();

		$attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'How likely?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( 0, 'Test', 'How likely?', 'Why?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturn( $survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	// =========================================================================
	// Early bailout tests
	// =========================================================================

	/**
	 * Synchronize returns early for trashed posts.
	 *
	 */
	public function test_synchronize_bails_for_trashed_post() {
		$client_id = wp_generate_uuid4();
		$attrs     = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Test?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';
		$post_id = $this->create_post_bypassing_hooks( $content );

		wp_update_post( array( 'ID' => $post_id, 'post_status' => 'trash' ) );

		$this->mock_authenticator();

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );

		$this->assertNull( $synchronizer->synchronize() );
	}

	/**
	 * Synchronize returns early when no user code and no survey blocks.
	 *
	 */
	public function test_synchronize_bails_no_user_code_no_blocks() {
		$post_id = $this->create_post_bypassing_hooks( '<p>No blocks</p>' );

		$authenticator = $this->createMock( Crowdsignal_Forms_Api_Authenticator::class );
		$authenticator->method( 'has_user_code' )->willReturn( false );
		Crowdsignal_Forms::instance()->set_api_authenticator( $authenticator );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );

		$this->assertNull( $synchronizer->synchronize() );
	}

	/**
	 * Synchronize returns early when authenticator cannot get user code.
	 *
	 */
	public function test_synchronize_bails_no_auth() {
		$client_id = wp_generate_uuid4();
		$attrs     = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Test?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';
		$post_id = $this->create_post_bypassing_hooks( $content );

		$authenticator = $this->createMock( Crowdsignal_Forms_Api_Authenticator::class );
		$authenticator->method( 'has_user_code' )->willReturn( true );
		$authenticator->method( 'get_user_code' )->willReturn( null );
		Crowdsignal_Forms::instance()->set_api_authenticator( $authenticator );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );

		$this->assertNull( $synchronizer->synchronize() );
	}

	/**
	 * When survey blocks are removed, survey IDs tracking should be cleared.
	 *
	 */
	public function test_clears_survey_ids_when_blocks_removed() {
		$post_id = $this->create_post_bypassing_hooks( '<p>No survey blocks</p>' );
		update_post_meta( $post_id, '_crowdsignal_forms_survey_ids', array( 111, 222 ) );

		$this->mock_authenticator();

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$synchronizer->synchronize();

		$this->assertSame( array(), get_post_meta( $post_id, '_crowdsignal_forms_survey_ids', true ) );
	}

	// =========================================================================
	// Feedback block tests
	// =========================================================================

	/**
	 * Modern feedback block with surveyClientId should sync.
	 *
	 */
	public function test_modern_feedback_block_syncs() {
		$client_id = wp_generate_uuid4();

		$attrs   = wp_json_encode( array(
			'surveyClientId'      => $client_id,
			'header'              => 'Feedback header',
			'feedbackPlaceholder' => 'Your feedback',
			'emailPlaceholder'    => 'Your email',
			'emailResponses'      => true,
		) );
		$content = '<!-- wp:crowdsignal-forms/feedback ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		$this->mock_authenticator();

		$survey  = new Feedback_Survey( 0, 'Feedback header', 'Your feedback', 'Your email', 'http://example.com', true );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_feedback' )
			->willReturn( $survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	/**
	 * Feedback block with existing platform ID should use it from meta.
	 *
	 */
	public function test_feedback_block_uses_platform_id_from_meta() {
		$client_id  = wp_generate_uuid4();
		$survey_id  = 55555;

		$attrs   = wp_json_encode( array(
			'surveyClientId'      => $client_id,
			'header'              => 'Feedback',
			'feedbackPlaceholder' => 'Your feedback',
			'emailPlaceholder'    => 'Email',
			'emailResponses'      => false,
		) );
		$content = '<!-- wp:crowdsignal-forms/feedback ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		// Pre-populate meta with existing platform ID.
		$this->meta_gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => $survey_id ) );

		$this->mock_authenticator();

		$survey  = new Feedback_Survey( $survey_id, 'Feedback', 'Your feedback', 'Email', 'http://example.com', false );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_feedback' )
			->willReturnCallback( function ( $s ) use ( $survey_id ) {
				// Verify the platform ID from meta is used, not from block attributes.
				$arr = $s->to_array();
				$this->assertSame( $survey_id, $arr['id'] );
				return $s;
			} );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	// =========================================================================
	// Nested block tests
	// =========================================================================

	/**
	 * Survey blocks nested inside group blocks should be found and synced.
	 *
	 */
	public function test_nested_survey_block_is_synced() {
		$client_id = wp_generate_uuid4();
		$attrs     = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Nested NPS?',
			'feedbackQuestion' => 'Why nested?',
		) );
		$inner   = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';
		$content = '<!-- wp:group --><div class="wp-block-group">' . $inner . '</div><!-- /wp:group -->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( 0, 'Nested', 'Nested NPS?', 'Why nested?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturn( $survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	/**
	 * Cross-post copy of survey should be blocked for author who can't edit original.
	 *
	 */
	public function test_cross_post_survey_blocked_for_author() {
		$client_id = wp_generate_uuid4();

		// Create original post with survey meta (as admin).
		$original_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Original?',
			'feedbackQuestion' => 'Why?',
		) );
		$original_content = '<!-- wp:crowdsignal-forms/nps ' . $original_attrs . ' /-->';
		$original_post_id = $this->create_post_bypassing_hooks( $original_content );

		// Set up meta on the original post.
		$this->meta_gateway->update_survey_data_for_client_id( $original_post_id, $client_id, array( 'id' => 44444 ) );

		// Switch to author.
		$author_id = $this->get_user_by_role( 'author' );
		$this->login_as( $author_id );

		$copied_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Copied!',
			'feedbackQuestion' => 'Why copied?',
		) );
		$copied_content = '<!-- wp:crowdsignal-forms/nps ' . $copied_attrs . ' /-->';
		$new_post_id    = $this->create_post_bypassing_hooks( $copied_content );
		wp_update_post( array( 'ID' => $new_post_id, 'post_author' => $author_id ) );

		$this->mock_authenticator();

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps', 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->never() )->method( 'update_nps' );
		$gateway->expects( $this->never() )->method( 'update_feedback' );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $new_post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $new_post_id, $post ) );
		$synchronizer->synchronize();

		// No survey IDs should be tracked.
		$survey_ids = get_post_meta( $new_post_id, '_crowdsignal_forms_survey_ids', true );
		$this->assertEmpty( $survey_ids );
	}

	/**
	 * Cross-post copy of survey should be allowed for admin who can edit original.
	 *
	 */
	public function test_cross_post_survey_allowed_for_admin() {
		$client_id = wp_generate_uuid4();

		// Create original post with survey meta.
		$original_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Original?',
			'feedbackQuestion' => 'Why?',
		) );
		$original_content = '<!-- wp:crowdsignal-forms/nps ' . $original_attrs . ' /-->';
		$original_post_id = $this->create_post_bypassing_hooks( $original_content );

		$this->meta_gateway->update_survey_data_for_client_id( $original_post_id, $client_id, array( 'id' => 55555 ) );

		// Admin creates a new post with copied survey (same client_id).
		$copied_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Copied by admin!',
			'feedbackQuestion' => 'Admin why?',
		) );
		$copied_content = '<!-- wp:crowdsignal-forms/nps ' . $copied_attrs . ' /-->';
		$new_post_id    = $this->create_post_bypassing_hooks( $copied_content );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( 0, 'Copied', 'Copied by admin!', 'Admin why?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturn( $survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $new_post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $new_post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	/**
	 * An editor who can edit the original post should be allowed to sync a
	 * cross-post copy of a survey.
	 */
	public function test_cross_post_survey_allowed_for_editor() {
		$client_id = wp_generate_uuid4();

		// Create original post with survey meta (as admin).
		$original_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Original?',
			'feedbackQuestion' => 'Why?',
		) );
		$original_content = '<!-- wp:crowdsignal-forms/nps ' . $original_attrs . ' /-->';
		$original_post_id = $this->create_post_bypassing_hooks( $original_content );

		$this->meta_gateway->update_survey_data_for_client_id( $original_post_id, $client_id, array( 'id' => 60001 ) );

		// Switch to editor — editors can edit others' published posts.
		$this->login_as_editor();

		$copied_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Copied by editor!',
			'feedbackQuestion' => 'Editor why?',
		) );
		$copied_content = '<!-- wp:crowdsignal-forms/nps ' . $copied_attrs . ' /-->';
		$new_post_id    = $this->create_post_bypassing_hooks( $copied_content );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( 0, 'Copied', 'Copied by editor!', 'Editor why?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturn( $survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $new_post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $new_post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	/**
	 * A contributor saving a draft with a copied survey block should be blocked.
	 */
	public function test_cross_post_survey_blocked_for_contributor_draft() {
		$client_id = wp_generate_uuid4();

		// Create original post with survey meta (as admin).
		$original_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Original?',
			'feedbackQuestion' => 'Why?',
		) );
		$original_content = '<!-- wp:crowdsignal-forms/nps ' . $original_attrs . ' /-->';
		$original_post_id = $this->create_post_bypassing_hooks( $original_content );

		$this->meta_gateway->update_survey_data_for_client_id( $original_post_id, $client_id, array( 'id' => 60002 ) );

		// Switch to contributor.
		$contributor_id = $this->get_user_by_role( 'contributor' );
		$this->login_as( $contributor_id );

		$copied_attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Copied into draft!',
			'feedbackQuestion' => 'Draft why?',
		) );
		$copied_content = '<!-- wp:crowdsignal-forms/nps ' . $copied_attrs . ' /-->';
		$new_post_id    = $this->create_post_bypassing_hooks( $copied_content );
		wp_update_post( array(
			'ID'          => $new_post_id,
			'post_author' => $contributor_id,
			'post_status' => 'draft',
		) );

		$this->mock_authenticator();

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps', 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->never() )->method( 'update_nps' );
		$gateway->expects( $this->never() )->method( 'update_feedback' );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $new_post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $new_post_id, $post ) );
		$synchronizer->synchronize();

		$survey_ids = get_post_meta( $new_post_id, '_crowdsignal_forms_survey_ids', true );
		$this->assertEmpty( $survey_ids );
	}

	/**
	 * Cross-post copy of a feedback block should be blocked for an author,
	 * same as NPS blocks.
	 */
	public function test_cross_post_feedback_blocked_for_author() {
		$client_id = wp_generate_uuid4();

		// Create original post with feedback survey meta (as admin).
		$original_attrs   = wp_json_encode( array(
			'surveyClientId'      => $client_id,
			'header'              => 'Original feedback',
			'feedbackPlaceholder' => 'Your feedback',
			'emailPlaceholder'    => 'Email',
			'emailResponses'      => true,
		) );
		$original_content = '<!-- wp:crowdsignal-forms/feedback ' . $original_attrs . ' /-->';
		$original_post_id = $this->create_post_bypassing_hooks( $original_content );

		$this->meta_gateway->update_survey_data_for_client_id( $original_post_id, $client_id, array( 'id' => 60003 ) );

		// Switch to author.
		$author_id = $this->get_user_by_role( 'author' );
		$this->login_as( $author_id );

		$copied_attrs   = wp_json_encode( array(
			'surveyClientId'      => $client_id,
			'header'              => 'Stolen feedback',
			'feedbackPlaceholder' => 'Your feedback',
			'emailPlaceholder'    => 'Email',
			'emailResponses'      => true,
		) );
		$copied_content = '<!-- wp:crowdsignal-forms/feedback ' . $copied_attrs . ' /-->';
		$new_post_id    = $this->create_post_bypassing_hooks( $copied_content );
		wp_update_post( array( 'ID' => $new_post_id, 'post_author' => $author_id ) );

		$this->mock_authenticator();

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps', 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->never() )->method( 'update_feedback' );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $new_post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $new_post_id, $post ) );
		$synchronizer->synchronize();

		$survey_ids = get_post_meta( $new_post_id, '_crowdsignal_forms_survey_ids', true );
		$this->assertEmpty( $survey_ids );
	}

	/**
	 * Legacy block with surveyId belonging to another post should be blocked
	 * for an author who cannot edit the original post.
	 *
	 */
	public function test_legacy_cross_post_blocked_for_author() {
		$survey_id = 77777;
		$client_id = wp_generate_uuid4();

		// Create original post and set up meta (as admin).
		$original_content = '<!-- wp:crowdsignal-forms/nps ' . wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'ratingQuestion'   => 'Original?',
			'feedbackQuestion' => 'Why?',
		) ) . ' /-->';
		$original_post_id = $this->create_post_bypassing_hooks( $original_content );
		$this->meta_gateway->update_survey_data_for_client_id( $original_post_id, $client_id, array( 'id' => $survey_id ) );
		update_post_meta( $original_post_id, '_crowdsignal_forms_survey_ids', array( $survey_id ) );

		// Switch to author.
		$author_id = $this->get_user_by_role( 'author' );
		$this->login_as( $author_id );

		// Author creates a post with a legacy block referencing the survey_id.
		$legacy_content = '<!-- wp:crowdsignal-forms/nps ' . wp_json_encode( array(
			'surveyId'         => $survey_id,
			'ratingQuestion'   => 'Stolen!',
			'feedbackQuestion' => 'Hacked!',
		) ) . ' /-->';
		$new_post_id = $this->create_post_bypassing_hooks( $legacy_content );
		wp_update_post( array( 'ID' => $new_post_id, 'post_author' => $author_id ) );

		$this->mock_authenticator();

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps', 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->never() )->method( 'update_nps' );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $new_post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $new_post_id, $post ) );
		$synchronizer->synchronize();
	}

	/**
	 * A legacy block with surveyId on the SAME post should resolve the
	 * client_id from the current post's meta without any cross-post
	 * permission check, and sync normally.
	 */
	public function test_legacy_same_post_resolves_client_id() {
		$survey_id = 70001;
		$client_id = wp_generate_uuid4();

		// Create a post with a legacy block (surveyId, no surveyClientId).
		$legacy_content = '<!-- wp:crowdsignal-forms/nps ' . wp_json_encode( array(
			'surveyId'         => $survey_id,
			'ratingQuestion'   => 'Legacy same post?',
			'feedbackQuestion' => 'Why?',
		) ) . ' /-->';
		$post_id = $this->create_post_bypassing_hooks( $legacy_content );

		// Meta on this same post maps client_id → survey_id.
		$this->meta_gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => $survey_id ) );
		update_post_meta( $post_id, '_crowdsignal_forms_survey_ids', array( $survey_id ) );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( $survey_id, 'Legacy', 'Legacy same post?', 'Why?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturnCallback( function ( $s ) use ( $survey_id ) {
				$arr = $s->to_array();
				// Platform ID should come from meta, matching the survey_id.
				$this->assertSame( $survey_id, $arr['id'] );
				return $s;
			} );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	/**
	 * Even if a block has a surveyId attribute, the platform ID should come from
	 * meta only, not from the block attributes.
	 *
	 */
	public function test_survey_id_from_attributes_not_trusted() {
		$client_id  = wp_generate_uuid4();
		$real_id    = 88888;
		$spoofed_id = 99999;

		$attrs   = wp_json_encode( array(
			'surveyClientId'   => $client_id,
			'surveyId'         => $spoofed_id,
			'ratingQuestion'   => 'Spoofed?',
			'feedbackQuestion' => 'Why?',
		) );
		$content = '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';

		$post_id = $this->create_post_bypassing_hooks( $content );

		// Meta has the real platform ID.
		$this->meta_gateway->update_survey_data_for_client_id( $post_id, $client_id, array( 'id' => $real_id ) );

		$this->mock_authenticator();

		$survey  = new Nps_Survey( $real_id, 'Test', 'Spoofed?', 'Why?', 'http://example.com' );
		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturnCallback( function ( $s ) use ( $real_id, $spoofed_id ) {
				$arr = $s->to_array();
				// The real ID from meta should be used, not the spoofed one.
				$this->assertSame( $real_id, $arr['id'] );
				$this->assertNotSame( $spoofed_id, $arr['id'] );
				return $s;
			} );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );
	}

	// =========================================================================
	// Multiple surveys test
	// =========================================================================

	/**
	 * Multiple survey blocks (NPS + Feedback) in a single post should all sync.
	 *
	 */
	public function test_multiple_survey_blocks_synced() {
		$nps_client_id      = wp_generate_uuid4();
		$feedback_client_id = wp_generate_uuid4();

		$nps_block = '<!-- wp:crowdsignal-forms/nps ' . wp_json_encode( array(
			'surveyClientId'   => $nps_client_id,
			'ratingQuestion'   => 'NPS?',
			'feedbackQuestion' => 'Why?',
		) ) . ' /-->';

		$feedback_block = '<!-- wp:crowdsignal-forms/feedback ' . wp_json_encode( array(
			'surveyClientId'      => $feedback_client_id,
			'header'              => 'Feedback',
			'feedbackPlaceholder' => 'Tell us',
			'emailPlaceholder'    => 'Email',
			'emailResponses'      => true,
		) ) . ' /-->';

		$content = $nps_block . "\n" . $feedback_block;
		$post_id = $this->create_post_bypassing_hooks( $content );

		$this->mock_authenticator();

		$nps_survey      = new Nps_Survey( 1001, 'NPS', 'NPS?', 'Why?', 'http://example.com' );
		$feedback_survey = new Feedback_Survey( 1002, 'Feedback', 'Tell us', 'Email', 'http://example.com', true );

		$gateway = $this->getMockBuilder( Api_Gateway::class )
			->disableOriginalConstructor()
			->onlyMethods( array( 'update_nps', 'update_feedback' ) )
			->getMock();
		$gateway->expects( $this->once() )
			->method( 'update_nps' )
			->willReturn( $nps_survey );
		$gateway->expects( $this->once() )
			->method( 'update_feedback' )
			->willReturn( $feedback_survey );
		Crowdsignal_Forms::instance()->set_api_gateway( $gateway );

		$post         = get_post( $post_id );
		$synchronizer = new Survey_Block_Synchronizer( new Post_Sync_Entity( $post_id, $post ) );
		$result       = $synchronizer->synchronize();

		$this->assertTrue( $result );

		$survey_ids = get_post_meta( $post_id, '_crowdsignal_forms_survey_ids', true );
		$this->assertCount( 2, $survey_ids );
		$this->assertContains( 1001, $survey_ids );
		$this->assertContains( 1002, $survey_ids );
	}
}
