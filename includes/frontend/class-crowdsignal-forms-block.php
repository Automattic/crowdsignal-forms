<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Frontend;

use Crowdsignal_Forms\Crowdsignal_Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Describes Crowdsignal Forms' Gutenberg blocks.
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   0.9.0
 */
abstract class Crowdsignal_Forms_Block {
	const TRANSIENT_HIDE_BRANDING = 'cs-hide-branding';
	const HIDE_BRANDING_YES       = 'YES';
	const HIDE_BRANDING_NO        = 'NO';

	/**
	 * Lazy-loaded state to determine if the api connection is set up.
	 *
	 * @var bool|null
	 */
	private static $is_cs_connected = null;

	/**
	 * Registers the Gutenberg block.
	 */
	abstract public function register();

	/**
	 * Returns a unique name for the block's registered assets.
	 *
	 * @return string The name for the registered assets.
	 */
	abstract public function asset_identifier();

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
	abstract public function assets();

	/**
	 * Determines if branding should be shown in the poll.
	 * Result is cached in a short-lived transient for performance.
	 *
	 * @return bool
	 */
	protected function should_hide_branding() {
		if ( get_transient( self::TRANSIENT_HIDE_BRANDING ) ) {
			return self::HIDE_BRANDING_YES === get_transient( self::TRANSIENT_HIDE_BRANDING );
		}

		try {
			$capabilities  = Crowdsignal_Forms::instance()->get_api_gateway()->get_capabilities();
			$hide_branding = false !== array_search( 'hide-branding', $capabilities, true )
				? self::HIDE_BRANDING_YES
				: self::HIDE_BRANDING_NO;
		} catch ( \Exception $ex ) {
			// ignore error, we'll get the updated value next time.
			$hide_branding = self::HIDE_BRANDING_YES;
		}
		set_transient(
			self::TRANSIENT_HIDE_BRANDING,
			$hide_branding,
			MINUTE_IN_SECONDS
		);
		return self::HIDE_BRANDING_YES === $hide_branding;
	}

	/**
	 * Determines if the plugin is connected to Crowdsignal.
	 *
	 * @return bool
	 */
	protected function is_cs_connected() {
		if ( null !== self::$is_cs_connected ) {
			return self::$is_cs_connected;
		}

		$api_auth_provider     = Crowdsignal_Forms::instance()->get_api_authenticator();
		self::$is_cs_connected = false !== $api_auth_provider->get_user_code();

		// purposely not doing the account is_verified check to avoid making a slow query on every page load.

		return self::$is_cs_connected;
	}
}
