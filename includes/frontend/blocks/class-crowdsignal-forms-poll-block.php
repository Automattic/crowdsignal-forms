<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Poll_Block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Frontend\Blocks;

use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets;
use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block;
use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Poll block.
 *
 * @package  Crowdsignal_Forms\Frontend\Blocks
 * @since    0.9.0
 */
class Crowdsignal_Forms_Poll_Block implements Crowdsignal_Forms_Block {
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
		return 'crowdsignal-forms-poll';
	}

	/**
	 * {@inheritDoc}
	 */
	public function assets() {
		return array(
			'config' => '/build/poll.asset.php',
			'script' => '/build/poll.js',
			'style'  => '/build/poll.css',
		);
	}

	/**
	 * {@inheritDoc}
	 */
	public function register() {
		register_block_type(
			'crowdsignal-forms/poll',
			array(
				'attributes'      => $this->attributes(),
				'editor_script'   => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'editor_style'    => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the poll dynamic block
	 *
	 * @param array $attributes The block's attributes.
	 * @return string
	 */
	public function render( $attributes ) {
		if ( $this->should_hide_poll( $attributes ) ) {
			return '';
		}

		wp_enqueue_script( $this->asset_identifier() );
		wp_enqueue_style( $this->asset_identifier() );

		$attributes['hideBranding'] = $this->should_hide_branding();
		$post                       = get_post();
		if ( $post && isset( $attributes['pollId'] ) ) {
			$platform_poll_data = Crowdsignal_Forms::instance()
				->get_post_poll_meta_gateway()
				->get_poll_data_for_poll_client_id( $post->ID, $attributes['pollId'] );

			if ( ! empty( $platform_poll_data ) ) {
				$attributes['apiPollData'] = $platform_poll_data;
			}
		}

		return sprintf(
			'<div class="align%s crowdsignal-poll-wrapper" data-crowdsignal-poll="%s"></div>',
			$attributes['align'],
			htmlentities( wp_json_encode( $attributes ) )
		);
	}

	/**
	 * Determines if branding should be shown in the poll.
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
	 * Determines if the poll should be rendered or not.
	 *
	 * @param  array $attributes The poll's saved attributes.
	 * @return bool
	 */
	private function should_hide_poll( $attributes ) {
		if ( empty( $attributes['question'] ) ) {
			return true;
		}

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
	 *       duplicated in client/blocks/poll/attributes.js.
	 *
	 * @return array
	 */
	private function attributes() {
		return array(
			'pollId'                      => array(
				'type'    => 'string',
				'default' => null,
			),
			'isMultipleChoice'            => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'title'                       => array(
				'type'    => 'string',
				'default' => __( 'Untitled Poll', 'crowdsignal-forms' ),
			),
			'question'                    => array(
				'type'    => 'string',
				'default' => '',
			),
			'note'                        => array(
				'type'    => 'string',
				'default' => '',
			),
			'answers'                     => array(
				'type'    => 'array',
				'default' => array( new \stdClass(), new \stdClass(), new \stdClass() ),
				'items'   => array(
					'type'       => 'object',
					'properties' => array(
						'answerId' => array(
							'type'    => 'string',
							'default' => null,
						),
						'text'     => array(
							'type'    => 'string',
							'default' => '',
						),
					),
				),
			),
			'submitButtonLabel'           => array(
				'type'    => 'string',
				'default' => __( 'Submit', 'crowdsignal-forms' ),
			),
			'submitButtonTextColor'       => array(
				'type' => 'string',
			),
			'submitButtonBackgroundColor' => array(
				'type' => 'string',
			),
			'confirmMessageType'          => array(
				'type'    => 'string',
				'default' => 'results', // See: client/blocks/poll/constants.js.
			),
			'customConfirmMessage'        => array(
				'type' => 'string',
			),
			'redirectAddress'             => array(
				'type' => 'string',
			),
			'textColor'                   => array(
				'type' => 'string',
			),
			'backgroundColor'             => array(
				'type' => 'string',
			),
			'borderColor'                 => array(
				'type' => 'string',
			),
			'borderWidth'                 => array(
				'type'    => 'number',
				'default' => 2,
			),
			'borderRadius'                => array(
				'type'    => 'number',
				'default' => 0,
			),
			'hasBoxShadow'                => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'fontFamily'                  => array(
				'type'    => 'string',
				'default' => null,
			),
			'hasOneResponsePerComputer'   => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'randomizeAnswers'            => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'align'                       => array(
				'type'    => 'string',
				'default' => 'center',
			),
			'pollStatus'                  => array(
				'type'    => 'string',
				'default' => 'open', // See: client/blocks/poll/constants.js.
			),
			'closedPollState'             => array(
				'type'    => 'string',
				'default' => 'show-results', // See: client/blocks/poll/constants.js.
			),
			'closedAfterDateTime'         => array(
				'type'    => 'string',
				'default' => null,
			),
			'hideBranding'                => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'buttonAlignment'             => array(
				'type'    => 'string',
				'default' => 'list', // See: client/blocks/poll/constants.js.
			),
		);
	}
}
