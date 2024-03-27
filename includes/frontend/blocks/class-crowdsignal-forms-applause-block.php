<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Applause_Block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   1.3.0
 */

namespace Crowdsignal_Forms\Frontend\Blocks;

use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets;
use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block;
use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Applause block.
 *
 * @package  Crowdsignal_Forms\Frontend\Blocks
 * @since    1.3.0
 */
class Crowdsignal_Forms_Applause_Block extends Crowdsignal_Forms_Block {

	/**
	 * {@inheritDoc}
	 */
	public function asset_identifier() {
		return 'crowdsignal-forms-applause';
	}

	/**
	 * {@inheritDoc}
	 */
	public function assets() {
		return array(
			'config' => '/build/applause.asset.php',
			'script' => '/build/applause.js',
			'style'  => '/build/applause.css',
		);
	}

	/**
	 * {@inheritDoc}
	 */
	public function register() {
		register_block_type(
			'crowdsignal-forms/applause',
			array(
				'attributes'      => $this->attributes(),
				'editor_script'   => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'editor_style'    => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the Applause dynamic block
	 *
	 * @param array $attributes The block's attributes.
	 * @return string
	 */
	public function render( $attributes ) {
		if ( $this->should_hide_block( $attributes ) ) {
			return '';
		}

		wp_enqueue_script( $this->asset_identifier() );
		wp_enqueue_style( $this->asset_identifier() );

		$attributes['hideBranding'] = $this->should_hide_branding();
		$platform_poll_data = null;
		if ( ! empty( $attributes['pollId'] ) ) {
			$platform_poll_data = $this->get_platform_poll_data( $attributes['pollId'] );
		}
		if ( ! empty( $platform_poll_data ) ) {
			$attributes['apiPollData'] = $platform_poll_data;
		}

		return sprintf(
			'<div class="crowdsignal-applause-wrapper" data-crowdsignal-applause="%s"></div>',
			htmlentities( wp_json_encode( $attributes ) )
		);
	}

	/**
	 * Determines if the applause block should be rendered or not.
	 *
	 * @return bool
	 */
	private function should_hide_block( $attributes ) {
		$platform_poll_data = $this->get_platform_poll_data( $attributes['pollId'] ?? null );
		if ( empty( $platform_poll_data ) ) {
			return true;
		}

		return ! $this->is_cs_connected();
	}

	/**
	 * Returns the attributes definition array for register_block_type
	 *
	 * Note: Any changes to the array returned by this function need to be
	 *       duplicated in client/blocks/applause/attributes.js.
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
			'answerId'            => array(
				'type'    => 'string',
				'default' => null,
			),
			'size'                => array(
				'type'    => 'string',
				'default' => 'medium',
			),
			'pollStatus'          => array(
				'type'    => 'string',
				'default' => 'open', // See: client/blocks/applause/constants.js.
			),
			'closedAfterDateTime' => array(
				'type'    => 'string',
				'default' => null,
			),
			'textColor'           => array(
				'type' => 'string',
			),
			'backgroundColor'     => array(
				'type' => 'string',
			),
			'borderColor'         => array(
				'type' => 'string',
			),
		);
	}
}
