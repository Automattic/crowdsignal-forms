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

			<RichText
				className="wp-block-crowdsignal-forms-poll__answer-label"
				tagName="span"
				placeholder={ __( 'Enter an answer' ) }
				multiline={ false }
				preserveWhiteSpace={ false }
				keepPlaceholderOnFocus={ true }
				onChange={ handleChangeText }
				onSplit={ handleSplit }
				onReplace={ noop }
				onRemove={ handleDelete }
				value={ answer.text }
			/>
		</div>
	);
};

export default EditAnswer;
