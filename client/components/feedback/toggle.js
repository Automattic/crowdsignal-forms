/**
 * External dependencies
 */
import React, { forwardRef } from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';

const FeedbackToggle = ( { attributes, className, isOpen, onClick }, ref ) => {
	const classes = classnames(
		'crowdsignal-forms-feedback__trigger',
		className,
		{
			'is-active': isOpen,
		}
	);

	return (
		<Button ref={ ref } className={ classes } onClick={ onClick } isPrimary>
			{ attributes.triggerLabel }
		</Button>
	);
};

export default forwardRef( FeedbackToggle );
