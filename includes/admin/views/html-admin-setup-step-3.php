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
<div class="crowdsignal-setup__main">
	<div class="crowdsignal-setup__content">
		<h3><?php esc_html_e( 'You’re ready to start using Crowdsignal!', 'crowdsignal-forms' ); ?></h3>

		<?php
			$crowdsignal_forms_post_url = admin_url( 'post-new.php' );
		?>


		<p>
			<?php
				echo wp_kses_post(
					sprintf(
						// translators: Argument is a link to create a new WordPress post.
						__(
							'You’ve successfully connected and can now add Crowdsignal blocks in the editor. <a href="%1s">Create a post</a> now to get started!',
							'crowdsignal-forms'
						),
						esc_attr( $crowdsignal_forms_post_url )
					)
				);
				?>
		</p>

		<p class="crowdsignal-setup__email-activation">
			<?php
				echo wp_kses_post(
					__( 'Note: If you just created a Crowdsignal account, please click the activation link that we sent to your inbox to enable recording of responses.', 'crowdsignal-forms' )
				);
				?>
		</p>

		<h4><?php echo wp_kses_post( __( 'First time using Crowdsignal?', 'crowdsignal-forms' ) ); ?></h4>

		<p>
			<?php
				echo wp_kses_post(
					sprintf(
						// translators: Argument is a link to Crowdsignal's support page.
						__(
							'<a href="%1s" target="_blank">Learn more at crowdsignal.com/support',
							'crowdsignal-forms'
						),
						'https://crowdsignal.com/support'
					)
				);
				?>
		</p>

	</div>
</div>
