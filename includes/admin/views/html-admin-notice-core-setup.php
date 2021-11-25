<?php
/**
 * File containing the view for displaying the admin notice when user first activates crowdsignal.
 *
 * @package Crowdsignal_Forms\Admin
 */

use Crowdsignal_Forms\Admin\Crowdsignal_Forms_Admin_Notices;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="updated crowdsignal-message">
	<p>
		<?php
		echo wp_kses_post( __( 'You are nearly ready to start creating polls with <strong>Crowdsignal</strong>.', 'crowdsignal-forms' ) );
		?>
	</p>
	<p class="submit">
		<a href="<?php echo esc_url( admin_url( 'options-general.php?page=crowdsignal-settings#setup' ) ); ?>" class="button-primary"><?php esc_html_e( "Let's Get Started", 'crowdsignal-forms' ); ?></a>
		<a class="button-secondary skip" href="<?php echo esc_url( wp_nonce_url( add_query_arg( 'crowdsignal_forms_hide_notice', Crowdsignal_Forms_Admin_Notices::NOTICE_CORE_SETUP ), 'crowdsignal_forms_hide_notices_nonce', '_crowdsignal_forms_notice_nonce' ) ); ?>"><?php esc_html_e( 'Skip Setup', 'crowdsignal-forms' ); ?></a>
	</p>
</div>
