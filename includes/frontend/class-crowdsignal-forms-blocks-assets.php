<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   1.0.0
 */

namespace Crowdsignal_Forms\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' frontend assets.
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   1.0.0
 */
class Crowdsignal_Forms_Blocks_Assets {

	const EDITOR = 'crowdsignal-forms-editor';
	const POLL   = 'crowdsignal-forms-poll';

	/**
	 * Returns an array containing js and css targets
	 * for each group along with the generate config file.
	 *
	 * @return array
	 */
	private static function assets() {
		return array(
			self::EDITOR => array(
				'config' => '/build/editor.asset.php',
				'script' => '/build/editor.js',
				'style'  => '/build/editor.css',
			),
			self::POLL   => array(
				'config' => '/build/poll.asset.php',
				'script' => '/build/poll.js',
				'style'  => '/build/poll.css',
			),
		);
	}

	/**
	 * Registers Crowdsignal Forms' frontend assets
	 */
	public function register() {
		foreach ( self::assets() as $id => $paths ) {
			$this->register_asset_group( $id, $paths );
		}
	}

	/**
	 * Registers an asset group.
	 * If the $paths['script'] or $paths['style'] is left undefined it'll be omitted.
	 *
	 * @param string $id    Asset group id.
	 * @param array  $paths Asset file paths.
	 */
	private function register_asset_group( $id, $paths ) {
		// phpcs:ignore
		$config = include( $this->include_path( $paths['config'] ) );

		if ( isset( $paths['script'] ) ) {
			wp_register_script(
				$id,
				$this->url_path( $paths['script'] ),
				array_merge( array( 'wp-url' ), $config['dependencies'] ), // fix for apiFetch dependency in some environments.
				$config['version'],
				true
			);
		}

		if ( isset( $paths['style'] ) ) {
			wp_register_style(
				$id,
				$this->url_path( $paths['style'] ),
				array( 'wp-components' ),
				$config['version']
			);
		}
	}

	/**
	 * Returns the include path for the given plugin relative path.
	 *
	 * @param  string $path Path.
	 * @return string
	 */
	private function include_path( $path ) {
		return plugin_dir_path( CROWDSIGNAL_FORMS_PLUGIN_FILE ) . $path;
	}

	/**
	 * Returns the url for the given plugin relative path.
	 *
	 * @param  string $path Path.
	 * @return string
	 */
	private function url_path( $path ) {
		return plugins_url( $path, CROWDSIGNAL_FORMS_PLUGIN_FILE );
	}
}
