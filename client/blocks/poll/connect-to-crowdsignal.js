/**
 * External dependencies
 */
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';
import PollIcon from 'components/icon/poll';
import { useIsCsConnected } from 'data/hooks';

const ConnectToCrowdsignal = ( props ) => {
	const { isConnected, checkIsConnected } = useIsCsConnected();

	const handleConnectClick = async () => {
		const isNowConnected = await checkIsConnected();

		if ( ! isNowConnected ) {
			window.open( '/wp-admin/admin.php?page=crowdsignal-forms-setup' );
		}
	};

	if ( isConnected ) {
		return props.children;
	}

	return (
		<div className="wp-block-crowdsignal-forms__connect-to-crowdsignal">
			<div className="wp-block-crowdsignal-forms__connect-to-crowdsignal-header">
				<PollIcon />
				<div className="wp-block-crowdsignal-forms__connect-to-crowdsignal-title">
					{ __( 'Crowdsignal Poll' ) }
				</div>
			</div>
			<div className="wp-block-crowdsignal-forms__connect-to-crowdsignal-body">
				{ __(
					'You need to connect to a Crowdsignal account for collecting and managing your results.'
				) }
			</div>
			<Button isPrimary onClick={ handleConnectClick }>
				{ __( 'Connect to Crowdsignal' ) }
			</Button>
		</div>
	);
};

export default ConnectToCrowdsignal;
