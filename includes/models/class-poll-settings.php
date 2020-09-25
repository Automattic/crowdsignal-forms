<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll_Settings.
 *
 * @package crowdsignal-forms/Models
 * @since 0.9.0
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Poll_Settings
 *
 * @since 0.9.0
 * @package Crowdsignal_Forms\Models
 */
class Poll_Settings {

	/**
	 * These constants come from (and must be kept in sync)
	 * client/blocks/poll/constants.js.
	 *
	 * @since 0.9.0
	 */
	const AFTER_VOTE_RESULTS         = 'results';
	const AFTER_VOTE_THANKYOU        = 'thank-you';
	const AFTER_VOTE_CUSTOM          = 'custom-text';
	const AFTER_VOTE_REDIRECT        = 'redirect';
	const CLOSE_TYPE_OPEN            = 'open';
	const CLOSE_TYPE_SCHEDULED_CLOSE = 'closed-after';
	const CLOSE_TYPE_CLOSED          = 'closed';

	/**
	 * The poll title.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $title = '';

	/**
	 * The poll after vote option.
	 *
	 * Defines what to show next after voting
	 *
	 * @values results | thank-you | custom-text | redirect
	 * @since 0.9.0
	 * @var string
	 */
	private $after_vote = self::AFTER_VOTE_RESULTS;

	/**
	 * The poll custom text after voting.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $after_message = '';

	/**
	 * Randomize answers option
	 *
	 * @since 0.9.0
	 * @var bool
	 */
	private $randomize_answers = false;

	/**
	 * Block repeat voters option
	 *
	 * @since 0.9.0
	 * @var bool
	 */
	private $restrict_vote_repeat = false;

	/**
	 * Captcha option
	 *
	 * @since 0.9.0
	 * @var bool
	 */
	private $captcha = false;

	/**
	 * If the poll accepts multiple answers
	 *
	 * @since 0.9.0
	 * @var bool
	 */
	private $multiple_choice = false;

	/**
	 * Redirect URL (after voting)
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $redirect_url = '';

	/**
	 * Poll close status
	 *
	 * @values open | closed | closed_after
	 * @since 0.9.0
	 * @var string
	 */
	private $close_status = self::CLOSE_TYPE_OPEN;

	/**
	 * Date when the poll closes
	 *
	 * @since 0.9.0
	 * @var bool
	 */
	private $close_after = null;

	/**
	 * Poll_Settings constructor.
	 *
	 * @param array $data (optional) An array to construct this instance from.
	 */
	public function __construct( array $data = array() ) {
		$this->update_from_array( $data );
	}

	/**
	 * Update this object's props from a data array.
	 *
	 * @since 0.9.0
	 * @param array $data All the data.
	 * @return $this
	 */
	private function update_from_array( $data ) {
		// on construct, these will be the defaults.
		$current_values = (array) get_object_vars( $this );
		$keys           = array_keys( $current_values );

		// Perform an intersection so no array members other than the
		// object vars can be passed. Then merge.
		$data = array_merge( $current_values, array_intersect_key( $data, $current_values ) );
		// check for allowed values on close_status and after_vote.
		$allowed_close_statuses = array(
			self::CLOSE_TYPE_OPEN,
			self::CLOSE_TYPE_CLOSED,
			self::CLOSE_TYPE_SCHEDULED_CLOSE,
		);

		$data['close_status'] = in_array( $data['close_status'], $allowed_close_statuses, true )
			? $data['close_status']
			: self::CLOSE_TYPE_OPEN;

		$data['close_after'] = strtotime( $data['close_after'] );

		$allowed_after_vote_options = array(
			self::AFTER_VOTE_RESULTS,
			self::AFTER_VOTE_THANKYOU,
			self::AFTER_VOTE_CUSTOM,
			self::AFTER_VOTE_REDIRECT,
		);

		$data['after_vote'] = in_array( $data['after_vote'], $allowed_after_vote_options, true )
			? $data['after_vote']
			: self::AFTER_VOTE_RESULTS;

		foreach ( $data as $var => $value ) {
			if ( in_array( $var, $keys, true ) ) {
				$this->{$var} = $value;
			}
		}

		return $this;
	}

	/**
	 * Create one from the API.
	 *
	 * @param array $data The data.
	 *
	 * @return Poll_Settings
	 */
	public static function from_array( $data ) {
		return new self( $data );
	}

	/**
	 * Transform the object into an array based on the class vars values.
	 *
	 * @since 0.9.0
	 * @param string $context The context which we will be using the array.
	 * @return array
	 */
	public function to_array( $context = 'view' ) {
		return (array) get_object_vars( $this );
	}

	/**
	 * Update the settings from the block's attrs.
	 *
	 * @since 0.9.0
	 * @param array $attrs All the block attrs.
	 * @return $this
	 */
	public function update_from_block( $attrs ) {
		$settings_from_block = $attrs;
		// These are not yet implemented.
		$settings_data = array(
			'captcha' => false,
		);

		$block_attributes_to_object_props = array(
			'title'                     => 'title',
			'confirmMessageType'        => 'after_vote',
			'randomizeAnswers'          => 'randomize_answers',
			'hasOneResponsePerComputer' => 'restrict_vote_repeat',
			'isMultipleChoice'          => 'multiple_choice',
			'pollStatus'                => 'close_status',
			'closedAfterDateTime'       => 'close_after',
			'customConfirmMessage'      => 'after_message',
			'redirectAddress'           => 'redirect_url',
		);

		foreach ( $block_attributes_to_object_props as $block_attr => $object_property_name ) {
			if ( isset( $settings_from_block[ $block_attr ] ) ) {
				$settings_data[ $object_property_name ] = $settings_from_block[ $block_attr ];
			}
		}
		$this->update_from_array( $settings_data );
		return $this;
	}
}
