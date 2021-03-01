<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Nps_block
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   1.4.0
 */

namespace Crowdsignal_Forms\Frontend\Blocks;

use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets;
use Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Block;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' NPS block.
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   1.4.0
 */
class Crowdsignal_Forms_Nps_Block extends Crowdsignal_Forms_Block {

	/**
	 * The nonce identifier string for NPS vote submittion.
	 *
	 * @since 1.4.0
	 * @var string
	 */
	const NONCE = 'crowdsignal-forms-nps__submit';

	/**
	 * {@inheritDoc}
	 */
	public function asset_identifier() {
		return 'crowdsignal-forms-nps';
	}

	/**
	 * {@inheritDoc}
	 */
	public function assets() {
		return array(
			'config' => '/build/nps.asset.php',
			'script' => '/build/nps.js',
			'style'  => '/build/nps.css',
		);
	}

	/**
	 * {@inheritDoc}
	 */
	public function register() {
		register_block_type(
			'crowdsignal-forms/nps',
			array(
				'attributes'      => $this->attributes(),
				'editor_script'   => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'editor_style'    => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the NPS dynamic block
	 *
	 * @param  array $attributes The block's attributes.
	 * @return string
	 */
	public function render( $attributes ) {
		if ( $this->should_hide_block() ) {
			return '';
		}

		wp_enqueue_script( $this->asset_identifier() );
		wp_enqueue_style( $this->asset_identifier() );

		$attributes['hideBranding'] = $this->should_hide_branding();
		$attributes['isPreview']    = is_preview();
		$attributes['nonce']        = $this->create_nonce();

		return sprintf(
			'<div class="crowdsignal-nps-wrapper" data-crowdsignal-nps="%s"></div>',
			htmlentities( wp_json_encode( $attributes ) )
		);
	}

	/**
	 * Determines if the NPS block should be rendered or not.
	 *
	 * @return bool
	 */
	private function should_hide_block() {
		return ! $this->is_cs_connected() || ! is_singular();
	}

	/**
	 * Returns the attributes definition array for register_block_type
	 *
	 * Note: Any changes to the array returned by this function need to be
	 *       duplicated in client/blocks/nps/attributes.js.
	 *
	 * @return array
	 */
	private function attributes() {
		return array(
			'backgroundColor'     => array(
				'type' => 'string',
			),
			'buttonColor'         => array(
				'type' => 'string',
			),
			'buttonTextColor'     => array(
				'type' => 'string',
			),
			'feedbackPlaceholder' => array(
				'type'    => 'string',
				'default' => __(
					'Please help us understand your rating',
					'crowdsignal-forms'
				),
			),
			'feedbackQuestion'    => array(
				'type'    => 'string',
				'default' => __(
					'Thanks so much for your response! How could we do better?',
					'crowdsignal-forms'
				),
			),
			'hideBranding'        => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'highRatingLabel'     => array(
				'type'    => 'string',
				'default' => __( 'Extremely likely', 'crowdsignal-forms' ),
			),
			'lowRatingLabel'      => array(
				'type'    => 'string',
				'default' => __( 'Not likely at all', 'crowdsignal-forms' ),
			),
			'ratingQuestion'      => array(
				'type'    => 'string',
				'default' => __(
					'How likely is it that you would recommend this project to a friend or colleague?',
					'crowdsignal-forms'
				),
			),
			'submitButtonLabel'   => array(
				'type'    => 'string',
				'default' => __( 'Submit', 'crowdsignal-forms' ),
			),
			'surveyId'            => array(
				'type'    => 'number',
				'default' => null,
			),
			'textColor'           => array(
				'type' => 'string',
			),
			'title'               => array(
				'type'    => 'string',
				'default' => '',
			),
			'viewThreshold'       => array(
				'type'    => 'string',
				'default' => 3,
			),
			'status'              => array(
				'type'    => 'string',
				'default' => 'open', // See: client/blocks/nps/constants.js.
			),
			'closedAfterDateTime' => array(
				'type'    => 'string',
				'default' => null,
			),
		);
	}

	/**
	 * Returns a nonce based on the NONCE.
	 * The nonce creation is first attempted through crowdsignal_forms_nps_nonce filter.
	 *
	 * @since 1.4.3
	 * @return string
	 */
	private function create_nonce() {
		$nonce = apply_filters( 'crowdsignal_forms_nps_nonce', self::NONCE );

		if ( self::NONCE === $nonce ) { // returned unfiltered.
			$nonce = wp_create_nonce( self::NONCE );
		}
		return $nonce;
	}

	/**
	 * Verifies a nonce based on the NONCE.
	 * The nonce creation is first attempted through crowdsignal_forms_nps_nonce filter.
	 *
	 * @since 1.4.3
	 * @param string $nonce
	 * @return bool
	 */
	public static function verify_nonce( $nonce ) {
		$verifies = apply_filters( 'crowdsignal_forms_nps_nonce_check', $nonce, self::NONCE );

		if ( $verifies === $nonce ) { // returned unfiltered.
			$verifies = wp_verify_nonce( $nonce, self::NONCE );
		}
		return $verifies;
	}
}
