<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   1.0.0
 */

namespace Crowdsignal_Forms\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Gutenberg Blocks.
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   1.0.0
 */
class Crowdsignal_Forms_Blocks {
	const EDITOR_SCRIPT_NAME = 'crowdsignal-forms-blocks';
	const EDITOR_STYLE_NAME  = 'crowdsignal-forms-blocks';
	const STYLE_NAME         = 'crowdsignal-forms-public';
	const POLL_SCRIPT_NAME   = 'crowdsignal-forms-poll';

	/**
	 * Registers Crowdsignal Forms' custom Gutenberg blocks
	 */
	public function register() {
		// phpcs:ignore
		$editor_config = include( plugin_dir_path( CROWDSIGNAL_FORMS_PLUGIN_FILE ) . '/build/editor.asset.php' );

		wp_register_script(
			self::EDITOR_SCRIPT_NAME,
			plugins_url( 'build/editor.js', CROWDSIGNAL_FORMS_PLUGIN_FILE ),
			$editor_config['dependencies'],
			$editor_config['version'],
			true
		);

		wp_register_style(
			self::EDITOR_STYLE_NAME,
			plugins_url( 'build/editor.css', CROWDSIGNAL_FORMS_PLUGIN_FILE ),
			array( 'wp-components' ),
			$editor_config['version']
		);

		wp_register_style(
			self::STYLE_NAME,
			plugins_url( 'build/public.css', CROWDSIGNAL_FORMS_PLUGIN_FILE ),
			array( 'wp-components' ),
			$editor_config['version']
		);

		// phpcs:ignore
		$poll_config = include( plugin_dir_path( CROWDSIGNAL_FORMS_PLUGIN_FILE ) . '/build/poll.asset.php' );
		wp_register_script(
			self::POLL_SCRIPT_NAME,
			plugins_url( 'build/poll.js', CROWDSIGNAL_FORMS_PLUGIN_FILE ),
			$poll_config['dependencies'],
			$poll_config['version'],
			true
		);

		register_block_type(
			'crowdsignal-forms/poll',
			array(
				'editor_script'   => self::EDITOR_SCRIPT_NAME,
				'editor_style'    => self::EDITOR_STYLE_NAME,
				'script'          => self::POLL_SCRIPT_NAME,
				'style'           => self::STYLE_NAME,
				'render_callback' => array( $this, 'poll_render_callback' ),
			)
		);
	}

	/**
	 * Renders the poll dynamic block
	 *
	 * @param array $attributes The block's attributes.
	 */
	public function poll_render_callback( $attributes ) {
		return sprintf( '<div data-crowdsignal-poll="%s"></div>', htmlentities( wp_json_encode( $attributes ) ) );
	}
}
