/**
 * External dependencies
 */
import React, { useLayoutEffect, useState, useRef } from 'react';
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

const Feedback = ( { attributes, fallbackStyles, renderStyleProbe } ) => {
	const [ position, setPosition ] = useState( {} );

	const toggle = useRef( null );

	useLayoutEffect( () => {
		setPosition(
			getFeedbackButtonPosition(
				attributes.x,
				attributes.y,
				toggle.current.offsetWidth,
				toggle.current.offsetHeight,
				20,
				document.body
			)
		);
	}, [ attributes.x, attributes.y, toggle.current ] );

	const classes = classnames( 'crowdsignal-forms-feedback', {
		'no-shadow': attributes.hideTriggerShadow,
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
					} }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<FeedbackToggle
							ref={ toggle }
							isOpen={ isOpen }
							onClick={ onToggle }
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
