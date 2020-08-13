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

	/**
	 * Returns a unique name for the block's registered assets.
	 *
	 * @return string The name for the registered assets.
	 */
	public function asset_identifier();

	/**
	 * Configuration array for the assets of the block.
	 * Must conform to the following format:
	 * array(
	 *      'config' => '/build/poll.asset.php',
	 *      'script' => '/build/poll.js',
	 *      'style'  => '/build/poll.css',
	 * )
	 *
	 * @return array The config array.
	 */
	public function assets();
}
