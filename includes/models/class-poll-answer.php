<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll_Answer.
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
class Poll_Answer {

	/**
	 * The poll answer id.
	 *
	 * @since 1.0.0
	 * @var int
	 */
	private $id = 0;

	/**
	 * The poll answer text.
	 *
	 * @since 1.0.0
	 * @var string
	 */
	private $answer_text = '';

	/**
	 * Poll constructor.
	 *
	 * @param int    $id The id.
	 * @param string $answer_text The answer_text.
	 * @since 1.0.0
	 */
	public function __construct( $id, $answer_text ) {
		$this->id          = $id;
		$this->answer_text = $answer_text;
	}

	/**
	 * Create an answer from the API.
	 *
	 * @param array $data The json response decoded.
	 *
	 * @return self
	 */
	public static function from_array( array $data ) {
		$id          = isset( $data['id'] ) && is_numeric( $data['id'] ) ? absint( $data['id'] ) : 0;
		$answer_text = isset( $data['answer_text'] ) ? $data['answer_text'] : '';
		return new self( $id, $answer_text );
	}

	/**
	 * Transform the object into an array based on the class vars values.
	 *
	 * @since 1.0.0
	 * @param string $context The context which we will be using the array.
	 * @return array
	 */
	public function to_array( $context = 'view' ) {
		$data = array(
			'answer_text' => $this->answer_text,
		);

		if ( $this->get_id() > 0 ) {
			$data['id'] = $this->get_id();
		}

		return $data;
	}

	/**
	 * Get the id.
	 *
	 * @since 1.0.0
	 * @return int
	 */
	public function get_id() {
		return $this->id;
	}
}
