/**
 * External dependencies
 */
import React, { useState } from 'react';
import { isEmpty } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { TextControl, TextareaControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { updateFeedbackResponse } from 'data/feedback';

const FeedbackForm = ( { attributes, onSubmit } ) => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	const [ errors, setErrors ] = useState( {} );

	const handleSubmit = async ( event ) => {
		event.preventDefault();

		const validation = {
			feedback: isEmpty( feedback ),
			email:
				attributes.emailRequired &&
				( isEmpty( email ) || email.match( /^\s+@\s+$/ ) ),
		};
		setErrors( validation );

		if ( validation.feedback || validation.email ) {
			return;
		}

		updateFeedbackResponse( attributes.surveyId, {
			nonce: attributes.nonce,
			feedback,
			email,
		} );

		onSubmit();
	};

	const feedbackClasses = classnames( 'crowdsignal-forms-feedback__input', {
		'is-error': errors.feedback,
	} );

	const emailClasses = classnames( 'crowdsignal-forms-feedback__input', {
		'is-error': errors.email,
	} );

	return (
		<form onSubmit={ handleSubmit }>
			<h3 className="crowdsignal-forms-feedback__header">
				{ decodeEntities( attributes.header ) }
			</h3>

			<TextareaControl
				className={ feedbackClasses }
				rows={ 6 }
				placeholder={ attributes.feedbackPlaceholder }
				value={ feedback }
				onChange={ setFeedback }
			/>

			<TextControl
				className={ emailClasses }
				placeholder={ attributes.emailPlaceholder }
				value={ email }
				onChange={ setEmail }
			/>

			<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
				<button
					className="wp-block-button__link crowdsignal-forms-feedback__feedback-button"
					type="submit"
				>
					{ attributes.submitButtonLabel }
				</button>
			</div>
		</form>
	);
};

export default FeedbackForm;
