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

window.addEventListener( 'load', () =>
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
	)
);
