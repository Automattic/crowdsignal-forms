/**
 * External dependencies
 */
import React, { useState } from 'react';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { updateFeedbackResponse } from 'data/feedback';

const FeedbackForm = ( { attributes, onSubmit } ) => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ email, setEmail ] = useState( '' );

	const handleSubmit = async () => {
		if ( isEmpty( feedback ) ) {
			return;
		}

		updateFeedbackResponse( attributes.surveyId, {
			nonce: attributes.nonce,
			feedback,
			email,
		} );

		onSubmit();
	};

	return (
		<>
			<RichText.Content
				tagName="h3"
				className="crowdsignal-forms-feedback__header"
				value={ attributes.header }
			/>

			<TextareaControl
				className="crowdsignal-forms-feedback__input"
				rows={ 6 }
				placeholder={ attributes.feedbackPlaceholder }
				value={ feedback }
				onChange={ setFeedback }
			/>

			<TextControl
				className="crowdsignal-forms-feedback__input"
				placeholder={ attributes.emailPlaceholder }
				value={ email }
				onChange={ setEmail }
			/>

			<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
				<button
					className="wp-block-button__link crowdsignal-forms-feedback__feedback-button"
					type="button"
					onClick={ handleSubmit }
				>
					{ attributes.submitButtonLabel }
				</button>
			</div>
		</>
	);
};

export default FeedbackForm;
