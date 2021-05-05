<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Feedback_Survey.
 *
 * @package crowdsignal-forms/Models
 * @since 1.5.1
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Feedback_Survey
 *
 * @since 1.5.1
 */
class Feedback_Survey {

	/**
	 * Survey Id.
	 *
	 * @since 1.5.1
	 * @var int
	 */
	private $id = 0;

	/**
	 * Title.
	 *
	 * @since 1.5.1
	 * @var string
	 */
	private $title = '';

	/**
	 * Feedback question.
	 *
	 * @since 1.5.1
	 * @var string
	 */
	private $feedback_placeholder = '';

	/**
	 * Email question.
	 *
	 * @since 1.5.1
	 * @var string
	 */
	private $email_placeholder = '';

	/**
	 * Permalink URL where the Feedback is published.
	 *
	 * @since 1.5.1
	 * @var string
	 */
	private $source_link = '';

	/**
	 * Whether or not responses should be sent by email.
	 *
	 * @since 1.5.1
	 * @var boolean
	 */
	private $email_responses = true;

	/**
	 * Creates a new Feedback_Survey object from an array of params.
	 *
	 * @param  array $data An array containing the survey data.
	 * @return Feedback_Survey
	 */
	public static function from_array( $data ) {
		return new Feedback_Survey(
			$data['id'],
			$data['title'],
			$data['feedback_text'],
			$data['email_text'],
			! empty( $data['source_link'] ) ? $data['source_link'] : '',
			$data['email_responses']
		);
	}

	/**
	 * Creates a new Feedback_Survey object from an array of NPS block attributes.
	 *
	 * @param  array $attributes An array containing the block attributes.
	 * @return Feedback_Survey
	 */
	public static function from_block_attributes( $attributes ) {
		return new Feedback_Survey(
			$attributes['surveyId'],
			$attributes['title'],
			$attributes['feedbackPlaceholder'],
			$attributes['emailPlaceholder'],
			! empty( $attributes['sourceLink'] ) ? $attributes['sourceLink'] : '',
			$attributes['emailResponses']
		);
	}


	/**
	 * NPS Survey constructor.
	 *
	 * @since 1.5.1
	 *
	 * @param int    $id                     Survey ID.
	 * @param string $title                  Survey title.
	 * @param string $feedback_placeholder   Feedback question.
	 * @param string $email_placeholder      Email question.
	 * @param string $source_link            Blog post/page permalink.
	 * @param string $email_responses        Enable sending responses via email.
	 */
	public function __construct( $id, $title, $feedback_placeholder, $email_placeholder, $source_link = '', $email_responses = true ) {
		$this->id                   = $id;
		$this->title                = $title;
		$this->feedback_placeholder = $feedback_placeholder;
		$this->email_placeholder    = $email_placeholder;
		$this->source_link          = $source_link;
		$this->email_responses      = $email_responses;
	}

	/**
	 * Returns the survey ID.
	 *
	 * @since 1.5.1
	 *
	 * @return int
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Transform the Feedback survey to an array for the API.
	 *
	 * @since 1.5.1
	 *
	 * @return array
	 */
	public function to_array() {
		$data = array(
			'title'           => $this->title,
			'feedback_text'   => $this->feedback_placeholder,
			'email_text'      => $this->email_placeholder,
			'source_link'     => $this->source_link,
			'email_responses' => $this->email_responses,
		);

		if ( $this->id ) {
			$data['id'] = $this->id;
		}

		return $data;
	}

	/**
	 * Transforms the NPS Survey to an array matching NPS block attributes.
	 *
	 * @since 1.5.1
	 *
	 * @return array
	 */
	public function to_block_attributes() {
		return array(
			'surveyId'            => $this->id,
			'title'               => $this->title,
			'feedbackPlaceholder' => $this->feedback_placeholder,
			'emailPlaceholder'    => $this->email_placeholder,
			'sourceLink'          => $this->source_link,
			'emailResponses'      => $this->email_responses,
		);
	}
}
