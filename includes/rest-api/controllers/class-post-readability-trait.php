<?php
/**
 * Contains the Post_Readability_Trait.
 *
 * @package Crowdsignal_Forms\Rest_Api
 */

namespace Crowdsignal_Forms\Rest_Api\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	die;
}

/**
 * Shared readability check for REST handlers that return cached
 * poll/survey configuration keyed to a WordPress post.
 */
trait Post_Readability_Trait {
	/**
	 * Whether the owning post may be read by the current user.
	 *
	 * Anonymous callers only pass for posts that are publicly viewable and
	 * not password protected. Password protection is a content-display gate
	 * that the `read_post` capability does not enforce, so it is checked
	 * explicitly; it is a no-op for posts without a password.
	 *
	 * @param int|null $post_id The owning post id.
	 * @return bool
	 */
	protected function is_owning_post_readable( $post_id ) {
		if ( null === $post_id ) {
			return false;
		}

		$post = get_post( $post_id );

		if ( ! $post || post_password_required( $post ) ) {
			return false;
		}

		return is_post_publicly_viewable( $post ) || current_user_can( 'read_post', $post->ID );
	}
}
