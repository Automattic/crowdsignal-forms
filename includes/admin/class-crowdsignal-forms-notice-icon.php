<?php
/**
 * File containing the class Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Icon.
 *
 * @package Crowdsignal_Forms\Admin
 */

namespace Crowdsignal_Forms\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Crowdsignal_Forms_Admin_Notices class.
 *
 * @since 1.2.0
 */
class Crowdsignal_Forms_Notice_Icon {
	/**
	 * Returns the warning svg icon wrapped in a span tag
	 */
	public static function warning() {
		return '<span class="crowdsignal-notification-icon">' . self::svg_icon_warning() . '</span>';
	}

	/**
	 * Returns the success svg icon wrapped in a span tag
	 */
	public static function success() {
		return '<span class="crowdsignal-notification-icon">' . self::svg_icon_success() . '</span>';
	}

	/**
	 * Returns the warning svg icon markup
	 */
	private static function svg_icon_warning() {
		return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="1" y="2" width="22" height="19">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M23 21L12 2L1 21H23ZM11 18V16H13V18H11ZM11 14H13V10H11V14Z" fill="white"/>
		</mask>
		<g mask="url(#mask0)">
		<rect width="24" height="24" fill="#EB5757"/>
		</g>
		</svg>';
	}

	/**
	 * Returns the success svg icon markup
	 */
	private static function svg_icon_success() {
		return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<mask id="mask0" mask-type="alpha" maskUnits="userSpaceOnUse" x="2" y="2" width="20" height="20">
		<path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM10 14.17L16.59 7.58L18 9L10 17L6 13L7.41 11.59L10 14.17Z" fill="white"/>
		</mask>
		<g mask="url(#mask0)">
		<rect width="24" height="24" fill="#219653"/>
		</g>
		</svg>';
	}
}
