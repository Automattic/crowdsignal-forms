/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import Sidebar from './sidebar';

const EditNpsBlock = ( props ) => {
	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal NPS', 'crowdsignal-forms' ) }
		>
			<Sidebar { ...props } />
			One NPS please!
		</ConnectToCrowdsignal>
	);
};

export default EditNpsBlock;
