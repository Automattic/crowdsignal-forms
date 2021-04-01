/**
 * External dependencies
 */
import React, { useState } from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { TextControl, TextareaControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getStyleVars } from 'blocks/feedback/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getAlignmentClassNames } from './util';

const Feedback = ( { attributes, fallbackStyles, renderStyleProbe } ) => {
	const [ active, setActive ] = useState( false );

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
				{ active && (
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
							value={ '' }
						/>

						<TextControl
							className="crowdsignal-forms-feedback__input"
							placeholder={ attributes.emailPlaceholder }
						/>

						<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
							<button
								className="wp-block-button__link crowdsignal-forms-nps__feedback-button"
								type="button"
							>
								{ attributes.submitButtonLabel }
							</button>
						</div>
					</div>
				) }

				<button
					className="crowdsignal-forms-feedback__trigger"
					onClick={ toggleDialog }
				/>
			</div>

			{ renderStyleProbe() }
		</>
	);
};

export default withFallbackStyles( Feedback );
