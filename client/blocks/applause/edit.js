/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import withClientId from 'components/with-client-id';
import useNumberedTitle from 'components/use-numbered-title';
import Applause from 'components/applause';
import withPollBase from 'components/with-poll-base';
import Toolbar from './toolbar';
import SideBar from './sidebar';
import { useAccountInfo } from 'data/hooks';

const EditApplauseBlock = ( props ) => {
	const { attributes, setAttributes, pollDataFromApi } = props;

	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';

	useNumberedTitle(
		props.name,
		__( 'Untitled Applause', 'crowdsignal-forms' ),
		attributes,
		setAttributes
	);

	const accountInfo = get( useAccountInfo(), 'data', {} );

	const shouldPromote = get( accountInfo, [
		'signalCount',
		'shouldDisplay',
	] );
	const signalWarning =
		shouldPromote &&
		get( accountInfo, [ 'signalCount', 'count' ] ) >=
			get( accountInfo, [ 'signalCount', 'userLimit' ] );

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal Applause', 'crowdsignal-forms' ) }
		>
			<SideBar
				{ ...props }
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
				viewResultsUrl={ viewResultsUrl }
			/>
			<Toolbar { ...props } />
			<Applause { ...props } />
		</ConnectToCrowdsignal>
	);
};

export default compose( [
	withPollBase,
	withClientId( [ 'pollId', 'answerId' ] ),
] )( EditApplauseBlock );
