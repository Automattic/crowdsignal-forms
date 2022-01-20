<?php
/**
 * File containing the view for step 3 of the setup wizard.
 *
 * @package Crowdsignal_Forms\Admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<br />
<div class='cs-settings-container'>
	<div class="cs-card cs-section-header is-compact">
		<div class="cs-section-header__label">
			<span class="cs-section-header__label-text"><?php esc_html_e( 'Manage your Crowdsignal projects inside WordPress', 'crowdsignal-forms' ); ?></span>
		</div>
	</div>

	<div class="cs-card cs-section-header is-compact">
		<div class="cs-form-settings-group" style='width: 100%'>
			<h2><?php echo wp_kses_post( __( 'The Crowdsignal Dashboard plugin', 'crowdsignal-forms' ) ); ?></h2>
			<div class="crowdsignal-setup__middle">
				<p>
				<?php
				printf(
					/* translators: Placeholder is the text "second plugin". */
					esc_html__( 'We have a %s for you that allows you to manage all your Crowdsignal projects right in WP-Admin. Get an overview of all your active projects and get easy access to your results pages.', 'crowdsignal-forms' ),
					sprintf(
						'<a href="https://wordpress.org/plugins/polldaddy/">%s</a>',
						esc_html__( 'second plugin', 'crowdsignal-forms' )
					)
				);
				?>
				</p>

				<a href="<?php echo esc_url( admin_url( 'plugin-install.php?s=crowdsignal+polls+ratings&tab=search&type=term' ) ); ?>"><img id='crowdsignal__teaser_img' src='<?php echo esc_url( plugins_url( 'crowdsignal-forms/images/cs_dashboard_teaser.png' ) ); ?>' /></a>
				<p>
					<?php
						echo wp_kses_post(
							sprintf(
								// translators: Argument is a link to Crowdsignal's contact page.
								__(
									'Do you want to know more about Crowdsignal? <a href="%1s" target="_blank">Learn more</a>.',
									'crowdsignal-forms'
								),
								'https://crowdsignal.com/support/'
							)
						);
						?>
				</p>
				<p>
				<?php
				printf(
					/* translators: Placeholder is the text "website plugins page". */
					esc_html__( 'Install the Crowdsignal Dashboard plugin directly from your %s.', 'crowdsignal-forms' ),
					sprintf(
						'<a href="' . esc_url( admin_url( 'plugin-install.php?s=crowdsignal+polls+ratings&tab=search&type=term' ) ) . '">%s</a>',
						esc_html__( 'website plugins page', 'crowdsignal-forms' )
					)
				);
				?>
				</p>
			</div>
		</div>
	</div>
</div>
