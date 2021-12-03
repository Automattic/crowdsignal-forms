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
<div class='jp-settings-container'>
	<div class="dops-card dops-section-header is-compact">
		<div class="dops-section-header__label">
			<span class="dops-section-header__label-text"><?php esc_html_e( 'Getting Started', 'crowdsignal-forms' ); ?></span>
		</div>
	</div>

	<div class="dops-card dops-section-header is-compact">
		<div class="jp-form-settings-group" style='width: 100%'>
			<h3><?php echo wp_kses_post( __( 'First time using Crowdsignal?', 'crowdsignal-forms' ) ); ?></h3>
		<div class="crowdsignal-setup__middle">
			<p>
				<?php echo wp_kses_post( __( 'You can use Crowdsignal blocks right in your editor. Search for Crowdsignal in the blocks library and add the blocks to your page. Here is a short video to get you started:', 'crowdsignal-forms' ) ); ?>
			</p>

			<div class="crowdsignal-setup__video-container">
				<div class="crowdsignal-setup__video">
					<iframe src="https://videopress.com/v/jWTs90Dg" frameborder="0" allowfullscreen></iframe>
				</div>
			</div>


			<p>
				<?php
					echo wp_kses_post(
						sprintf(
							// translators: Argument is a link to Crowdsignal's contact page.
							__(
								'<a href="%1s" target="_blank">Any questions about Crowdsignal?</a>',
								'crowdsignal-forms'
							),
							'https://crowdsignal.com/contact/'
						)
					);
					?>
			</p>

			<p>
				<?php
					echo wp_kses_post(
						sprintf(
							// translators: Argument is a link to Crowdsignal's support page.
							__(
								'<a href="%1s" target="_blank">Read more about us here.</a>',
								'crowdsignal-forms'
							),
							'https://crowdsignal.com/support/'
						)
					);
					?>
			</p>
		</div>
	</div>
</div>
