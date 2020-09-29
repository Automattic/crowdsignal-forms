/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { __ } from 'lib/i18n';
import withClientId from 'components/with-client-id';
import useNumberedTitle from 'components/use-numbered-title';
import Applause from 'components/applause';
import withPollBase from 'components/with-poll-base';
import Toolbar from './toolbar';
import SideBar from './sidebar';

const EditApplauseBlock = ( props ) => {
	const { attributes, setAttributes, pollDataFromApi } = props;

	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';

	useNumberedTitle(
		props.name,
		__( 'Untitled Applause' ),
		attributes,
		setAttributes
	);

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal Applause' ) }
		>
			<SideBar { ...props } viewResultsUrl={ viewResultsUrl } />
			<Toolbar { ...props } />
			<Applause { ...props } />
		</ConnectToCrowdsignal>
	);
};

export default compose( [ withPollBase ] )(
	withClientId( EditApplauseBlock, [ 'pollId', 'answerId' ] )
);
