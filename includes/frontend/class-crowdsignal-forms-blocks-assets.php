<?php
/**
 * Contains Crowdsignal_Forms\Frontend\Crowdsignal_Forms_Blocks_Assets
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Crowdsignal Forms' frontend assets.
 *
 * @package Crowdsignal_Forms\Frontend
 * @since   0.9.0
 */
class Crowdsignal_Forms_Blocks_Assets {

	const APIFETCH = 'crowdsignal-forms-apifetch';
	const EDITOR   = 'crowdsignal-forms-editor';

	/**
	 * Returns an array containing js and css targets
	 * for each group along with the generate config file.
	 *
	 * @return array
	 */
	private static function assets() {
		$assets = array();

		foreach ( Crowdsignal_Forms_Blocks::blocks() as $block ) {
			$assets[ $block->asset_identifier() ] = $block->assets();
		}

		$assets[ self::APIFETCH ] = array(
			'config' => '/build/apifetch.asset.php',
			'script' => '/build/apifetch.js',
		);

		$assets[ self::EDITOR ] = array(
			'config' => '/build/editor.asset.php',
			'script' => '/build/editor.js',
			'style'  => '/build/editor.css',
		);

		return $assets;
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
				$config['dependencies'], // fix for apiFetch dependency in some environments.
				// array_merge( array( 'wp-url', 'wp-editor' ), $config['dependencies'] ), // fix for apiFetch dependency in some environments.
				$config['version'],
				true
			);
			if ( function_exists( 'wp_set_script_translations' ) ) {
				$path = apply_filters( 'crowdsignal_forms_translations_path', $this->include_path( '/languages' ) );
				wp_set_script_translations( $id, 'crowdsignal-forms', $path );
			}
		}

		if ( isset( $paths['style'] ) ) {
			wp_register_style(
				$id,
				$this->url_path( $paths['style'] ),
				array( 'wp-components' ),
				$config['version']
			);
		}

		// REST API Requires a nonce to be present on each request for logged in users.
		if (
			self::APIFETCH === $id &&
			is_user_logged_in()
		) {
			wp_add_inline_script(
				self::APIFETCH,
				sprintf( "_crowdsignalFormsWpNonce='%s';", wp_create_nonce( 'wp_rest' ) ),
				'before'
			);
		}

		if ( self::APIFETCH === $id ) {
			wp_add_inline_script(
				self::APIFETCH,
				sprintf( "_crowdsignalFormsURL='%s';", site_url() ),
				'before'
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
		return untrailingslashit( plugin_dir_path( CROWDSIGNAL_FORMS_PLUGIN_FILE ) ) . $path;
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
