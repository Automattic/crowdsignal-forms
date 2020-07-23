<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll_Answer.
 *
 * @package crowdsignal-forms/Models
 * @since 0.9.0
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Poll
 *
 * @since 0.9.0
 * @package Crowdsignal_Forms\Models
 */
class Poll_Answer {

	/**
	 * The poll answer id.
	 *
	 * @since 0.9.0
	 * @var int
	 */
	private $id = 0;

	/**
	 * The client id.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $client_id = '';

	/**
	 * The poll answer text.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $answer_text = '';

	/**
	 * Poll constructor.
	 *
	 * @param int    $id The id.
	 * @param string $answer_text The answer_text.
	 * @since 0.9.0
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
		$ans         = new self( $id, $answer_text );

		if ( isset( $data['client_id'] ) ) {
			$ans->set_client_id( $data['client_id'] );
		};

		return $ans;
	}

	/**
	 * Transform the object into an array based on the class vars values.
	 *
	 * @since 0.9.0
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

		if ( ! empty( $this->client_id ) ) {
			$data['client_id'] = $this->client_id;
		}

		return $data;
	}

	/**
	 * Get the id.
	 *
	 * @since 0.9.0
	 * @return int
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Get the block id.
	 *
	 * @since 0.9.0
	 * @return string
	 */
	public function get_client_id() {
		return $this->client_id;
	}

	/**
	 * Sets the client id.
	 *
	 * @param string $client_id The client id.
	 * @return string
	 * @since 0.9.0
	 */
	public function set_client_id( $client_id ) {
		$this->client_id = $client_id;
		return $this;
	}

	/**
	 * Updates the answer using block attrs.
	 *
	 * @param array $answer_attributes The attributes of the answers from the block.
	 * @return $this
	 */
	public function update_from_block( $answer_attributes ) {
		if ( isset( $answer_attributes['answerId'] ) ) {
			$this->client_id = $answer_attributes['answerId'];
		}

		if ( isset( $answer_attributes['text'] ) && ! empty( $answer_attributes['text'] ) ) {
			$this->answer_text = $answer_attributes['text'];
		}

		return $this;
	}
}
