/**
 * External dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useAccountInfo } from 'data/hooks';

const ConnectToCrowdsignal = ( props ) => {
	const { blockIcon, blockName, children } = props;

	const accountInfo = useAccountInfo();
	const isConnected = accountInfo.data && accountInfo.data.id !== 0;
	const isAccountVerified = !! accountInfo.data.is_verified;

	const handleConnectClick = async () => {
		const initialConnectedState = isConnected;
		const newAccountInfo = await accountInfo.reloadAccountInfo();

		const isNowConnected = newAccountInfo.id !== 0;
		const isNowVerified = !! newAccountInfo.is_verified;

		if ( ! isNowConnected ) {
			window.open( '/wp-admin/admin.php?page=crowdsignal-forms-setup' );
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
