/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import SideBar from './sidebar';
import ToolBar from './toolbar';
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { __ } from 'lib/i18n';
import withClientId from 'components/with-client-id';
import {
	startSubscriptions,
	startPolling,
	withPollDataSelect,
	withPollDataDispatch,
} from 'blocks/poll/subscriptions';
import { getVoteStyleVars } from 'blocks/vote/util';
import usePollDuplicateCleaner from 'components/use-poll-duplicate-cleaner';

startSubscriptions();

const isP2tenberg = () => 'p2tenberg' in window;

const EditVoteBlock = ( props ) => {
	const {
		attributes,
		setAttributes,
		className,
		pollDataFromApi,
		addPollClientId,
		removePollClientId,
	} = props;

	useEffect( () => {
		if ( isP2tenberg() ) {
			startPolling();
		}

		if ( attributes.pollId ) {
			addPollClientId( attributes.pollId );
		}

		return () => {
			if ( attributes.pollId ) {
				removePollClientId( attributes.pollId );
			}
		};
	}, [] );

	usePollDuplicateCleaner(
		props.clientId,
		attributes.pollId,
		attributes.answers,
		setAttributes
	);

	const viewResultsUrl = pollDataFromApi
		? pollDataFromApi.viewResultsUrl
		: '';

	const classes = classNames(
		className,
		'crowdsignal-forms-vote',
		`size-${ attributes.size }`,
		{
			'no-results': attributes.hideResults,
		}
	);

	const voteItemStyleVars = getVoteStyleVars( attributes );

	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal Vote' ) }
		>
			<SideBar { ...props } viewResultsUrl={ viewResultsUrl } />
			<ToolBar { ...props } />

			<div className={ classes } style={ voteItemStyleVars }>
				<div className="crowdsignal-forms-vote__items">
					<InnerBlocks
						template={ [
							[ 'crowdsignal-forms/vote-item', { type: 'up' } ],
							[ 'crowdsignal-forms/vote-item', { type: 'down' } ],
						] }
						templateLock="insert"
						allowedBlocks={ [ 'crowdsignal-forms/vote-item' ] }
						orientation="horizontal"
						__experimentalMoverDirection="horizontal" // required for pre WP 5.5, post 5.5 only requires `orientation` to be set
					/>
				</div>
			</div>
		</ConnectToCrowdsignal>
	);
};

export default compose( [ withPollDataSelect(), withPollDataDispatch() ] )(
	withClientId( EditVoteBlock, 'pollId' )
);
