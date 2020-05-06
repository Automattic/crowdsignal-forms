/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { map } from 'lodash';
import { getStyleVars, getBlockCssClasses } from './util';

const SavePoll = ( { attributes, className } ) => {
	const inputClasses = classnames( 'wp-block-crowdsignal-forms-poll__check', {
		'is-checkbox': attributes.isMultipleChoice,
	} );
	const inputType = attributes.isMultipleChoice ? 'checkbox' : 'radio';

	return (
		<form
			className={ getBlockCssClasses( attributes, className ) }
			style={ getStyleVars( attributes ) }
		>
			<h2 className="wp-block-crowdsignal-forms-poll__question">
				{ attributes.question }
			</h2>

			{ attributes.note && <p>{ attributes.note }</p> }

			<div className="wp-block-crowdsignal-forms-poll__options">
				{ map( attributes.answers, ( answer ) => (
					<label
						htmlFor={ answer.answerId }
						className="wp-block-crowdsignal-forms-poll__answer"
					>
						<input
							id={ answer.answerId }
							className="wp-block-crowdsignal-forms-poll__input"
							type={ inputType }
						/>

						<div className={ inputClasses } />

						<div className="wp-block-crowdsignal-forms-poll__option-label">
							{ answer.text }
						</div>
					</label>
				) ) }
			</div>

			<div className="wp-block-crowdsignal-forms-poll__actions">
				<div className="wp-block-button">
					<button
						type="submit"
						className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button"
					>
						{ attributes.submitButtonLabel }
					</button>
				</div>
			</div>
		</form>
	);
};

export default SavePoll;
