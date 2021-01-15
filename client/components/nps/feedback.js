/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import { updateNpsResponse } from 'data/nps';

const NpsFeedback = ( { attributes, onFailure, onSubmit, responseMeta } ) => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ submitting, setSubmitting ] = useState( false );

	const handleFeedbackChange = ( event ) => setFeedback( event.target.value );

	const handleSubmit = async () => {
		setSubmitting( true );

		try {
			await updateNpsResponse( attributes.surveyId, {
				nonce: attributes.nonce,
				feedback,
				...responseMeta,
			} );

			onSubmit();
		} catch ( error ) {
			onFailure();
		}
	};

	return (
		<form className="crowdsignal-forms-nps__feedback">
			<textarea
				className="crowdsignal-forms-nps__feedback-text"
				disabled={ submitting }
				rows={ 6 }
				onChange={ handleFeedbackChange }
			/>

			<button
				className="wp-block-button__link crowdsignal-forms-nps__feedback-button"
				disabled={ submitting }
				onClick={ handleSubmit }
				type="button"
			>
				{ attributes.submitButtonLabel }
			</button>
		</form>
	);
};

export default NpsFeedback;
