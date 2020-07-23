<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Frontend;

use Crowdsignal_Forms\Frontend\Blocks as Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Gutenberg blocks.
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   0.9.0
 */
class Crowdsignal_Forms_Blocks {

	/**
	 * Returns a list containing all block classes
	 *
	 * @return array
	 */
	private static function blocks() {
		return array(
			Blocks\Crowdsignal_Forms_Poll_Block::class,
		);
	}

	/**
	 * Registers Crowdsignal Forms' custom Gutenberg blocks
	 */
	public function register() {
		foreach ( self::blocks() as $block_class ) {
			$block = new $block_class();
			$block->register();
		}
	}
}
