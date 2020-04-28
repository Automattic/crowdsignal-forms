/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button, Icon } from '@wordpress/components';
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const EditAnswer = ( {
	answer,
	index,
	isEnabled,
	isMultipleChoice,
	onChange,
	onDelete,
} ) => {
	const handleChangeText = ( text ) =>
		onChange( index, {
			...omit( answer, [ 'isPlaceholder' ] ),
			text,
		} );

	const handleDelete = () => onDelete( index );

	const inputClasses = classnames( 'wp-block-crowdsignal-forms-poll__check', {
		'is-checkbox': isMultipleChoice,
	} );

	return (
		<div className="wp-block-crowdsignal-forms-poll__answer">
			<div className={ inputClasses }></div>

			<RichText
				className="wp-block-crowdsignal-forms-poll__answer-label"
				placeholder={ __( 'Enter an answer' ) }
				onChange={ handleChangeText }
				value={ answer.text }
			/>

			{ isEnabled && ! answer.isPlaceholder && (
				<Button
					className="wp-block-crowdsignal-forms-poll__button"
					onClick={ handleDelete }
				>
					<Icon icon="trash" />
				</Button>
			) }
		</div>
	);
};

export default EditAnswer;
