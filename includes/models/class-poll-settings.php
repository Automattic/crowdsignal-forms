<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll_Settings.
 *
 * @package crowdsignal-forms/Models
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Poll_Settings
 *
 * @since 1.0.0
 * @package Crowdsignal_Forms\Models
 */
class Poll_Settings {

	/**
	 * These constants come from (and must be kept in sync)
	 * client/blocks/poll/constants.js.
	 *
	 * @since 1.0.0
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
	 * @since 1.0.0
	 * @var string
	 */
	private $title = '';

	/**
	 * The poll after vote option.
	 *
	 * Defines what to show next after voting
	 *
	 * @values results | thank-you | custom-text | redirect
	 * @since 1.0.0
	 * @var string
	 */
	private $after_vote = self::AFTER_VOTE_RESULTS;

	/**
	 * The poll custom text after voting.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $after_message = '';

	/**
	 * Randomize answers option
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $randomize_answers = false;

	/**
	 * Block repeat voters option
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $restrict_vote_repeat = true;

	/**
	 * Captcha option
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $captcha = false;

	/**
	 * If the poll accepts multiple answers
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $multiple_choice = false;

	/**
	 * Redirect URL (after voting)
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $redirect_url = '';

	/**
	 * Poll close status
	 *
	 * @values open | closed | closed_after
	 * @since 1.0.0
	 * @var string
	 */
	private $close_status = self::CLOSE_TYPE_OPEN;

	/**
	 * Date when the poll closes
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $close_after = null;

	/**
	 * Poll_Settings constructor.
	 *
	 * @param array $data (optional) An array to construct this instance from.
	 */
	public function __construct( array $data = array() ) {
		$defaults = (array) get_object_vars( $this );

		// Perform an intersection so no array members other than the
		// object vars can be passed. Then merge.
		$data = array_merge( $defaults, array_intersect_key( $data, $defaults ) );

		// check for allowed values on close_status and after_vote.
		$allowed_close_statuses = array(
			self::CLOSE_TYPE_OPEN,
			self::CLOSE_TYPE_CLOSED,
			self::CLOSE_TYPE_SCHEDULED_CLOSE,
		);

		$data['close_status'] = in_array( $data['close_status'], $allowed_close_statuses, true )
			? $data['close_status']
			: self::CLOSE_TYPE_OPEN;

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
			$this->{$var} = $value;
		}
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
	 * @since 1.0.0
	 * @param string $context The context which we will be using the array.
	 * @return array
	 */
	public function to_array( $context = 'view' ) {
		return (array) get_object_vars( $this );
	}
}
