/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const FooterBranding = ( { showLogo } ) => (
	<div className="wp-block-crowdsignal-forms-poll__footer-branding">
		<a
			className="wp-block-crowdsignal-forms-poll__footer-cs-link"
			href="https://crowdsignal.com"
			target="_blank"
			rel="noopener noreferrer"
		>
			{ __( 'Create your own poll with Crowdsignal' ) }
		</a>
		{ showLogo && (
			<img
				className="wp-block-crowdsignal-forms-poll__footer-branding-logo"
				src="https://app.crowdsignal.com/images/svg/cs-logo-dots.svg"
				alt="Crowdsignal sticker"
			/>
		) }
	</div>
);

export default FooterBranding;
