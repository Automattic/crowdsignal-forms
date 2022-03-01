/**
 * External dependencies
 */
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
} from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';

/**
 * Internal dependencies
 */
import CloseIcon from 'components/icon/close-small';
import { FeedbackToggleMode } from 'blocks/feedback/constants';

const FeedbackToggle = (
	{ attributes, className, isOpen, onClick, onToggle },
	ref
) => {
	useLayoutEffect( onToggle, [ isOpen ] );

	useEffect( () => {
		if ( isOpen || attributes.toggleOn !== FeedbackToggleMode.PAGE_LOAD ) {
			return;
		}

		onClick();
	}, [] );

	const handleHover = useCallback( () => {
		if ( isOpen || attributes.toggleOn !== FeedbackToggleMode.HOVER ) {
			return;
		}

		onClick();
	}, [ attributes.toggleOn, isOpen ] );

	const classes = classnames(
		'crowdsignal-forms-feedback__trigger',
		'wp-block-button__link',
		className,
		{
			'is-active': isOpen,
		}
	);

	return (
		<div className="wp-block-button crowdsignal-forms-feedback__trigger-wrapper">
			{ ! isOpen && (
				<button
					ref={ ref }
					className={ classes }
					onClick={ onClick }
					onMouseEnter={ handleHover }
				>
					<div className="crowdsignal-forms-feedback__trigger-text">
						<RawHTML>{ attributes.triggerLabel }</RawHTML>
					</div>
				</button>
			) }
			{ isOpen && (
				<button ref={ ref } className={ classes } onClick={ onClick }>
					<CloseIcon />
					{ __( 'Close', 'crowdsignal-forms' ) }
				</button>
			) }
		</div>
	);
};

export default forwardRef( FeedbackToggle );
