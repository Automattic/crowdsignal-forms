<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Vote_Block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   1.1.0
 */

namespace Crowdsignal_Forms\Frontend\Blocks;

use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets;
use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block;
use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Vote block.
 *
 * @package  Crowdsignal_Forms\Frontend\Blocks
 * @since    0.9.0
 */
class Crowdsignal_Forms_Vote_Block extends Crowdsignal_Forms_Block {

	/**
	 * {@inheritDoc}
	 */
	public function asset_identifier() {
		return 'crowdsignal-forms-vote';
	}

	/**
	 * {@inheritDoc}
	 */
	public function assets() {
		return array(
			'config' => '/build/vote.asset.php',
			'script' => '/build/vote.js',
			'style'  => '/build/vote.css',
		);
	}

	/**
	 * {@inheritDoc}
	 */
	public function register() {
		register_block_type(
			'crowdsignal-forms/vote',
			array(
				'attributes'      => $this->attributes(),
				'editor_script'   => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'editor_style'    => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the Vote dynamic block
	 *
	 * @param array  $attributes            The block's attributes.
	 * @param string $rendered_inner_blocks The server side rendered inner blocks.
	 * @return string
	 */
	public function render( $attributes, $rendered_inner_blocks ) {
		if ( $this->should_hide_block() ) {
			return '';
		}

		wp_enqueue_script( $this->asset_identifier() );
		wp_enqueue_style( $this->asset_identifier() );

		$attributes['hideBranding'] = $this->should_hide_branding();
		$platform_poll_data         = $this->get_platform_poll_data( $attributes['pollId'] );
		if ( ! empty( $platform_poll_data ) ) {
			$attributes['apiPollData'] = $platform_poll_data;
		}

		return sprintf(
			'<div class="crowdsignal-vote-wrapper" data-crowdsignal-vote="%s">%s</div>',
			htmlentities( wp_json_encode( $attributes ) ),
			$rendered_inner_blocks
		);
	}

	/**
	 * Determines if the vote block should be rendered or not.
	 *
	 * @return bool
	 */
	private function should_hide_block() {
		return ! $this->is_cs_connected();
	}

	/**
	 * Returns the attributes definition array for register_block_type
	 *
	 * Note: Any changes to the array returned by this function need to be
	 *       duplicated in client/blocks/vote/attributes.js.
	 *
	 * @return array
	 */
	private function attributes() {
		return array(
			'pollId'              => array(
				'type'    => 'string',
				'default' => null,
			),
			'hideBranding'        => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'title'               => array(
				'type'    => 'string',
				'default' => null,
			),
			'pollStatus'          => array(
				'type'    => 'string',
				'default' => 'open',
			),
			'closedAfterDateTime' => array(
				'type'    => 'string',
				'default' => null,
			),
			'size'                => array(
				'type'    => 'string',
				'default' => 'medium',
			),
			'borderWidth'         => array(
				'type'    => 'number',
				'default' => 1,
			),
			'borderRadius'        => array(
				'type'    => 'number',
				'default' => 5,
			),
			'hideResults'         => array(
				'type'    => 'boolean',
				'default' => false,
			),
		);
	}
}
