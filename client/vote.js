/**
 * External dependencies
 */
import React from 'react';
import { isEmpty, forEach } from 'lodash';

/**
 * Internal dependencies
 */
import Vote from 'components/vote';
import MutationObserver from 'lib/mutation-observer';

MutationObserver( 'data-crowdsignal-vote', ( attributes, element ) => {
	const innerBlocks = [];

	forEach( element.children, ( childElement ) => {
		if ( isEmpty( childElement.dataset.crowdsignalVoteItem ) ) {
			return;
		}

		innerBlocks.push(
			JSON.parse( childElement.dataset.crowdsignalVoteItem )
		);
	} );

	const voteAttributes = {
		...attributes,
		innerBlocks,
	};

	return <Vote attributes={ voteAttributes } />;
} );
