/**
 * External dependencies
 */
import React from 'react';
import { filter, map, tap } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import EditAnswer from './edit-answer';
import { getEmptyAnswersCount } from './util';

const EditPoll = ( { attributes, className, isSelected, setAttributes } ) => {
	const handleChangeQuestion = ( question ) => setAttributes( { question } );
	const handleChangeNote = ( note ) => setAttributes( { note } );
	const handleChangeSubmitButtonLabel = ( submitButtonLabel ) =>
		setAttributes( { submitButtonLabel } );

	const handleChangeAnswer = ( index, answer ) =>
		setAttributes( {
			answers: tap( [ ...attributes.answers ], ( answers ) => {
				answers[ index ] = answer;
			} ),
		} );

	const handleDeleteAnswer = ( index ) =>
		setAttributes( {
			answers: filter(
				attributes.answers,
				( answer ) => answer !== attributes.answers[ index ]
			),
		} );

	// Rendering n + 1 answers vs a separate placeholder
	// prevents the text field from loosing focus when you start typing a new answer.
	const editableAnswers =
		isSelected && getEmptyAnswersCount( attributes.answers ) === 0
			? [ ...attributes.answers, { isPlaceholder: true } ]
			: attributes.answers;

	return (
		<div className={ className }>
			<RichText
				tagName="h2"
				placeholder={ __( 'Enter your question' ) }
				onChange={ handleChangeQuestion }
				value={ attributes.question }
			/>
			<RichText
				tagName="p"
				placeholder={ __( 'Add a note (optional)' ) }
				onChange={ handleChangeNote }
				value={ attributes.note }
			/>

			<div className="wp-block-crowdsignal-forms-poll__options">
				{ map( editableAnswers, ( answer, index ) => (
					<EditAnswer
						key={ `poll-answer-${ index }` }
						answer={ answer }
						index={ index }
						isEnabled={ isSelected }
						isMultipleChoice={ attributes.isMultipleChoice }
						onChange={ handleChangeAnswer }
						onDelete={ handleDeleteAnswer }
					/>
				) ) }
			</div>

			<div className="wp-block-crowdsignal-forms-poll__actions">
				<RichText
					className="wp-block-button__link"
					onChange={ handleChangeSubmitButtonLabel }
					value={ attributes.submitButtonLabel }
				/>
			</div>
		</div>
	);
};

export default EditPoll;
