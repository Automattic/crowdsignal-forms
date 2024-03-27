<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Blocks\Crowdsignal_Forms_Feedback_block
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
 * Handles Crowdsignal Forms' Feedback block.
 *
 * @package Crowdsignal_Forms\Frontend\Blocks
 * @since   1.4.0
 */
class Crowdsignal_Forms_Feedback_Block extends Crowdsignal_Forms_Block {

	/**
	 * The nonce identifier string for Feedback submission.
	 *
	 * @since 1.5.1
	 * @var string
	 */
	const NONCE = 'crowdsignal-forms-feedback__submit';

	/**
	 * {@inheritDoc}
	 */
	public function asset_identifier() {
		return 'crowdsignal-forms-feedback';
	}

	/**
	 * {@inheritDoc}
	 */
	public function assets() {
		return array(
			'config' => '/build/feedback.asset.php',
			'script' => '/build/feedback.js',
			'style'  => '/build/feedback.css',
		);
	}

	/**
	 * {@inheritDoc}
	 */
	public function register() {
		register_block_type(
			'crowdsignal-forms/feedback',
			array(
				'attributes'      => $this->attributes(),
				'editor_script'   => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'editor_style'    => Crowdsignal_Forms_Blocks_Assets::EDITOR,
				'render_callback' => array( $this, 'render' ),
			)
		);
	}

	/**
	 * Renders the Feedback dynamic block
	 *
	 * @param  array $attributes The block's attributes.
	 * @return string
	 */
	public function render( $attributes ) {
		if ( $this->should_hide_block( $attributes ) ) {
			return '';
		}

		wp_enqueue_script( $this->asset_identifier() );
		wp_enqueue_style( $this->asset_identifier() );

		$attributes['hideBranding'] = $this->should_hide_branding();
		$attributes['nonce']        = $this->create_nonce();

		return sprintf(
			'<div class="crowdsignal-feedback-wrapper" data-crowdsignal-feedback="%s"></div>',
			htmlentities( wp_json_encode( $attributes ) )
		);
	}

	/**
	 * Determines if the Feedback block should be rendered or not.
	 *
	 * @param  array $attributes The block's attributes.
	 * @return bool
	 */
	private function should_hide_block( $attributes = array() ) {
		if (
			! empty( $attributes['isWidget'] ) && (
				! $this->is_cs_connected() ||
				! is_singular()
			)
		) {
				return true;
		}

		if ( empty( $attributes['surveyId'] ) ) {
			return true;
		}

		if ( isset( $attributes['status'] ) ) {
			if ( self::STATUS_TYPE_CLOSED === $attributes['status'] ) {
				return true;
			} elseif ( self::STATUS_TYPE_SCHEDULED === $attributes['status'] && isset( $attributes['closedAfterDateTime'] ) ) {
				try {
					$close_date = \DateTime::createFromFormat( 'Y-m-d\TH:i:s+', $attributes['closedAfterDateTime'] );
					$timestamp  = $close_date->getTimestamp();
				} catch ( \Exception $e ) {
					return false;
				}

				if ( time() > $timestamp ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Returns the attributes definition array for register_block_type
	 *
	 * Note: Any changes to the array returned by this function need to be
	 *       duplicated in client/blocks/feedback/attributes.js.
	 *
	 * @return array
	 */
	private function attributes() {
		return array(
			'backgroundColor'        => array(
				'type' => 'string',
			),
			'buttonColor'            => array(
				'type' => 'string',
			),
			'buttonTextColor'        => array(
				'type' => 'string',
			),
			'emailPlaceholder'       => array(
				'type'    => 'string',
				'default' => __( 'Your Email', 'crowdsignal-forms' ),
			),
			'emailRequired'          => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'feedbackPlaceholder'    => array(
				'type'    => 'string',
				'default' => __( 'Please let us know how we can do better…', 'crowdsignal-forms' ),
			),
			'header'                 => array(
				'type'    => 'string',
				'default' => __( '👋 Hey there!', 'crowdsignal-forms' ),
			),
			'hideBranding'           => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'hideTriggerShadow'      => array(
				'type'    => 'boolean',
				'default' => false,
			),
			'submitButtonLabel'      => array(
				'type'    => 'string',
				'default' => __( 'Submit', 'crowdsignal-forms' ),
			),
			'submitText'             => array(
				'type'    => 'string',
				'default' => __( 'Thanks for letting us know!', 'crowdsignal-forms' ),
			),
			'surveyId'               => array(
				'type'    => 'number',
				'default' => null,
			),
			'textColor'              => array(
				'type' => 'string',
			),
			'toggleOn'               => array(
				'type'    => 'string',
				'default' => 'click',
			),
			'triggerLabel'           => array(
				'type'    => 'string',
				'default' => __( 'Feedback', 'crowdsignal-forms' ),
			),
			'triggerBackgroundColor' => array(
				'type' => 'string',
			),
			'triggerTextColor'       => array(
				'type' => 'string',
			),
			'title'                  => array(
				'type'    => 'string',
				'default' => null,
			),
			'x'                      => array(
				'type'    => 'string',
				'default' => 'left',
			),
			'y'                      => array(
				'type'    => 'string',
				'default' => 'bottom',
			),
			'status'                 => array(
				'type'    => 'string',
				'default' => 'open', // See: client/blocks/feedback/constants.js.
			),
			'closedAfterDateTime'    => array(
				'type'    => 'string',
				'default' => null,
			),
			'emailResponses'         => array(
				'type'    => 'boolean',
				'default' => true,
			),
		);
	}

	/**
	 * Verifies a nonce based on the NONCE.
	 * The nonce creation is first attempted through crowdsignal_forms_feedback_nonce filter.
	 *
	 * @since 1.5.1
	 * @param string $nonce
	 * @return bool
	 */
	public static function verify_nonce( $nonce ) {
		$verifies = apply_filters( 'crowdsignal_forms_feedback_nonce_check', $nonce, self::NONCE );

		if ( $verifies === $nonce ) { // returned unfiltered.
			$verifies = wp_verify_nonce( $nonce, self::NONCE );
		}
		return $verifies;
	}

	/**
	 * Returns a nonce based on the NONCE.
	 * The nonce creation is first attempted through crowdsignal_forms_feedback_nonce filter.
	 *
	 * @since 1.5.1
	 * @return string
	 */
	private function create_nonce() {
		$nonce = apply_filters( 'crowdsignal_forms_feedback_nonce', self::NONCE );

		if ( self::NONCE === $nonce ) { // returned unfiltered.
			$nonce = wp_create_nonce( self::NONCE );
		}
		return $nonce;
	}
}
