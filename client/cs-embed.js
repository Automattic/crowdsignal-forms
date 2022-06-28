/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CSEmbed from 'components/cs-embed';
import MutationObserver from 'lib/mutation-observer';

MutationObserver( 'data-crowdsignal-cs-embed', ( attributes ) => (
	<CSEmbed attributes={ attributes } />
) );
