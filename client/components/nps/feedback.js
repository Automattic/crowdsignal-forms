/**
 * External dependencies
 */
import React, { useState } from 'react';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { updateNpsResponse } from 'data/nps';

const NpsFeedback = ( { attributes, onSubmit, responseMeta } ) => {
	const [ feedback, setFeedback ] = useState( '' );

	const handleSubmit = async () => {
		if ( responseMeta !== null && ! isEmpty( feedback ) ) {
			updateNpsResponse( attributes.surveyId, {
				nonce: attributes.nonce,
				feedback,
				...responseMeta,
			} );
		}

		onSubmit();
	};

	return (
		<div className="crowdsignal-forms-nps__feedback">
			<textarea
				className="crowdsignal-forms-nps__feedback-text"
				rows={ 6 }
				placeholder={ attributes.feedbackPlaceholder }
				onChange={ e => setFeedback( e.target.value ) }
				value={ feedback }
			></textarea>

			<div className="wp-block-button crowdsignal-forms-nps__feedback-button-wrapper">
				<button
					className="wp-block-button__link crowdsignal-forms-nps__feedback-button"
					onClick={ handleSubmit }
					type="button"
				>
					{ attributes.submitButtonLabel }
				</button>
			</div>
		</div>
	);
};

export default NpsFeedback;
