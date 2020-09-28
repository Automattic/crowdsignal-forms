/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Applause from 'components/applause';
import MutationObserver from 'lib/mutation-observer';

MutationObserver( 'data-crowdsignal-applause', ( attributes ) => (
	<Applause attributes={ attributes } />
) );
