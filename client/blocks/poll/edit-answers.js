/**
 * External dependencies
 */
import React, { useRef } from 'react';
import { filter, last, map, slice, tap } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import EditAnswer from './edit-answer';
import { isAnswerEmpty } from './util';

const shiftAnswerFocus = ( wrapper, index ) =>
	tap(
		wrapper.querySelectorAll( '[role=textbox]' )[ index ],
		( answer ) => answer && answer.focus()
	);

const EditAnswers = ( { attributes, isSelected, setAttributes, disabled } ) => {
	const answersContainer = useRef();

	const handleChangeSubmitButtonLabel = ( submitButtonLabel ) =>
		setAttributes( { submitButtonLabel } );

	const handleChangeAnswer = ( index, answer ) =>
		setAttributes( {
			answers: tap( [ ...attributes.answers ], ( answers ) => {
				answers[ index ] = answer;
			} ),
		} );

	const handleDeleteAnswer = ( index ) => {
		shiftAnswerFocus( answersContainer.current, Math.max( index - 1, 0 ) );
		setAttributes( {
			answers: filter(
				attributes.answers,
				( answer ) =>
					attributes.answers.length <= 2 ||
					answer !== attributes.answers[ index ]
			),
		} );
	};

	const handleNewAnswer = ( insertAt ) => {
		if ( insertAt < attributes.answers.length ) {
			setAttributes( {
				answers: [
					...slice( attributes.answers, 0, insertAt ),
					{},
					...slice(
						attributes.answers,
						insertAt,
						attributes.answers.length
					),
				],
			} );
		}

		shiftAnswerFocus(
			answersContainer.current,
			Math.min( insertAt, attributes.answers.length )
		);
	};

	// Only show empty answers when the poll block is selected and not disabled
	const shouldShowAnswer = ( answer ) =>
		( isSelected && ! disabled ) || ! isAnswerEmpty( answer );

	// Rendering n + 1 answers vs a separate placeholder
	// prevents the text field from loosing focus when you start typing a new answer.
	const editableAnswers =
		isSelected && last( attributes.answers ).text
			? [ ...attributes.answers, {} ]
			: attributes.answers;

	return (
		<>
			<div
				ref={ answersContainer }
				className="wp-block-crowdsignal-forms-poll__options"
			>
				{ map(
					editableAnswers,
					( answer, index ) =>
						shouldShowAnswer( answer ) && (
							<EditAnswer
								key={ `poll-answer-${ index }` }
								answer={ answer }
								index={ index }
								isMultipleChoice={ attributes.isMultipleChoice }
								onChange={ handleChangeAnswer }
								onDelete={ handleDeleteAnswer }
								onNewAnswer={ handleNewAnswer }
								disabled={ disabled }
							/>
						)
				) }
			</div>

			<div className="wp-block-crowdsignal-forms-poll__actions">
				<div className="wp-block-button wp-block-crowdsignal-forms-poll__block-button">
					{ ! disabled ? (
						<RichText
							className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button"
							onChange={ handleChangeSubmitButtonLabel }
							value={ attributes.submitButtonLabel }
							allowedFormats={ [] }
						/>
					) : (
						<div className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button">
							{ attributes.submitButtonLabel }
						</div>
					) }
				</div>
			</div>
		</>
	);
};

export default EditAnswers;
