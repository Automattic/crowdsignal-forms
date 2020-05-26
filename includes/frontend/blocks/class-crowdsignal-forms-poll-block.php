<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Poll_Block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   1.0.0
 */

namespace Crowdsignal_Forms\Frontend\Blocks;

use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets;
use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' Poll block.
 *
 * @package  Crowdsignal_Forms\Frontend\Blocks
 * @since    1.0.0
 */
class Crowdsignal_Forms_Poll_Block implements Crowdsignal_Forms_Block {

	/**
	 * {@inheritDoc}
	 */
	public function register() {
		register_block_type(
			'crowdsignal-forms/poll',
			array(
				'attributes'      => $this->attributes(),
				'script'          => Crowdsignal_Forms_Blocks_Assets::POLL,
				'editor_script'   => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'style'           => Crowdsignal_Forms_Blocks_Assets::POLL,
				'editor_style'    => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the poll dynamic block
	 *
	 * @param array $attributes The block's attributes.
	 */
	public function render( $attributes ) {
		return sprintf( '<div data-crowdsignal-poll="%s"></div>', htmlentities( wp_json_encode( $attributes ) ) );
	}

	/**
	 * Returns the attributes definition array for register_block_type
	 *
	 * @return array
	 */
	private function attributes() {
		return array(
			'pollId'                      => array(
				'type'    => 'number',
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
				'default' => array( array(), array(), array() ),
				'items'   => array(
					'type'       => 'object',
					'properties' => array(
						'answerId' => array(
							'type'    => 'number',
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
				'default' => true,
			),
			'fontFamily'                  => array(
				'type'    => 'string',
				'default' => null,
			),
			'hasOneResponsePerComputer'   => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'hasRandomOrderOfAnswers'     => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'blockAlignment'              => array(
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
		);
	}
}
