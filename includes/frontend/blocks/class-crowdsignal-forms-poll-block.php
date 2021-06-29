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

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Poll block.
 *
 * @package  Crowdsignal_Forms\Frontend\Blocks
 * @since    0.9.0
 */
class Crowdsignal_Forms_Poll_Block extends Crowdsignal_Forms_Block {

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
		if ( $this->should_hide_block( $attributes ) ) {
			return '';
		}

		wp_enqueue_script( $this->asset_identifier() );
		wp_enqueue_style( $this->asset_identifier() );

		if ( isset( $attributes['redirectAddress'] ) ) {
			$attributes['redirectAddress'] = esc_url( $attributes['redirectAddress'] );
		}
		$attributes['hideBranding'] = $this->should_hide_branding();
		$platform_poll_data         = $this->get_platform_poll_data( $attributes['pollId'] );
		if ( ! empty( $platform_poll_data ) ) {
			$attributes['apiPollData'] = $platform_poll_data;
		}

		$align = ! empty( $attributes['align'] ) ? $attributes['align'] : '';

		return sprintf(
			'<div class="align%s crowdsignal-poll-wrapper" data-crowdsignal-poll="%s"></div>',
			esc_attr( $align ),
			htmlentities( wp_json_encode( $attributes ) )
		);
	}

	/**
	 * Determines if the poll should be rendered or not.
	 *
	 * @param  array $attributes The poll's saved attributes.
	 * @return bool
	 */
	private function should_hide_block( $attributes ) {
		if ( empty( $attributes['question'] ) ) {
			return true;
		}

		return ! $this->is_cs_connected();
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
				'default' => null,
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
				'type' => 'string',
			),
			'width'                       => array(
				'type'    => 'number',
				'default' => 100,
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
