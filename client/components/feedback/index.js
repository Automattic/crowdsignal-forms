/**
 * External dependencies
 */
import React, { useCallback, useLayoutEffect, useState, useRef } from 'react';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Dropdown } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getStyleVars } from 'blocks/feedback/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import FeedbackToggle from './toggle';
import FeedbackPopover from './popover';
import { getFeedbackButtonPosition } from './util';

const getPopoverPosition = ( x, y ) => {
	if ( y !== 'center' ) {
		return '';
	}

	return x === 'left' ? 'middle right' : 'middle left';
};

const adjustFrameOffset = ( position, verticalAlign, width, height ) => {
	if ( verticalAlign !== 'center' ) {
		return position;
	}

	return {
		...position,
		left: position.left !== null ? position.left - width + height : null,
		right: position.right !== null ? position.right - width + height : null,
	};
};

const Feedback = ( { attributes, fallbackStyles, renderStyleProbe } ) => {
	const [ position, setPosition ] = useState( {} );

	const toggle = useRef( null );

	const updatePosition = useCallback( () => {
		setPosition(
			adjustFrameOffset(
				getFeedbackButtonPosition(
					attributes.x,
					attributes.y,
					toggle.current.offsetWidth,
					attributes.y === 'center'
						? toggle.current.offsetWidth
						: toggle.current.offsetHeight,
					{
						top: 20,
						bottom: 20,
						left: attributes.y === 'center' ? 0 : 20,
						right: attributes.y === 'center' ? 0 : 20,
					},
					document.body
				),
				attributes.y,
				toggle.current.offsetWidth,
				toggle.current.offsetHeight
			)
		);
	}, [ attributes.x, attributes.y, toggle.current ] );

	useLayoutEffect( () => {
		updatePosition();
	}, [ attributes.x, attributes.y, updatePosition ] );

	const classes = classnames( 'crowdsignal-forms-feedback', {
		'no-shadow': attributes.hideTriggerShadow,
		'is-vertical': attributes.y === 'center',
		'is-right-aligned': attributes.x === 'right',
	} );

	const styles = {
		...position,
		...getStyleVars( attributes, fallbackStyles ),
	};

	return (
		<>
			<div className={ classes } style={ styles }>
				<Dropdown
					popoverProps={ {
						className:
							'crowdsignal-forms-feedback__popover-wrapper',
						position: getPopoverPosition(
							attributes.x,
							attributes.y
						),
					} }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<FeedbackToggle
							ref={ toggle }
							isOpen={ isOpen }
							onClick={ onToggle }
							onToggle={ updatePosition }
							attributes={ attributes }
						/>
					) }
					renderContent={ () => (
						<FeedbackPopover attributes={ attributes } />
					) }
				/>
			</div>

			{ renderStyleProbe() }
		</>
	);
};

export default withFallbackStyles( Feedback );
