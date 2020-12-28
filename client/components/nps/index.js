/**
 * External dependencies
 */
import React from 'react';

const Nps = ( { attributes } ) => {
	return (
		<div className="crowdsignal-forms-nps">
			<h3 className="crowdsignal-forms-nps__title">
				{ attributes.title }
			</h3>

			<p className="crowdsignal-forms-nps__question">
				{ attributes.ratingQuestion }
			</p>
			<p className="crowdsignal-forms-nps__question">
				{ attributes.feedbackQuestion }
			</p>
		</div>
	);
};

export default Nps;
