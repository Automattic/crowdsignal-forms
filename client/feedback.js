/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Feedback from 'components/feedback';
import MutationObserver from 'lib/mutation-observer';

MutationObserver( 'data-crowdsignal-feedback', ( attributes ) => (
	<Feedback attributes={ attributes } />
) );
