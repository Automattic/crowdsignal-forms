/**
 * External dependencies
 */
import React from 'react';

/**
 * Wordpress dependencies
 */
import { RichText } from '@wordpress/block-editor';

const FeedbackSubmit = ( { attributes } ) => (
	<RichText.Content
		tagName="h3"
		className="crowdsignal-forms-feedback__header"
		value={ attributes.submitText }
	/>
);

export default FeedbackSubmit;
