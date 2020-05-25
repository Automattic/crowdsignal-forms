/**
 * External dependencies
 */
import React from 'react';
import { filter, map, tap } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';
import ClosedBanner from '../../components/poll/closed-banner';
import EditAnswer from './edit-answer';
import { getEmptyAnswersCount } from './util';

const EditPoll = ( props ) => {
	const {
		attributes,
		isSelected,
		setAttributes,
		isPollClosed,
		isPollHidden,
	} = props;

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
		<>
			<div className="wp-block-crowdsignal-forms-poll__content">
				<RichText
					tagName="h3"
					className="wp-block-crowdsignal-forms-poll__question"
					placeholder={ __( 'Enter your question' ) }
					onChange={ handleChangeQuestion }
					value={ attributes.question }
				/>
				<RichText
					tagName="p"
					className="wp-block-crowdsignal-forms-poll__note"
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
					<div className="wp-block-button wp-block-crowdsignal-forms-poll__block-button">
						<RichText
							className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button"
							onChange={ handleChangeSubmitButtonLabel }
							value={ attributes.submitButtonLabel }
						/>
					</div>
				</div>
			</div>
			{ isPollClosed && <ClosedBanner isPollHidden={ isPollHidden } /> }
		</>
	);
};

export default EditPoll;
