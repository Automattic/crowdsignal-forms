/**
 * External dependencies
 */
import React from 'react';

/**
 * Wordpress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';

const FeedbackSubmit = ( { attributes } ) => (
	<h3 className="crowdsignal-forms-feedback__header" style={ { whiteSpace: 'pre-wrap' } }>
        { decodeEntities( attributes.submitText ).split( '<br>' ).join( '\n' ) }
	</h3>
);

export default FeedbackSubmit;
