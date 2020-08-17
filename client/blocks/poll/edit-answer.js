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

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';
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

	const classes = classnames( 'wp-block-crowdsignal-forms-poll__answer', {
		'is-multiple-choice': isMultipleChoice,
		'is-button': AnswerStyle.BUTTON === answerStyle,
	} );

	const renderRadioAnswers = () => (
		<>
			<span className="wp-block-crowdsignal-forms-poll__check" />

			<div className="wp-block-crowdsignal-forms-poll__answer-label-wrapper">
				{ ! disabled ? (
					<RichText
						className="wp-block-crowdsignal-forms-poll__answer-label"
						tagName="span"
						placeholder={ __( 'Enter an answer' ) }
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
					<span className="wp-block-crowdsignal-forms-poll__answer-label">
						{ answer.text
							? decodeEntities( answer.text )
							: __( 'Enter an answer' ) }
					</span>
				) }
			</div>
		</>
	);

	const renderButtonAnswers = () => (
		<div className="wp-block-button wp-block-crowdsignal-forms-poll__block-button">
			{ ! disabled ? (
				<RichText
					className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button"
					placeholder={ __( 'Enter an answer' ) }
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
				<div className="wp-block-button__link wp-block-crowdsignal-forms-poll__submit-button">
					{ answer.text
						? decodeEntities( answer.text )
						: __( 'Enter an answer' ) }
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
