<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Describes Crowdsignal Forms' Gutenberg blocks.
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   0.9.0
 */
interface Crowdsignal_Forms_Block {

	/**
	 * Registers the Gutenberg block.
	 */
	public function register();
}
