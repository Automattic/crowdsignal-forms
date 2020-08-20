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
class Crowdsignal_Forms_Vote_Block implements Crowdsignal_Forms_Block {
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

		// todo: add apiVote data to attributes here (see poll block).

		return sprintf(
			'<div class="crowdsignal-vote-wrapper" data-crowdsignal-vote="%s">%s</div>',
			htmlentities( wp_json_encode( $attributes ) ),
			$rendered_inner_blocks
		);
	}

	/**
	 * Determines if branding should be shown in the Vote block.
	 * Result is cached in a short-lived transient for performance.
	 *
	 * @return bool
	 */
	private function should_hide_branding() {
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
	 * Determines if the vote block should be rendered or not.
	 *
	 * @return bool
	 */
	private function should_hide_block() {
		if ( null !== self::$is_cs_connected ) {
			return ! self::$is_cs_connected;
		}

		$api_auth_provider     = Crowdsignal_Forms::instance()->get_api_authenticator();
		self::$is_cs_connected = $api_auth_provider->get_user_code();
		// purposely not doing the account is_verified check to avoid making a slow query on every page load.

		return ! self::$is_cs_connected;
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
			'voteId'       => array(
				'type'    => 'string',
				'default' => null,
			),
			'hideBranding' => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'title'        => array(
				'type'    => 'string',
				'default' => null,
			),
		);
	}
}
