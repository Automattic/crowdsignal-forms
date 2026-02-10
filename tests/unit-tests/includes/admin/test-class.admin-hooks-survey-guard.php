<?php
/**
 * Tests for the survey ID guard and on-edit meta generation in Admin_Hooks.
 *
 * @package crowdsignal-forms\Tests
 */

use Crowdsignal_Forms\Admin\Admin_Hooks;
use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Gateways\Post_Survey_Meta_Gateway;

/**
 * Class Admin_Hooks_Survey_Guard_Test
 */
class Admin_Hooks_Survey_Guard_Test extends Crowdsignal_Forms_Unit_Test_Case {

	/**
	 * The admin hooks instance.
	 *
	 * @var Admin_Hooks
	 */
	private $admin_hooks;

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
		$this->admin_hooks  = new Admin_Hooks();
		$this->meta_gateway = new Post_Survey_Meta_Gateway();
		Crowdsignal_Forms::instance()->set_post_survey_meta_gateway( $this->meta_gateway );
	}

	/**
	 * Helper to create a post with the factory while temporarily disabling
	 * the wp_insert_post_data guard so legacy content is preserved as-is.
	 *
	 * @param string $content The post content.
	 * @return int The post ID.
	 */
	private function create_post_bypassing_guard( $content ) {
		global $wp_filter;

		$saved = isset( $wp_filter['wp_insert_post_data'] ) ? $wp_filter['wp_insert_post_data'] : null;
		remove_all_filters( 'wp_insert_post_data' );

		$post_id = $this->factory->post->create( array( 'post_content' => $content ) );

		if ( null !== $saved ) {
			$wp_filter['wp_insert_post_data'] = $saved;
		}

		return $post_id;
	}

	/**
	 * Helper to create block content with a legacy NPS block (has surveyId, no surveyClientId).
	 *
	 * @param int $survey_id The survey ID.
	 * @return string
	 */
	private function make_legacy_nps_block( $survey_id ) {
		$attrs = wp_json_encode( array( 'surveyId' => $survey_id, 'ratingQuestion' => 'How likely?' ) );
		return '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';
	}

	/**
	 * Helper to create block content with a modern NPS block (has surveyClientId).
	 *
	 * @param string $client_id The client UUID.
	 * @return string
	 */
	private function make_modern_nps_block( $client_id ) {
		$attrs = wp_json_encode( array( 'surveyClientId' => $client_id, 'ratingQuestion' => 'How likely?' ) );
		return '<!-- wp:crowdsignal-forms/nps ' . $attrs . ' /-->';
	}

	/**
	 * Helper to create block content with a legacy feedback block.
	 *
	 * @param int $survey_id The survey ID.
	 * @return string
	 */
	private function make_legacy_feedback_block( $survey_id ) {
		$attrs = wp_json_encode( array( 'surveyId' => $survey_id, 'header' => 'Feedback' ) );
		return '<!-- wp:crowdsignal-forms/feedback ' . $attrs . ' /-->';
	}

	/**
	 * Pre-existing surveyId in old content should be preserved.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_preserves_preexisting_survey_id() {
		$survey_id = 12345;
		$content   = $this->make_legacy_nps_block( $survey_id );

		// Create a post with the legacy content (bypassing hooks to avoid guard running).
		$post_id = $this->create_post_bypassing_guard( $content );

		// Simulate saving the same content again via the filter.
		$data    = array( 'post_content' => wp_slash( $content ) );
		$postarr = array( 'ID' => $post_id );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		// The content should be unchanged — surveyId preserved.
		$this->assertStringContainsString( '"surveyId":12345', wp_unslash( $result['post_content'] ) );
		$this->assertStringNotContainsString( 'surveyClientId', wp_unslash( $result['post_content'] ) );
	}

	/**
	 * surveyId with matching meta should be preserved.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_preserves_survey_id_with_matching_meta() {
		$survey_id = 67890;

		// Create a post without the legacy content initially.
		$post_id = $this->factory->post->create( array( 'post_content' => '' ) );

		// Add meta mapping.
		$this->meta_gateway->ensure_meta_for_survey_id( $post_id, $survey_id );

		// Now save content with the surveyId.
		$content = $this->make_legacy_nps_block( $survey_id );
		$data    = array( 'post_content' => wp_slash( $content ) );
		$postarr = array( 'ID' => $post_id );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		$this->assertStringContainsString( '"surveyId":67890', wp_unslash( $result['post_content'] ) );
	}

	/**
	 * New/unknown surveyId should be stripped and replaced with surveyClientId.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_strips_unknown_survey_id() {
		$survey_id = 99999;

		// Create a post with no prior content.
		$post_id = $this->factory->post->create( array( 'post_content' => '' ) );

		$content = $this->make_legacy_nps_block( $survey_id );
		$data    = array( 'post_content' => wp_slash( $content ) );
		$postarr = array( 'ID' => $post_id );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		$unslashed = wp_unslash( $result['post_content'] );
		$this->assertStringNotContainsString( '"surveyId"', $unslashed );
		$this->assertStringContainsString( 'surveyClientId', $unslashed );
	}

	/**
	 * New post: bare surveyId should be stripped.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_strips_survey_id_on_new_post() {
		$content = $this->make_legacy_nps_block( 44444 );
		$data    = array( 'post_content' => wp_slash( $content ) );
		$postarr = array( 'ID' => 0 );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		$unslashed = wp_unslash( $result['post_content'] );
		$this->assertStringNotContainsString( '"surveyId"', $unslashed );
		$this->assertStringContainsString( 'surveyClientId', $unslashed );
	}

	/**
	 * Blocks with surveyClientId should be untouched by the guard.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_ignores_blocks_with_survey_client_id() {
		$client_id = wp_generate_uuid4();
		$content   = $this->make_modern_nps_block( $client_id );
		$data      = array( 'post_content' => wp_slash( $content ) );
		$postarr   = array( 'ID' => 0 );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		$this->assertSame( $data['post_content'], $result['post_content'] );
	}

	/**
	 * Feedback blocks are also guarded.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_strips_unknown_feedback_survey_id() {
		$content = $this->make_legacy_feedback_block( 55555 );
		$data    = array( 'post_content' => wp_slash( $content ) );
		$postarr = array( 'ID' => 0 );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		$unslashed = wp_unslash( $result['post_content'] );
		$this->assertStringNotContainsString( '"surveyId"', $unslashed );
		$this->assertStringContainsString( 'surveyClientId', $unslashed );
	}

	/**
	 * Unknown surveyId nested inside a group block should be stripped.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::guard_survey_ids_in_content
	 */
	public function test_guard_strips_unknown_survey_id_in_nested_block() {
		$inner   = $this->make_legacy_nps_block( 66666 );
		$content = '<!-- wp:group --><div class="wp-block-group">' . $inner . '</div><!-- /wp:group -->';
		$data    = array( 'post_content' => wp_slash( $content ) );
		$postarr = array( 'ID' => 0 );

		$result = $this->admin_hooks->guard_survey_ids_in_content( $data, $postarr );

		$unslashed = wp_unslash( $result['post_content'] );
		$this->assertStringNotContainsString( '"surveyId"', $unslashed );
		$this->assertStringContainsString( 'surveyClientId', $unslashed );
	}

	/**
	 * get_legacy_survey_ids_from_content correctly finds legacy survey IDs.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::get_legacy_survey_ids_from_content
	 */
	public function test_get_legacy_survey_ids_from_content() {
		$content = $this->make_legacy_nps_block( 111 ) . "\n" . $this->make_legacy_feedback_block( 222 );
		$ids     = Admin_Hooks::get_legacy_survey_ids_from_content( $content );

		$this->assertSame( array( 111, 222 ), $ids );
	}

	/**
	 * get_legacy_survey_ids_from_content ignores modern blocks.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::get_legacy_survey_ids_from_content
	 */
	public function test_get_legacy_survey_ids_from_content_ignores_modern_blocks() {
		$content = $this->make_modern_nps_block( wp_generate_uuid4() );
		$ids     = Admin_Hooks::get_legacy_survey_ids_from_content( $content );

		$this->assertEmpty( $ids );
	}

	/**
	 * get_legacy_survey_ids_from_content returns empty for empty content.
	 *
	 * @covers \Crowdsignal_Forms\Admin\Admin_Hooks::get_legacy_survey_ids_from_content
	 */
	public function test_get_legacy_survey_ids_from_content_empty() {
		$this->assertEmpty( Admin_Hooks::get_legacy_survey_ids_from_content( '' ) );
	}
}
