/**
 * External dependencies
 */
import React from 'react';
import { render } from 'react-dom';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import Vote from 'components/vote';

const initVotes = () =>
	forEach(
		document.querySelectorAll( 'div[data-crowdsignal-vote]' ),
		( element ) => {
			// Try-catch potentially prevents other votes from breaking
			// when there's more then one on the page
			try {
				const attributes = JSON.parse(
					element.dataset.crowdsignalVote
				);

				element.removeAttribute( 'data-crowdsignal-vote' );

				const innerBlocks = [];

				forEach( element.children, ( childElement ) =>
					innerBlocks.push(
						JSON.parse( childElement.dataset.crowdsignalVoteItem )
					)
				);

				attributes.innerBlocks = innerBlocks;

				render( <Vote attributes={ attributes } />, element );
			} catch ( error ) {
				// eslint-disable-next-line
				console.error(
					'Crowdsignal Forms: Failed to parse vote data for: %s',
					element.dataset.crowdsignalVote
				);
			}
		}
	);

const voteObserver = () => {
	if ( window.isVoteObserverObserving ) {
		return;
	}

	const observer = new window.MutationObserver( initVotes );

	observer.observe( document.body, {
		attributes: true,
		attributeFilter: [ 'data-crowdsignal-vote' ],
		childList: true,
		subtree: true,
	} );

	window.isVoteObserverObserving = true;

	// Run the first pass on load
	initVotes();
};

if ( 'complete' === document.readyState ) {
	voteObserver();
} else {
	window.addEventListener( 'load', voteObserver );
}
