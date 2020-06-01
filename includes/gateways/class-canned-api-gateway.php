<?php
/**
 * File containing the interface \Crowdsignal_Forms\Gateways\Api_Gateway_Interface.
 *
 * @package crowdsignal-forms/Gateways
 * @since 1.0.0
 */

namespace Crowdsignal_Forms\Gateways;

use Crowdsignal_Forms\Crowdsignal_Forms;
use Crowdsignal_Forms\Models\Poll;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Canned api gateway class
 **/
class Canned_Api_Gateway implements Api_Gateway_Interface {

	/**
	 * The path we will be saving canned data
	 *
	 * @var string
	 **/
	const CANNED_DATA_FILE_PATH = 'tests/canned-data/polls.json';

	/**
	 * Did we load the file.
	 *
	 * @var bool
	 **/
	private $file_loaded = false;

	/**
	 * The polls array.
	 *
	 * @var array
	 **/
	private $polls = array();

	/**
	 * Get the poll with specified poll id from the api.
	 *
	 * @param int $poll_id The poll id.
	 * @since 1.0.0
	 *
	 * @return Poll|\WP_Error
	 */
	public function get_poll( $poll_id ) {
		$found = array_filter(
			$this->get_polls(),
			function ( $poll_entry ) use ( $poll_id ) {
				return $poll_entry['id'] === $poll_id;
			}
		);

		return ! empty( $found ) ? Poll::from_array( $found[0] ) : new \WP_Error( __( 'Poll not found', 'crowdsignal-forms' ) );
	}

	/**
	 * Call the api to create a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function create_poll( Poll $poll ) {
		return new \WP_Error( 'FIXME' );
	}

	/**
	 * Gets and lazy-loads the canned polls
	 *
	 * @return array
	 **/
	private function get_canned_polls() {
		if ( ! $this->file_loaded ) {
			$file_path = trailingslashit( Crowdsignal_Forms::instance()->get_plugin_dir() ) . self::CANNED_DATA_FILE_PATH;

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$contents    = file_exists( $file_path ) ? file_get_contents( $file_path ) : '[]';
			$data        = json_decode( $contents, true );
			$this->polls = array_merge( $this->polls, $data['polls'] );
		}

		return $this->polls;
	}

	/**
	 * Get polls
	 *
	 * @since 1.0.0
	 *
	 * @return array|\WP_Error
	 */
	public function get_polls() {
		return $this->get_canned_polls();
	}

	/**
	 * Call the api to update a poll with the specified data.
	 *
	 * @param Poll $poll The poll data.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function update_poll( Poll $poll ) {
		return new \WP_Error( 'FIXME' );
	}

	/**
	 * Call the api to trash a poll.
	 *
	 * @param int $id_to_trash The poll id to trash.
	 * @return Poll|\WP_Error
	 * @since 1.0.0
	 */
	public function trash_poll( $id_to_trash ) {
		return new \WP_Error( 'FIXME' );
	}
}
