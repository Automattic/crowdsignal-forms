/** WordPress dependencies */
import { Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const PromotionalTooltip = () => {
	return (
		<Tooltip
			text={
				<span>
					{ __( 'Hide Crowdsignal ads', 'crowdsignal-forms' ) }
					<br />
					{ __( 'and get unlimited', 'crowdsignal-forms' ) }
					<br />
					{ __( 'signals', 'crowdsignal-forms' ) } -{ ' ' }
					<a
						href="https://crowdsignal.com/pricing"
						target="_blank"
						rel="noopener noreferrer"
					>
						{ __( 'Upgrade', 'crowdsignal-forms' ) }
					</a>
				</span>
			}
			position="top center"
		>
			<a
				href="https://crowdsignal.com/pricing"
				target="_blank"
				rel="noopener noreferrer"
				className="crowdsignal-forms__branding-promote"
			>
				{ __(
					'Hide',
					'crowdsignal-forms'
				) }
			</a>
		</Tooltip>
	);
}

export default PromotionalTooltip;
