/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const FooterBranding = ( { showLogo } ) => (
	<div className="crowdsignal-forms-poll__footer-branding">
		<a
			className="crowdsignal-forms-poll__footer-cs-link"
			href="https://crowdsignal.com?ref=cs-forms-poll"
			target="_blank"
			rel="noopener noreferrer"
		>
			{ __(
				'Create your own poll with Crowdsignal',
				'crowdsignal-forms'
			) }
		</a>
		{ showLogo && (
			<img
				className="crowdsignal-forms-poll__footer-branding-logo"
				src="https://app.crowdsignal.com/images/svg/cs-logo-dots.svg"
				alt="Crowdsignal sticker"
			/>
		) }
	</div>
);

export default FooterBranding;
