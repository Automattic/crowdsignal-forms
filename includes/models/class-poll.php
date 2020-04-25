<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll.
 *
 * @package crowdsignal-forms/Models
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Poll
 *
 * @since 1.0.0
 * @package Crowdsignal_Forms\Models
 */
class Poll {

	/**
	 * The data fields.
	 *
	 * @since 1.0.0
	 * @var array
	 */
	const DATA_FIELDS = array( 'id', 'question' );

	/**
	 * The poll id.
	 *
	 * @since 1.0.0
	 * @var int
	 */
	private $id = 0;

	/**
	 * The poll question.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $question = '';

	/**
	 * Poll constructor.
	 *
	 * @param array $data The data.
	 */
	public function __construct( array $data = array() ) {
		foreach ( self::DATA_FIELDS as $key ) {
			if ( isset( $data[ $key ] ) ) {
				$value = $data[ $key ];
				if ( 'id' === $key ) {
					$value = absint( $value );
				}

				$this->{$key} = $value;
			}
		}
	}
}
