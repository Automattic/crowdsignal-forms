/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const FooterBranding = ( {
	showLogo,
	children,
	message,
	trackRef = 'cs-forms-poll',
} ) => (
	<div className="crowdsignal-forms__footer-branding">
		<a
			className="crowdsignal-forms__footer-cs-link"
			href={ 'https://crowdsignal.com?ref=' + trackRef }
			target="_blank"
			rel="noopener noreferrer"
		>
			{ message ||
				__(
					'Create your own poll with Crowdsignal',
					'crowdsignal-forms'
				) }
		</a>

		{ children }

		{ showLogo && (
			<a
				href={ 'https://crowdsignal.com?ref=' + trackRef }
				target="_blank"
				rel="noopener noreferrer"
			>
				<img
					className="crowdsignal-forms__footer-branding-logo"
					src="https://app.crowdsignal.com/images/svg/cs-logo-dots.svg"
					alt="Crowdsignal sticker"
				/>
			</a>
		) }
	</div>
);

export default FooterBranding;
