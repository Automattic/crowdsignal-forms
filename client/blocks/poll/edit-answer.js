/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { AnswerStyle } from './constants';

const EditAnswer = ( {
	answer,
	answerStyle,
	index,
	isMultipleChoice,
	onChange,
	onDelete,
	onNewAnswer,
	disabled,
} ) => {
	const handleChangeText = ( text ) =>
		onChange( index, {
			...answer,
			text,
		} );

	const handleDelete = () => onDelete( index );
	const handleSplit = () => onNewAnswer( index + 1 );

	const classes = classnames( 'crowdsignal-forms-poll__answer', {
		'is-multiple-choice': isMultipleChoice,
		'is-button': AnswerStyle.BUTTON === answerStyle,
	} );

	const renderRadioAnswers = () => (
		<>
			<div className="crowdsignal-forms-poll__check" />

			<div className="crowdsignal-forms-poll__answer-label-wrapper">
				{ ! disabled ? (
					<RichText
						className="crowdsignal-forms-poll__answer-label"
						placeholder={ __(
							'Enter an answer',
							'crowdsignal-forms'
						) }
						multiline={ false }
						preserveWhiteSpace={ false }
						onChange={ handleChangeText }
						onSplit={ handleSplit }
						onReplace={ noop }
						onRemove={ handleDelete }
						value={ answer.text }
						allowedFormats={ [] }
						withoutInteractiveFormatting
					/>
				) : (
					<div className="crowdsignal-forms-poll__answer-label">
						{ answer.text
							? decodeEntities( answer.text )
							: __( 'Enter an answer', 'crowdsignal-forms' ) }
					</div>
				) }
			</div>
		</>
	);

	const renderButtonAnswers = () => (
		<div className="wp-block-button crowdsignal-forms-poll__block-button">
			{ ! disabled ? (
				<RichText
					className="wp-block-button__link crowdsignal-forms-poll__submit-button"
					placeholder={ __( 'Enter an answer', 'crowdsignal-forms' ) }
					multiline={ false }
					preserveWhiteSpace={ false }
					onChange={ handleChangeText }
					onSplit={ handleSplit }
					onReplace={ noop }
					onRemove={ handleDelete }
					value={ answer.text }
					allowedFormats={ [] }
					withoutInteractiveFormatting
				/>
			) : (
				<div className="wp-block-button__link crowdsignal-forms-poll__submit-button">
					{ answer.text
						? decodeEntities( answer.text )
						: __( 'Enter an answer', 'crowdsignal-forms' ) }
				</div>
			) }
		</div>
	);

	return (
		<div className={ classes }>
			{ AnswerStyle.RADIO === answerStyle && renderRadioAnswers() }
			{ AnswerStyle.BUTTON === answerStyle && renderButtonAnswers() }
		</div>
	);
};

export default EditAnswer;
