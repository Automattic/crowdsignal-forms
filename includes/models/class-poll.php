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
	const POLL_ID_BLOCK_ATTRIBUTE   = 'pollId';
	const ANSWER_ID_BLOCK_ATTRIBUTE = 'answerId';

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
	 * The poll answers.
	 *
	 * @since 1.0.0
	 * @var array
	 */
	private $answers = array();

	/**
	 * The poll settings.
	 *
	 * @since 1.0.0
	 * @var Poll_Settings|null
	 */
	private $settings = null;

	/**
	 * Poll constructor.
	 *
	 * @param int           $id The id.
	 * @param string        $question The question.
	 * @param array         $answers The answers.
	 * @param Poll_Settings $settings The settings.
	 */
	public function __construct( $id, $question, array $answers, Poll_Settings $settings ) {
		$this->id       = $id;
		$this->question = $question;
		$this->answers  = $answers;
		$this->settings = $settings;
	}

	/**
	 * Creates a new Poll object from an array.
	 *
	 * @param array $data The data.
	 * @return Poll
	 * @since 1.0.0
	 */
	public static function from_array( $data ) {
		$id       = isset( $data['id'] ) ? absint( $data['id'] ) : 0;
		$question = isset( $data['question'] ) ? $data['question'] : '';
		$answers  = array_map(
			function ( $poll_data ) {
				return Poll_Answer::from_array( $poll_data );
			},
			isset( $data['answers'] ) ? $data['answers'] : array()
		);
		$settings = Poll_Settings::from_array( isset( $data['settings'] ) ? $data['settings'] : array() );
		return new self( $id, $question, $answers, $settings );
	}

	/**
	 * Creates a new Poll object from a block attribute array.
	 *
	 * @param array $attrs The attrs array.
	 * @return Poll
	 * @since 1.0.0
	 */
	public static function from_block( $attrs ) {
		$data             = array();
		$data['id']       = isset( $attrs[ self::POLL_ID_BLOCK_ATTRIBUTE ] ) ? absint( $attrs[ self::POLL_ID_BLOCK_ATTRIBUTE ] ) : 0;
		$data['question'] = isset( $attrs['question'] ) ? $attrs['question'] : '';
		$data['note']     = isset( $attrs['note'] ) ? $attrs['note'] : '';
		$data['answers']  = array_map(
			function ( $answer_data ) {
				if ( isset( $answer_data[ self::ANSWER_ID_BLOCK_ATTRIBUTE ] ) && $answer_data[ self::ANSWER_ID_BLOCK_ATTRIBUTE ] > 0 ) {
					$answer_data['id'] = absint( $answer_data[ self::ANSWER_ID_BLOCK_ATTRIBUTE ] );
				}
				$answer_data['answer_text'] = $answer_data['text'];
				return $answer_data;
			},
			isset( $attrs['answers'] ) ? $attrs['answers'] : array()
		);
		$data['settings'] = isset( $attrs['settings'] ) ? $attrs['settings'] : array();
		return self::from_array( $data );
	}

	/**
	 * Validates the poll is ok for saving.
	 *
	 * @since 1.0.0
	 * @return bool|\WP_Error
	 */
	public function validate() {
		if ( empty( $this->question ) ) {
			return new \WP_Error( 'poll-invalid', __( 'Question cannot be empty', 'crowdsignal-forms' ), array( 'status' => 400 ) );
		}
		return true;
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

	/**
	 * Get the question.
	 *
	 * @since 1.0.0
	 * @return int
	 */
	public function get_question() {
		return $this->question;
	}

	/**
	 * Get the answers.
	 *
	 * @since 1.0.0
	 * @return array
	 */
	public function get_answers() {
		return $this->answers;
	}

	/**
	 * Transform the poll into an array for sending to the api or the frontend.
	 *
	 * @since 1.0.0
	 * @param string $context The context which we will be using the array.
	 * @return array
	 */
	public function to_array( $context = 'view' ) {
		$data = array();

		if ( ! empty( $this->id ) ) {
			$data['id'] = $this->id;
		}

		$data['question'] = $this->question;

		$data['settings'] = $this->settings->to_array( $context );
		foreach ( $this->get_answers() as $answer ) {
			$data['answers'][] = $answer->to_array();
		}

		return $data;
	}

}
