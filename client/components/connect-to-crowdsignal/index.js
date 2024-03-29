/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { trackFailedConnection } from 'lib/tracks';
import { STORE_NAME } from 'state';
import { requestAccountInfo } from '../../data/poll';

const ConnectToCrowdsignal = ( props ) => {
	const { blockIcon, blockName, children } = props;

	const accountInfo = useSelect( ( select ) =>
		select( STORE_NAME ).getAccountInfo()
	);
	const { updateAccountInfo } = useDispatch( STORE_NAME );
	const isConnected = accountInfo && accountInfo.id !== 0;
	const isAccountVerified = !! accountInfo.is_verified;
	const currentUser = useSelect( ( select ) =>
		select( 'core' ).getCurrentUser()
	);

	const handleConnectClick = async () => {
		const initialConnectedState = isConnected;
		const newAccountInfo = await requestAccountInfo();

		const isNowConnected = newAccountInfo.id !== 0;
		const isNowVerified = !! newAccountInfo.is_verified;
		updateAccountInfo( newAccountInfo );

		if ( ! isNowConnected ) {
			window.open(
				'/wp-admin/options-general.php?page=crowdsignal-forms-settings'
			);
		}

		// Don't pop open the email window if the connection state just changed.
		// Allow the new placeholder to be displayed first.
		if ( initialConnectedState && ! isNowVerified ) {
			window.open( 'https://wordpress.com/me/account' );
		}
	};

	if ( isConnected && isAccountVerified ) {
		return children;
	}

	const showConnectionMessage = ! isConnected;
	const showVerificationMessage = isConnected && ! isAccountVerified;

	trackFailedConnection(
		currentUser && currentUser.id ? currentUser.id : 0,
		blockName
	);

	return (
		<div className="crowdsignal-forms__connect-to-crowdsignal">
			<div className="crowdsignal-forms__connect-to-crowdsignal-header">
				{ blockIcon }
				<div className="crowdsignal-forms__connect-to-crowdsignal-title">
					{ blockName }
				</div>
			</div>
			<div className="crowdsignal-forms__connect-to-crowdsignal-body">
				{ showConnectionMessage &&
					__(
						'You need to connect to a Crowdsignal account to collect and manage your results.',
						'crowdsignal-forms'
					) }
				{ showVerificationMessage &&
					__(
						'Please verify your WordPress.com email address in order to publish your poll.',
						'crowdsignal-forms'
					) }
			</div>
			<Button isPrimary onClick={ handleConnectClick }>
				{ showConnectionMessage &&
					__( 'Connect to Crowdsignal', 'crowdsignal-forms' ) }
				{ showVerificationMessage &&
					__(
						'Verify or Change your Email Address',
						'crowdsignal-forms'
					) }
			</Button>
		</div>
	);
};

export default ConnectToCrowdsignal;
