/**
 * External dependencies
 */
import React, { forwardRef } from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import SignalIcon from 'components/icon/signal';
import { getTriggerStyles } from 'blocks/feedback/util';

const FeedbackToggle = ( { attributes, className, isOpen, onClick }, ref ) => {
	const classes = classnames(
		'crowdsignal-forms-feedback__trigger',
		className,
		{
			'is-active': isOpen,
		}
	);

	return (
		<button
			ref={ ref }
			className={ classes }
			onClick={ onClick }
			style={ getTriggerStyles( attributes ) }
		>
			{ ( ! attributes.triggerBackgroundImage || isOpen ) && (
				<Icon
					icon={ isOpen ? 'no-alt' : SignalIcon }
					size={ isOpen ? 36 : 75 }
				/>
			) }
		</button>
	);
};

export default forwardRef( FeedbackToggle );
