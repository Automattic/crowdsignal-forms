/**
 * External dependencies
 */
import React from 'react';

/**
 * Wordpress dependencies
 */
import { RawHTML } from '@wordpress/element';

const FeedbackSubmit = ( { attributes } ) => (
	<h3 className="crowdsignal-forms-feedback__header">
		<RawHTML>{ attributes.submitText }</RawHTML>
	</h3>
);

export default FeedbackSubmit;
