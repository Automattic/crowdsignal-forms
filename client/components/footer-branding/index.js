/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Tooltip } from '@wordpress/components';

const promoteLink = (
	<span>
		Hide Crowdsignal ads
		<br />
		and get unlimited
		<br />
		signals -{ ' ' }
		<a
			href="https://crowdsignal.com/pricing"
			target="_blank"
			rel="noopener noreferrer"
		>
			Upgrade
		</a>
	</span>
);

const FooterBranding = ( {
	showLogo,
	editing,
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

		{ editing && (
			<Tooltip text={ promoteLink } position="top center">
				<a
					href="https://crowdsignal.com/pricing"
					target="_blank"
					rel="noopener noreferrer"
					className="crowdsignal-forms__branding-promote"
				>
					{ __( 'Hide', 'crowdsignal-forms' ) }
				</a>
			</Tooltip>
		) }

		{ showLogo && (
			<img
				className="crowdsignal-forms__footer-branding-logo"
				src="https://app.crowdsignal.com/images/svg/cs-logo-dots.svg"
				alt="Crowdsignal sticker"
			/>
		) }
	</div>
);

export default FooterBranding;
