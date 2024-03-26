/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import SideBar from './sidebar';
import ToolBar from './toolbar';
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import withClientId from 'components/with-client-id';
import { getVoteStyleVars } from 'blocks/vote/util';
import { isPollClosed } from 'blocks/poll/util';
import useNumberedTitle from 'components/use-numbered-title';
import withPollBase from 'components/with-poll-base';
import { STORE_NAME } from 'state';

const EditVoteBlock = ( props ) => {
	const { attributes, setAttributes, className, pollDataFromApi, context } = props;

	const {
		postId,
		queryId,
	} = context;

	// Prevent block from loading in FSE or a query loop because save handlers don't support those contexts.
	// - double == instead of triple === used because we need to test for both null and undefined
	if ( null == postId ) {
		return <ErrorBanner>{ __( 'Vote blocks cannot be used outside of a post or page. The Site Editor is not supported.', 'crowdsignal-forms' ) }</ErrorBanner>;
	} else if ( null != queryId ) {
		return <ErrorBanner>{ __( 'Vote blocks are not supported inside a query loop.', 'crowdsignal-forms' ) }</ErrorBanner>;
	}

	useNumberedTitle(
		props.name,
		__( 'Untitled Vote', 'crowdsignal-forms' ),
		attributes,
		setAttributes
	);

	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);

	const classes = classNames(
		className,
		'crowdsignal-forms-vote',
		`size-${ attributes.size }`,
		{
			'no-results': attributes.hideResults,
			'is-closed': isClosed,
		}
	);

	const voteItemStyleVars = getVoteStyleVars( attributes );

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
			blockName={ __( 'Crowdsignal Vote', 'crowdsignal-forms' ) }
		>
			<SideBar
				{ ...props }
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
				viewResultsUrl={ viewResultsUrl }
			/>
			<ToolBar { ...props } />

			<div className={ classes } style={ voteItemStyleVars }>
				<div className="crowdsignal-forms-vote__items">
					<InnerBlocks
						template={ [
							[ 'crowdsignal-forms/vote-item', { type: 'up' } ],
							[ 'crowdsignal-forms/vote-item', { type: 'down' } ],
						] }
						templateInsertUpdatesSelection={ false }
						allowedBlocks={ [ 'crowdsignal-forms/vote-item' ] }
						orientation="horizontal"
						__experimentalMoverDirection="horizontal" // required for pre WP 5.5, post 5.5 only requires `orientation` to be set
					/>
				</div>
			</div>
		</ConnectToCrowdsignal>
	);
};

export default compose( [ withPollBase, withClientId( [ 'pollId' ] ) ] )(
	EditVoteBlock
);
