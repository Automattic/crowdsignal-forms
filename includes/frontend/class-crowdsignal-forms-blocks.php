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
	 * Collection of blocks to be registered.
	 *
	 * @var Blocks\Crowdsignal_Forms_Poll_Block[]
	 */
	private static $blocks = array();

	/**
	 * Returns a list containing all block classes
	 *
	 * @return array
	 */
	public static function blocks() {
		if ( count( self::$blocks ) > 0 ) {
			return self::$blocks;
		}

		self::$blocks = array(
			new Blocks\Crowdsignal_Forms_Poll_Block(),
			new Blocks\Crowdsignal_Forms_Vote_Block(),
			new Blocks\Crowdsignal_Forms_Vote_Item_Block(),
			new Blocks\Crowdsignal_Forms_Applause_Block(),
			new Blocks\Crowdsignal_Forms_Nps_Block(),
			new Blocks\Crowdsignal_Forms_Feedback_Block(),
		);

		return self::$blocks;
	}

	/**
	 * Registers Crowdsignal Forms' custom Gutenberg blocks
	 */
	public function register() {
		foreach ( self::blocks() as $block ) {
			$block->register();
		}
	}
}
