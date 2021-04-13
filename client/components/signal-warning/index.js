/**
 * WordPress dependencies
 */
import { ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import EditorNotice from 'components/editor-notice';

const SignalWarning = () => {
	return (
		<EditorNotice icon="warning" status="warn" isDismissible={ false }>
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
		</EditorNotice>
	);
};

export default SignalWarning;
