/**
 * External dependencies
 */
import React from 'react';
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
import { getVoteStyleVars } from 'blocks/vote/util';
import { isPollClosed } from 'blocks/poll/util';
import useNumberedTitle from 'components/use-numbered-title';
import withPollBase from 'components/with-poll-base';

const EditVoteBlock = ( props ) => {
	const { attributes, setAttributes, className, pollDataFromApi } = props;

	useNumberedTitle(
		props.name,
		__( 'Untitled Vote' ),
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
						templateInsertUpdatesSelection={ false }
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

export default compose( [ withPollBase ] )(
	withClientId( EditVoteBlock, 'pollId' )
);
