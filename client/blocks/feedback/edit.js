/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress depenencies
 */
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { withFallbackStyles } from 'components/with-fallback-styles';

const EditFeedbackBlock = ( props ) => {
	return (
		<ConnectToCrowdsignal>
			Hello! One feedback please.
			{ props.renderStyleProbe() }
		</ConnectToCrowdsignal>
	);
};

export default compose( [ withFallbackStyles ] )( EditFeedbackBlock );
