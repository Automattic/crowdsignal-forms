/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Poll from 'components/poll';
import MutationObserver from 'lib/mutation-observer';

MutationObserver( 'data-crowdsignal-poll', ( attributes ) => (
	<Poll attributes={ attributes } />
) );
