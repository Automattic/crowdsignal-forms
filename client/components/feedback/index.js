/**
 * External dependencies
 */
import React, { useState } from 'react';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import SignalIcon from 'components/icon/signal';
import { getStyleVars } from 'blocks/feedback/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getAlignmentClassNames } from './util';
import { updateFeedbackResponse } from 'data/feedback';
import { views } from 'blocks/feedback/constants';

const Feedback = ( { attributes, fallbackStyles, renderStyleProbe } ) => {
	const [ view, setView ] = useState( views.QUESTION );
	const [ active, setActive ] = useState( false );

	const [ feedback, setFeedback ] = useState( '' );
	const [ email, setEmail ] = useState( '' );

	const handleSubmit = async () => {
		if ( ! isEmpty( feedback ) ) {
			updateFeedbackResponse( attributes.surveyId, {
				nonce: attributes.nonce,
				feedback,
				email,
			} );
		}

		setView( views.SUBMIT );
	};

	const toggleDialog = () => setActive( ! active );

	const classes = classnames(
		'crowdsignal-forms-feedback',
		getAlignmentClassNames( attributes.x, attributes.y )
	);

	return (
		<>
			<div
				className={ classes }
				style={ getStyleVars( attributes, fallbackStyles ) }
			>
				{ active && view === views.QUESTION && (
					<div className="crowdsignal-forms-feedback__popover">
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
					</div>
				) }

				{ active && view === views.SUBMIT && (
					<div className="crowdsignal-forms-feedback__popover">
						<RichText.Content
							tagName="h3"
							className="crowdsignal-forms-feedback__header"
							value={ attributes.submitText }
						/>
					</div>
				) }

				<button
					className="crowdsignal-forms-feedback__trigger"
					onClick={ toggleDialog }
				>
					<SignalIcon />
				</button>
			</div>

			{ renderStyleProbe() }
		</>
	);
};

export default withFallbackStyles( Feedback );
