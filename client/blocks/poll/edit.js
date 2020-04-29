/**
 * External dependencies
 */
import React from 'react';
import { filter, map, tap } from 'lodash';
const { getComputedStyle } = window;

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { withFallbackStyles } from '@wordpress/components';

/**
 * Internal dependencies
 */
import EditAnswer from './edit-answer';
import { getEmptyAnswersCount, getNodeBackgroundColor } from './util';
import SideBar from './sidebar';
import { __ } from 'lib/i18n';

/**
 * Retrieves default theme colors as they are when the component is loaded
 */
const fallbackStyles = withFallbackStyles( ( node ) => {
	const textNode = node.querySelector(
		'.wp-block-crowdsignal-forms-poll [contenteditable="true"]'
	);
	const buttonNode = node.querySelector(
		'.wp-block-crowdsignal-forms-poll__actions [contenteditable="true"]'
	);

	return {
		fallbackBackgroundColor: ! textNode
			? undefined
			: getNodeBackgroundColor( textNode ),
		fallbackTextColor: ! textNode
			? undefined
			: getComputedStyle( textNode ).color,
		fallbackSubmitButtonBackgroundColor: ! buttonNode
			? undefined
			: getNodeBackgroundColor( buttonNode ),
		fallbackSubmitButtonTextColor: ! buttonNode
			? undefined
			: getComputedStyle( buttonNode ).color,
	};
} );

const EditPoll = ( props ) => {
	const { attributes, className, isSelected, setAttributes } = props;
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

	const pollStyle = {
		backgroundColor: attributes.backgroundColor,
		color: attributes.textColor,
	};

	const submitButtonStyle = {
		backgroundColor: attributes.submitButtonBackgroundColor,
		color: attributes.submitButtonTextColor,
	};

	return (
		<>
			<SideBar { ...props } />
			<div className={ className } style={ pollStyle }>
				<RichText
					tagName="h2"
					className="wp-block-crowdsignal-forms-poll__question"
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
						style={ submitButtonStyle }
						onChange={ handleChangeSubmitButtonLabel }
						value={ attributes.submitButtonLabel }
					/>
				</div>
			</div>
		</>
	);
};

export default fallbackStyles( EditPoll );
