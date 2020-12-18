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

const FooterBranding = ( { showLogo, editing } ) => (
	<div className="crowdsignal-forms-poll__footer-branding">
		<div>
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
			{ editing && (
				<Tooltip text={ promoteLink } position="top center">
					<span className="crowdsignal-forms__branding-promote">
						{ __( 'Hide', 'crowdsignal-forms' ) }
					</span>
				</Tooltip>
			) }
		</div>
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
