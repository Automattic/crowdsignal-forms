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
		echo wp_kses_post( __( 'Success! Your Crowdsignal account is successfully connected! You are ready!', 'crowdsignal-forms' ) );
		?>
	</p>
</div>
