/**
 * External dependencies
 */
import React, { forwardRef } from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import CloseIcon from 'components/icon/close-small';

const CloseButton = () => (
	<>
		<CloseIcon />
		{ __( 'Close', 'crowdsignal-forms' ) }
	</>
);

const FeedbackToggle = ( { attributes, className, isOpen, onClick }, ref ) => {
	const classes = classnames(
		'crowdsignal-forms-feedback__trigger',
		'wp-block-button__link',
		className,
		{
			'is-active': isOpen,
		}
	);

	return (
		<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
			<button ref={ ref } className={ classes } onClick={ onClick }>
				{ isOpen ? (
					<CloseButton />
				) : (
					<RichText.Content value={ attributes.triggerLabel } />
				) }
			</button>
		</div>
	);
};

export default forwardRef( FeedbackToggle );
