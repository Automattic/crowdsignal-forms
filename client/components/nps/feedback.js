/**
 * External dependencies
 */
import React from 'react';

const NpsFeedback = ( { attributes } ) => (
	<div className="crowdsignal-forms-nps__feedback">
		<textarea className="crowdsignal-forms-nps__feedback-text" rows={ 6 } />

		<button className="wp-block-button__link crowdsignal-forms-nps__feedback-button">
			{ attributes.submitButtonLabel }
		</button>
	</div>
);

export default NpsFeedback;
