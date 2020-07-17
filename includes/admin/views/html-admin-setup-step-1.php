<?php
/**
 * File containing the view for step 1 of the setup wizard.
 *
 * @package Crowdsignal_Forms\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="crowdsignal-setup__main">
	<div class="crowdsignal-setup__content">
		<h3><?php esc_html_e( 'Welcome to Crowdsignal Forms', 'crowdsignal-forms' ); ?></h3>

		<div class="crowdsignal-setup__description">
			<p><?php echo wp_kses_post( 'To collect and manages respones you need to connect the plugin to <a href="https://crowdsignal.com">Crowdsignal</a>. <br />It will take less than a minute and it’s free.', 'crowdsignal-forms' ); ?></p>
		</div>

		<div class="wrap crowdsignal-settings-wrap">
			<form class="crowdsignal-options" method="post" action="https://app.crowdsignal.com/get-api-key/" target="CSCONNECT" onsubmit="CSCONNECT = window.open( 'about:blank', 'CSCONNECT', 'width=800,height=600' );">
			<input type="hidden" name="get_api_key" value="<?php echo esc_attr( get_option( 'crowdsignal_api_key_secret' ) ); ?>" />
			<input type="hidden" name="ref" value="<?php echo esc_attr( admin_url( 'admin.php?page=crowdsignal-forms-setup' ) ); ?>" />
			<input type="submit" value="<?php esc_html_e( 'Let’s get started', 'crowdsignal-forms' ); ?>" class="crowdsignal-setup__button" />
			</form>
		</div>
	</div>
</div>
