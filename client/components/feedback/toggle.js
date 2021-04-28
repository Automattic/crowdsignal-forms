/**
 * External dependencies
 */
import React, { forwardRef } from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { RichText } from '@wordpress/block-editor';

const FeedbackToggle = ( { attributes, className, isOpen, onClick }, ref ) => {
	const classes = classnames(
		'wp-block-button__link',
		'crowdsignal-forms-feedback__feedback-button',
		'crowdsignal-forms-feedback__trigger',
		className,
		{
			'is-active': isOpen,
		}
	);

	return (
		<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
			<button ref={ ref } className={ classes } onClick={ onClick }>
				<RichText.Content
					value={
						isOpen
							? 'X ' + __( 'Close', 'crowdsignal-forms' )
							: attributes.triggerLabel
					}
				/>
			</button>
		</div>
	);
};

export default forwardRef( FeedbackToggle );
