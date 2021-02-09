/**
 * WordPress dependencies
 */
import { ExternalLink, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Icon from 'components/icon/warning-circle';

const SignalWarning = () => {
	return (
		<Notice
			className="crowdsignal-forms__signal-warning"
			status="info"
			isDismissible={ false }
		>
			<div className="crowdsignal-forms__signal-warning-icon">
				<Icon />
			</div>
			<div className="crowdsignal-forms__signal-warning-message">
				{ __(
					'Your free Crowdsignal account has exceeded ',
					'crowdsignal-forms'
				) }
				<ExternalLink href="https://crowdsignal.com/support/what-is-a-signal/">
					{ __( 'the limit of 2500 signals.', 'crowdsignal-forms' ) }
				</ExternalLink>
				<br />
				<strong>
					<ExternalLink href="https://crowdsignal.com/pricing">
						{ __( 'Please upgrade.', 'crowdsignal-forms' ) }
					</ExternalLink>
				</strong>
			</div>
		</Notice>
	);
};

export default SignalWarning;
