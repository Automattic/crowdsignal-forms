<?php
/**
 * File containing the view for step 2 of the setup wizard.
 *
 * @package Crowdsignal_Forms\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;
$crowdsignal_forms_api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();

if ( $crowdsignal_forms_api_auth_provider->get_api_key() ) {
	$crowdsignal_forms_msg = 'connected';
} else {
	$crowdsignal_forms_msg = 'api-key-not-added';
}
?>
<script type='text/javascript'>
window.close();
if (window.opener && !window.opener.closed) {
	var querystring = window.opener.location.search;
	querystring += ( querystring ? '&' : '?' ) + 'msg=<?php echo esc_js( $crowdsignal_forms_msg ); ?>';
	window.opener.location.search = querystring;
}
</script>
<noscript><h3><?php esc_html_e( "You're ready to start using Crowdsignal!", 'crowdsignal-forms' ); ?></h3></noscript>
