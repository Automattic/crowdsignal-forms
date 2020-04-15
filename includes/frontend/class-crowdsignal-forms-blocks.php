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

	/**
	 * Registers Crowdsignal Forms' custom Gutenberg blocks
	 */
	public function register() {
		// phpcs:ignore
		$editor_config = include( plugin_dir_path( CROWDSIGNAL_FORMS_PLUGIN_FILE ) . '/build/editor.asset.php' );

		wp_register_script(
			'crowdsignal-forms-blocks',
			plugins_url( 'build/editor.js', CROWDSIGNAL_FORMS_PLUGIN_FILE ),
			$editor_config['dependencies'],
			$editor_config['version'],
			true
		);

		register_block_type(
			'crowdsignal-forms/poll',
			array( 'editor_script' => 'crowdsignal-forms-blocks' )
		);
	}
}
