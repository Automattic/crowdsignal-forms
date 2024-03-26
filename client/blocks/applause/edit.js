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
import { useSelect } from '@wordpress/data';

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
import { STORE_NAME } from 'state';

const EditApplauseBlock = ( props ) => {
	const { attributes, setAttributes, pollDataFromApi, context } = props;

	const {
		postId,
		queryId,
	} = context;

	// Prevent block from loading in FSE or a query loop because save handlers don't support those contexts.
	// - double == instead of triple === used because we need to test for both null and undefined
	if ( null == postId ) {
		return <ErrorBanner>{ __( 'Applause blocks cannot be used outside of a post or page. The Site Editor is not supported.', 'crowdsignal-forms' ) }</ErrorBanner>;
	} else if ( null != queryId ) {
		return <ErrorBanner>{ __( 'Applause blocks are not supported inside a query loop.', 'crowdsignal-forms' ) }</ErrorBanner>;
	}

	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';

	useNumberedTitle(
		props.name,
		__( 'Untitled Applause', 'crowdsignal-forms' ),
		attributes,
		setAttributes
	);

	const accountInfo = useSelect( ( select ) =>
		select( STORE_NAME ).getAccountInfo()
	);

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
