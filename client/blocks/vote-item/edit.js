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
import SideBar from './sidebar';
import withClientId from 'components/with-client-id';
import VoteItem from 'components/vote/vote-item';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { VoteStyles, getVoteStyles } from 'components/vote/styles';

const EditVoteItemBlock = ( props ) => {
	const { attributes, className, fallbackStyles, renderStyleProbe } = props;

	return (
		<>
			<SideBar { ...props } />

			<VoteItem
				attributes={ attributes }
				fallbackStyles={ fallbackStyles }
				className={ className }
				voteCount={ 0 }
				isInEditor={ true }
			/>

			{ renderStyleProbe() }
		</>
	);
};

export default compose( [ withFallbackStyles( VoteStyles, getVoteStyles ) ] )(
	withClientId( EditVoteItemBlock, 'answerId' )
);
