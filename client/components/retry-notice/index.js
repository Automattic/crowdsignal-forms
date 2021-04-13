/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import EditorNotice from 'components/editor-notice';

const RetryNotice = ( { retryHandler } ) => {
	return (
		<EditorNotice
			status="error"
			icon="warning"
			isDismissible={ false }
			actions={ [
				{
					className: 'is-destructive',
					label: __( 'Retry', 'crowdsignal-forms' ),
					onClick: retryHandler,
				},
			] }
		>
			{ __(
				`Unfortunately, the block couldn't be saved to Crowdsignal.com.`,
				'crowdsignal-forms'
			) }
		</EditorNotice>
	);
};

export default RetryNotice;
