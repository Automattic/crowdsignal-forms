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

const EditAnswer = ( {
	answer,
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
	} );

	return (
		<div className={ classes }>
			<span className="wp-block-crowdsignal-forms-poll__check" />

			{ ! disabled ? (
				<div className="wp-block-crowdsignal-forms-poll__answer-label-wrapper">
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
				</div>
			) : (
				<div className="wp-block-crowdsignal-forms-poll__answer-label-wrapper">
					<span className="wp-block-crowdsignal-forms-poll__answer-label">
						{ answer.text
							? decodeEntities( answer.text )
							: __( 'Enter an answer' ) }
					</span>
				</div>
			) }
		</div>
	);
};

export default EditAnswer;
