<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Poll.
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
class Poll {
	const POLL_ID_BLOCK_ATTRIBUTE   = 'pollId';
	const ANSWER_ID_BLOCK_ATTRIBUTE = 'answerId';

	/**
	 * The poll id.
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
	 * The poll question.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $question = '';

	/**
	 * The poll answers.
	 *
	 * @since 0.9.0
	 * @var array
	 */
	private $answers = array();

	/**
	 * The poll settings.
	 *
	 * @since 0.9.0
	 * @var Poll_Settings|null
	 */
	private $settings = null;

	/**
	 * The poll source_link.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $source_link = '';

	/**
	 * The poll note.
	 *
	 * @since 0.9.0
	 * @var string
	 */
	private $note = '';

	/**
	 * The poll based block type.
	 *
	 * @since 1.1.0
	 * @var string
	 */
	private $poll_type = '';

	/**
	 * Poll constructor.
	 *
	 * @param int           $id The id.
	 * @param string        $question The question.
	 * @param string        $note The note.
	 * @param array         $answers The answers.
	 * @param Poll_Settings $settings The settings.
	 */
	public function __construct( $id, $question, $note, array $answers, Poll_Settings $settings ) {
		$this->id       = $id;
		$this->question = $question;
		$this->note     = $note;
		$this->answers  = $answers;
		$this->settings = $settings;
	}

	/**
	 * Creates a new Poll object from an array.
	 *
	 * @param array $data The data.
	 * @return Poll
	 * @since 0.9.0
	 */
	public static function from_array( $data ) {
		$id       = isset( $data['id'] ) ? absint( $data['id'] ) : 0;
		$question = isset( $data['question'] ) ? $data['question'] : '';
		$note     = isset( $data['note'] ) ? $data['note'] : '';
		$answers  = array_map(
			function ( $poll_data ) {
				return Poll_Answer::from_array( $poll_data );
			},
			isset( $data['answers'] ) ? $data['answers'] : array()
		);
		$settings = Poll_Settings::from_array( isset( $data['settings'] ) ? $data['settings'] : array() );
		$poll     = new self( $id, $question, $note, $answers, $settings );

		if ( isset( $data['client_id'] ) ) {
			$poll->set_client_id( $data['client_id'] );
		}

		if ( isset( $data['comment_id'] ) ) {
			$poll->set_source_link( \get_comment_link( $data['comment_id'] ) );
		} elseif ( isset( $data['post_id'] ) ) {
			// v2 will carry both edit and view links, leaving this commented for the future
			// $source_link = trim( admin_url( 'post.php?post=' . $data['post_id'] . '&action=edit' ) );
			// $poll->set_source_link( $source_link );.
			$poll->set_source_link( \get_permalink( $data['post_id'] ) );
		} else {
			$poll->set_source_link( \get_site_url() );
		}

		return $poll;
	}

	/**
	 * Processes the block data to convert a poll based block to a poll model.
	 *
	 * @param mixed $block
	 * @return $this
	 * @since 1.1.0
	 */
	public function update_from_block( $block ) {
		$this->set_poll_type( str_replace( 'crowdsignal-forms/', '', $block['blockName'] ) );

		$attrs = $block['attrs'];

		if ( 'crowdsignal-forms/poll' === $block['blockName'] ) {
			return $this->update_from_block_attrs( $attrs, $attrs['answers'] );
		}

		if ( 'crowdsignal-forms/vote' === $block['blockName'] ) {
			$answers = array();

			foreach ( $block['innerBlocks'] as $child ) {
				$child_attrs         = $child['attrs'];
				$child_attrs['text'] = $child_attrs['type'];
				$answers[]           = $child_attrs;
			}

			return $this->update_from_block_attrs( $attrs, $answers );
		}

		if ( 'crowdsignal-forms/applause' === $block['blockName'] ) {
			$answers = array();

			$answers[] = array(
				'answerId' => $attrs['answerId'],
				'text'     => 'clap',
			);

			return $this->update_from_block_attrs( $attrs, $answers );
		}

		return $this;
	}

	/**
	 * Update this poll from the block attrs.
	 *
	 * @param array $attrs The block attrs.
	 * @param array $answers The answer attributes.
	 * @return $this
	 */
	public function update_from_block_attrs( $attrs, $answers ) {
		$this->client_id   = $attrs['pollId'] ? $attrs['pollId'] : '';
		$attribute_answers = isset( $answers ) ? $answers : array();
		$this->question    = isset( $attrs['question'] ) ? $attrs['question'] : '';
		$this->note        = isset( $attrs['note'] ) ? $attrs['note'] : '';

		$block_answers_by_uuid = array();
		foreach ( $attribute_answers as $attribute_answer ) {
			if ( gettype( $attribute_answer ) === 'object' ) {
				// if answer is an object, then it is still a default value, so there are no answer ids set.
				continue;
			}
			$block_answers_by_uuid[ $attribute_answer['answerId'] ] = $attribute_answer;
		}

		foreach ( $this->answers as $i => &$answer ) {
			$answer_block_id = $answer->get_client_id();
			if ( in_array( $answer_block_id, array_keys( $block_answers_by_uuid ), true ) ) {
				$answer->update_from_block( $block_answers_by_uuid[ $answer_block_id ] );
				unset( $block_answers_by_uuid[ $answer_block_id ] );
			} else {
				// todo: delete this answer, it is no longer in the block.
				unset( $this->answers[ $i ] );
			}
		}

		// Trick to reindex the array.
		$this->answers = array_values( $this->answers );

		foreach ( $block_answers_by_uuid as $new_answer_data ) {
			$new_answer = Poll_Answer::from_array( array() );
			$new_answer->update_from_block( $new_answer_data );
			$this->answers[] = $new_answer;
		}

		$this->settings->update_from_block( $attrs );

		return $this;
	}

	/**
	 * Validates the poll is ok for saving.
	 *
	 * @since 0.9.0
	 * @return bool|\WP_Error
	 */
	public function validate() {
		return true;
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
	 * Get the question.
	 *
	 * @since 0.9.0
	 * @return int
	 */
	public function get_question() {
		return $this->question;
	}

	/**
	 * Get the answers.
	 *
	 * @since 0.9.0
	 * @return array
	 */
	public function get_answers() {
		return $this->answers;
	}

	/**
	 * Get the source link we set.
	 *
	 * @return string
	 */
	public function get_source_link() {
		return $this->source_link;
	}

	/**
	 * Set the poll block source link.
	 *
	 * @param string $source_link The source link.
	 * @return $this
	 */
	public function set_source_link( $source_link ) {
		$this->source_link = $source_link;
		return $this;
	}

	/**
	 * Get the poll type.
	 *
	 * @return string
	 */
	public function get_poll_type() {
		return $this->poll_type;
	}

	/**
	 * Set the poll type.
	 *
	 * @param string $poll_type The poll type.
	 * @return $this
	 */
	public function set_poll_type( $poll_type ) {
		$this->poll_type = $poll_type;
		return $this;
	}

	/**
	 * Transform the poll into an array for sending to the api or the frontend.
	 *
	 * @since 0.9.0
	 * @param string $context The context which we will be using the array.
	 * @return array
	 */
	public function to_array( $context = 'view' ) {
		$data = array();

		if ( ! empty( $this->id ) ) {
			$data['id'] = $this->id;
		}

		$data['question'] = $this->question;
		$data['note']     = $this->note;

		$data['settings'] = $this->settings->to_array( $context );
		foreach ( $this->get_answers() as $answer ) {
			$data['answers'][] = $answer->to_array();
		}

		if ( ! empty( $this->source_link ) ) {
			$data['source_link'] = $this->get_source_link();
		}

		if ( ! empty( $this->client_id ) ) {
			$data['client_id'] = $this->client_id;
		}

		if ( ! empty( $this->poll_type ) ) {
			$data['poll_type'] = $this->poll_type;
		}

		return $data;
	}

	/**
	 * Set the client id.
	 *
	 * @param string $client_id Unique client id.
	 * @return $this
	 */
	private function set_client_id( $client_id ) {
		$this->client_id = $client_id;
		return $this;
	}
}
