<?php
/**
 * File containing the view used in the settings page.
 *
 * @package Crowdsignal_Forms\Admin
 */

?>
<div class='jp-settings-container'>
	<div class="dops-card dops-section-header is-compact">
		<div class="dops-section-header__label">
			<span class="dops-section-header__label-text"><?php esc_html_e( 'API Key', 'crowdsignal-forms' ); ?></span>
		</div>
	</div>

	<div class="dops-card dops-section-header is-compact">
		<div class="jp-form-settings-group">
			<p>
			<?php
			printf(
				/* translators: Placeholder is the text "Crowdsignal". */
				esc_html__( 'You need to connect this plugin with a %s account to collect responses and data.', 'crowdsignal-forms' ),
				'<a href="https://crowdsignal.com/">Crowdsignal</a>'
			);
			?>
			</p>
			<?php if ( ! $api_key ) { ?>
				<p><?php esc_html_e( 'If you have a Crowdsignal account, click the "Get API Key" button to connect. This will open a new window.', 'crowdsignal-forms' ); ?>
				<form id="cs-connect-form" class="crowdsignal-options" method="post" action="https://app.crowdsignal.com/get-api-key/" target="CSCONNECT">
				<input type="hidden" name="get_api_key" value="<?php echo esc_attr( get_option( 'crowdsignal_api_key_secret' ) ); ?>" />
				<input type="hidden" name="ref" value="<?php echo esc_attr( admin_url( 'options-general.php?page=crowdsignal-settings' ) ); ?>" />
				<input type="submit" value="<?php esc_html_e( 'Get API Key', 'crowdsignal-forms' ); ?>" class="dops-button is-primary" />
				</form></p>
			<?php } ?>
			<p><?php esc_html_e( 'If you know your API key you can paste it in to the box below.', 'crowdsignal-forms' ); ?>

			<form class="crowdsignal-options" method="post" action="<?php echo esc_url( admin_url( 'options-general.php?page=crowdsignal-settings' ) ); ?>">
			<?php
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Used for basic flow.
			if ( ! empty( $_GET['settings-updated'] ) ) {
				echo '<div class="updated fade crowdsignal-updated"><p>' . esc_html__( 'Settings successfully saved', 'crowdsignal-forms' ) . '</p></div>';
			}

			?>
			<div id="settings-general" class="settings_panel">
				<table class="form-table settings parent-settings">
					<tr valign="top" class="">
						<th scope="row"><label for="setting-crowdsignal_api_key"><?php esc_html_e( 'Enter Crowdsignal API Key', 'crowdsignal-forms' ); ?></a></th>
						<td><input
							<?php echo $api_key ? 'readonly' : ''; ?>
							id="setting-crowdsignal_api_key"
							class="regular-text"
							type="text"
							name="crowdsignal_api_key"
							value="<?php echo esc_attr( $api_key ); ?>"
							/>
						</td>
					</tr>
				</table>
			</div>

			<div class="crowdsignal-settings__submit">
			<?php
			if ( $api_key ) {
				wp_nonce_field( 'disconnect-api-key' );
				?>
				<input type="hidden" name="action" value="disconnect" />
				<input type="submit" class="button-primary" value="<?php esc_attr_e( 'Disconnect', 'crowdsignal-forms' ); ?>" />
				<?php
			} else {
				wp_nonce_field( 'add-api-key' );
				?>
				<input type="hidden" name="action" value="update" />
				<input type="submit" class="button-primary" value="<?php esc_attr_e( 'Connect', 'crowdsignal-forms' ); ?>" />
				<?php
			}
			?>
			</div>
		</form></p>
	</div>
</div>

<script>
let CSCONNECT = null;
const showConnect = ( title ) => {
	// window size, match standard iPhone screen size
	const widthRatio = 1/2;
	const heightRatio = 3/4;

	// Fixes dual-screen position
	const dualScreenLeft = window.screenLeft !==  undefined
		? window.screenLeft // Most browsers
		: window.screenX; // Firefox
	const dualScreenTop = window.screenTop !==  undefined
		? window.screenTop // Most browsers
		: window.screenY; // Firefox

	const width = window.innerWidth
		? window.innerWidth
		: document.documentElement.clientWidth
			? document.documentElement.clientWidth
			: screen.width;
	const height = window.innerHeight
		? window.innerHeight
		: document.documentElement.clientHeight
			? document.documentElement.clientHeight
			: screen.height;

	const popupWidth = width * widthRatio;
	const popupHeight = height * heightRatio;

	const left = ( (width / 2 ) - ( popupWidth / 2 ) ) + dualScreenLeft;
	const top = ( (height / 2 ) - ( popupHeight / 2 ) ) + dualScreenTop;

	CSCONNECT = window.open( 'about:blank', title,
		`
		location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no,
		width=${ parseInt( popupWidth, 10 ) },
		height=${ parseInt( popupHeight, 10 )  },
		top=${ parseInt( top, 10 ) },
		left=${ parseInt( left, 10 ) }
		`
	)

	if ( window.focus ) CSCONNECT.focus();
}
( function( form ) {
	form.onsubmit = function() {
		showConnect( 'CSCONNECT' );
	}
} )( document.getElementById( 'cs-connect-form' ) );
</script>
