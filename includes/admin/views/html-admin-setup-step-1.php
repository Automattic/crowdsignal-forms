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
<h3><?php esc_html_e( 'Getting Started with Crowdsignal Forms', 'crowdsignal-forms' ); ?></h3>

<p><?php esc_html_e( "Thanks for installing this plugin! Let's get your site ready to create polls.", 'crowdsignal-forms' ); ?></p>
<p><?php esc_html_e( 'This page will walk you through the process of connecting your site to your Crowdsignal account.', 'crowdsignal-forms' ); ?></p>

<div class="wrap crowdsignal-settings-wrap">
	<form class="crowdsignal-options" method="post" action="https://app.crowdsignal.com/get-api-key/">
	<input type="hidden" name="get_api_key" value="<?php echo esc_attr( get_option( 'crowdsignal_api_key_secret' ) ); ?>" />
	<input type="hidden" name="ref" value="<?php echo esc_attr( admin_url( 'index.php?page=crowdsignal-setup' ) ); ?>" />
	<p class="submit">
		<input type="submit" value="<?php esc_html_e( 'Connect', 'crowdsignal-forms' ); ?>" class="button button-primary" />
	</p>
	</form>
</div>
