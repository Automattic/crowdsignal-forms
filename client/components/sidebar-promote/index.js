/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, ExternalLink } from '@wordpress/components';

const SidebarPromote = ( { signalWarning } ) => {
	return (
		<div className="crowdsignal-forms__row">
			<Button
				href="https://crowdsignal.com/pricing"
				isSecondary
				target="_blank"
			>
				{ __( 'Upgrade', 'crowdsignal-forms' ) }
			</Button>
			{ signalWarning ? (
				<div className="crowdsignal-forms__sidebar-promote">
					<em>
						{ __(
							'Your free Crowdsignal account has ',
							'crowdsignal-forms'
						) }
						<strong>
							<ExternalLink href="https://crowdsignal.com/support/what-is-a-signal/">
								{ __(
									'reached the signals limit.',
									'crowdsignal-forms'
								) }
							</ExternalLink>
						</strong>
					</em>
				</div>
			) : (
				<div className="crowdsignal-forms__sidebar-promote">
					<em>
						{ __(
							'Hide Crowdsignal branding and get ',
							'crowdsignal-forms'
						) }
						<ExternalLink href="https://crowdsignal.com/support/what-is-a-signal/">
							{ __( 'unlimited signals', 'crowdsignal-forms' ) }
						</ExternalLink>
					</em>
				</div>
			) }
		</div>
	);
};

export default SidebarPromote;
