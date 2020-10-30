/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	getBackgroundColor,
	getBorderColor,
} from 'components/with-fallback-styles/util';

export const getApplauseStyles = ( node ) => {
	if ( null === node ) {
		return {};
	}

	const buttonNode = node.querySelector( '.wp-block-button__link' );
	const textNode = node.querySelector( 'p' );

	const surfaceColor = getBackgroundColor( textNode );
	const textColor = window.getComputedStyle( textNode ).color;

	const buttonBackgroundColor = getBackgroundColor( buttonNode );
	const buttonBorderColor = getBorderColor( buttonNode );
	// Ensure that we don't end up with the same color for surface and accent.
	// Falls back to button border color, then text color.
	let accentColor = buttonBackgroundColor;

	if ( accentColor === surfaceColor ) {
		accentColor = buttonBorderColor ? buttonBorderColor : textColor;
	}

	return {
		accent: accentColor,
		surface: surfaceColor,
		text: textColor,
	};
};

export const ApplauseStyles = () => (
	<>
		<p />
		<div className="wp-block-button">
			<div className="wp-block-button__link" />
		</div>
	</>
);
