<?php
/**
 * File containing the view for step 2 of the setup wizard.
 *
 * @package Crowdsignal_Forms\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<script type='text/javascript'>
window.close();
if (window.opener && !window.opener.closed) {
	var querystring = window.opener.location.search;
	querystring += ( querystring ? '&' : '?' ) + 'msg=connected';
	window.opener.location.search = querystring;
}
</script>
<noscript><h3><?php esc_html_e( "You're ready to start using Crowdsignal!", 'crowdsignal-forms' ); ?></h3></noscript>
