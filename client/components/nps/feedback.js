/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { updateNpsResponse } from 'data/nps';
import FooterBranding from 'components/footer-branding';

const NpsFeedback = ( { attributes, onFailure, onSubmit, responseMeta } ) => {
	const [ feedback, setFeedback ] = useState( '' );
	const [ submitting, setSubmitting ] = useState( false );

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
		<div className="crowdsignal-forms-nps__feedback">
			<TextareaControl
				className="crowdsignal-forms-nps__feedback-text"
				disabled={ submitting }
				rows={ 6 }
				placeholder={ attributes.feedbackPlaceholder }
				onChange={ setFeedback }
				value={ feedback }
			/>

			<button
				className="wp-block-button__link crowdsignal-forms-nps__feedback-button"
				disabled={ submitting }
				onClick={ handleSubmit }
				type="button"
			>
				{ attributes.submitButtonLabel }
			</button>
			{ ! attributes.hideBranding && (
				<FooterBranding
					message={ __(
						'Collect your own feedback with Crowdsignal',
						'crowdsignal-forms'
					) }
				/>
			) }
		</div>
	);
};

export default NpsFeedback;
