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
	 * The poll title.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $title = '';

	/**
	 * The poll end action.
	 *
	 * Still debating the possible values for this (redirect, thanks,...).
	 * Please update this doc when defined.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $end_action = '';

	/**
	 * The poll end message.
	 *
	 * Multi purpose setting for the end_action above.
	 * Redirect? => url. Thanks? => message. etc...
	 * Please update this doc when defined.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $end_message = '';

	/**
	 * Randomize answers option
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $randomize = false;

	/**
	 * Block repeat voters option
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $vote_block_repeat = true;

	/**
	 * Captcha option
	 *
	 * @since 1.0.0
	 * @var bool
	 */
	private $captcha = false;

	/**
	 * Poll_Settings constructor.
	 *
	 * @param array $data (optional) An array to construct this instance from.
	 */
	public function __construct( array $data = array() ) {
		$defaults = $this->defaults();

		// Perform an intersection so no array members other than the
		// ones on $this->defaults() can be passed. Then merge.
		$data = array_merge( $defaults, array_intersect_key( $data, $defaults ) );

		foreach ( $data as $var => $value ) {
			$this->{$var} = $value;
		}
	}

	/**
	 * Default values for the class vars as array.
	 * The values are taken from the current instance of the class.
	 * This makes for a single point of defining the default values (class vars)
	 * and is used as a filter during instantiation (see __construct)
	 *
	 * @return array $data A default settings array from class vars values.
	 */
	private function defaults() {
		return array(
			'title'             => $this->title,
			'end_action'        => $this->end_action,
			'end_message'       => $this->end_message,
			'randomize'         => $this->randomize,
			'vote_block_repeat' => $this->vote_block_repeat,
			'captcha'           => $this->captcha,
		);
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
