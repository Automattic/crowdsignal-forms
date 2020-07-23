<?php
/**
 * File containing the class \Crowdsignal_Forms\Autoloader.
 *
 * @package Crowdsignal_Forms
 * @since   0.9.0
 */

namespace Crowdsignal_Forms;

/**
 * Class Autoloader
 *
 * @package Crowdsignal_Forms
 */
class Autoloader {
	/**
	 * The instance.
	 *
	 * @var null|Autoloader
	 */
	private static $instance = null;

	/**
	 * The dir.
	 *
	 * @var string
	 */
	private $plugin_dir = '';

	/**
	 * Autoloader constructor.
	 */
	private function __construct() {
	}

	/**
	 * Sets our plugin dir.
	 *
	 * @param string $plugin_dir The dir.
	 * @return $this
	 */
	public function set_plugin_dir( $plugin_dir ) {
		$this->plugin_dir = $plugin_dir;
		return $this;
	}

	/**
	 * Get This autoloader instance.
	 *
	 * @return Autoloader
	 */
	public static function get_instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Add this autoloader to spl_autoload_register.
	 *
	 * @return $this;
	 */
	public function register() {
		spl_autoload_register( array( $this, 'autoload' ) );
		return $this;
	}

	/**
	 * Replace _ with dash.
	 *
	 * @param string $thing The string.
	 *
	 * @return string
	 */
	private static function dashify( $thing ) {
		return str_replace( '_', '-', $thing );
	}

	/**
	 * Do the autoload.
	 *
	 * @param string $class The class String.
	 */
	public function autoload( $class ) {

		$parts = explode( '\\', strtolower( $class ) );
		if ( empty( $parts ) ) {
			return;
		}

		if ( empty( $parts[0] ) ) {
			array_shift( $parts );
		}

		if ( 'crowdsignal_forms' !== $parts[0] ) {
			return;
		}
		array_shift( $parts );

		$class_name = array_pop( $parts );

		$namespaces = array_map( array( __CLASS__, 'dashify' ), $parts );
		$class_file = 'class-' . str_replace( '_', '-', $class_name ) . '.php';
		if ( ! empty( $namespaces ) ) {
			$class_file = implode( DIRECTORY_SEPARATOR, $namespaces ) . DIRECTORY_SEPARATOR . $class_file;
		}

		$full_path = $this->plugin_dir . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . $class_file;

		if ( file_exists( $full_path ) ) {
			include_once $full_path;
		}

	}
}
