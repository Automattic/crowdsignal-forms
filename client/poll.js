/**
 * External dependencies
 */
import React from 'react';
import { render } from 'react-dom';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import Poll from 'components/poll';

const initPolls = () =>
	forEach(
		document.querySelectorAll( 'div[data-crowdsignal-poll]' ),
		( element ) => {
			// Try-catch potentially prevents other polls from breaking
			// when there's more then one on the page
			try {
				const attributes = JSON.parse(
					element.dataset.crowdsignalPoll
				);

				element.removeAttribute( 'data-crowdsignal-poll' );

				render( <Poll attributes={ attributes } />, element );
			} catch ( error ) {
				// eslint-disable-next-line
				console.error(
					'Crowdsignal Forms: Failed to parse poll data for: %s',
					element.dataset.crowdsignalPoll
				);
			}
		}
	);

const pollObserver = () => {
	if ( window.isPollObserverObserving ) {
		return;
	}

	const observer = new window.MutationObserver( initPolls );

	observer.observe( document.body, {
		attributes: true,
		attributeFilter: [ 'data-crowdsignal-poll' ],
		childList: true,
		subtree: true,
	} );

	window.isPollObserverObserving = true;

	// Run the first pass on load
	initPolls();
};

if ( 'complete' === document.readyState ) {
	pollObserver();
} else {
	window.addEventListener( 'load', pollObserver );
}
