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

	let accentColor = getBackgroundColor( buttonNode );
	const surfaceColor = getBackgroundColor( textNode );
	const textColor = window.getComputedStyle( textNode ).color;

	// Ensure that we don't end up with the same color for surface and accent.
	// Falls back to button border color, then text color.
	if ( accentColor === surfaceColor ) {
		const borderColor = getBorderColor( buttonNode );
		accentColor = borderColor ? borderColor : textColor;
	}

	return {
		accent: accentColor,
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
