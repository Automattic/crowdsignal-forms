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
		<EditorNotice
			icon="warning"
			status="warn"
			isDismissible={ false }
			actions={ [
				{
					label: __( 'Please upgrade', 'crowdsignal-forms' ),
					url: 'https://crowdsignal.com/pricing',
					className: 'is-secondary',
					noDefaultClasses: true,
				},
			] }
		>
			{ __( 'Your free Crowdsignal account has ', 'crowdsignal-forms' ) }
			<ExternalLink href="https://crowdsignal.com/support/what-is-a-signal/">
				{ __( 'exceeded 2500 signals.', 'crowdsignal-forms' ) }
			</ExternalLink>
		</EditorNotice>
	);
};

export default SignalWarning;
