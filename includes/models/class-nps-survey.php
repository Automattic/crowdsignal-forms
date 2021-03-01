<?php
/**
 * File containing the model \Crowdsignal_Forms\Models\Nps_Survey.
 *
 * @package crowdsignal-forms/Models
 * @since 1.4.0
 */

namespace Crowdsignal_Forms\Models;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Nps_Survey
 */
class Nps_Survey {

	/**
	 * Survey Id.
	 *
	 * @since 1.4.0
	 * @var int
	 */
	private $id = 0;

	/**
	 * Title.
	 *
	 * @since 1.4.0
	 * @var string
	 */
	private $title = '';

	/**
	 * Rating question.
	 *
	 * @since 1.4.0
	 * @var string
	 */
	private $rating_question = '';

	/**
	 * Feedback question.
	 *
	 * @since 1.4.0
	 * @var string
	 */
	private $feedback_question = '';

	/**
	 * Permalink URL where the NPS is published.
	 *
	 * @since 1.4.3
	 * @var string
	 */
	private $source_link = '';

	/**
	 * Creates a new Nps_Survey object from an array of params.
	 *
	 * @param  array $data An array containing the survey data.
	 * @return Nps_Survey
	 */
	public static function from_array( $data ) {
		return new Nps_Survey(
			$data['id'],
			$data['title'],
			$data['rating_text'],
			$data['feedback_text'],
			! empty( $data['source_link'] ) ? $data['source_link'] : ''
		);
	}

	/**
	 * Creates a new Nps_Survey object from an array of NPS block attributes.
	 *
	 * @param  array $attributes An array containing the block attributes.
	 * @return Nps_Survey
	 */
	public static function from_block_attributes( $attributes ) {
		return new Nps_Survey(
			$attributes['surveyId'],
			$attributes['title'],
			$attributes['ratingQuestion'],
			$attributes['feedbackQuestion'],
			! empty( $attributes['sourceLink'] ) ? $attributes['sourceLink'] : ''
		);
	}


	/**
	 * NPS Survey constructor.
	 *
	 * @since 1.4.0
	 *
	 * @param int    $id                Survey ID.
	 * @param string $title             Survey title.
	 * @param string $rating_question   Rating question.
	 * @param string $feedback_question Feedback question.
	 * @param string $source_link       Blog post/page permalink.
	 */
	public function __construct( $id, $title, $rating_question, $feedback_question, $source_link = '' ) {
		$this->id                = $id;
		$this->title             = $title;
		$this->rating_question   = $rating_question;
		$this->feedback_question = $feedback_question;
		$this->source_link       = $source_link;
	}

	/**
	 * Returns the survey ID.
	 *
	 * @since 1.4.0
	 *
	 * @return int
	 */
	public function get_id() {
		return $this->id;
	}

	/**
	 * Transform the NPS survey to an array for the API.
	 *
	 * @since 1.4.0
	 *
	 * @return array
	 */
	public function to_array() {
		$data = array(
			'title'         => $this->title,
			'rating_text'   => $this->rating_question,
			'feedback_text' => $this->feedback_question,
			'source_link'   => $this->source_link,
		);

		if ( $this->id ) {
			$data['id'] = $this->id;
		}

		return $data;
	}

	/**
	 * Transforms the NPS Survey to an array matching NPS block attributes.
	 *
	 * @since 1.4.0
	 *
	 * @return array
	 */
	public function to_block_attributes() {
		return array(
			'surveyId'         => $this->id,
			'title'            => $this->title,
			'ratingQuestion'   => $this->rating_question,
			'feedbackQuestion' => $this->feedback_question,
			'sourceLink'       => $this->source_link,
		);
	}
}
