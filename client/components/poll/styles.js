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

export const getPollStyles = ( node ) => {
	if ( null === node ) {
		return {};
	}

	const buttonNode = node.querySelector( '.wp-block-button__link' );
	const textNode = node.querySelector( 'p' );
	const h3Node = node.querySelector( 'h3' );
	const wideContentNode = node.querySelector( '.alignwide' );

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
		surface: surfaceColor,
		text: textColor,
		bodyFontFamily: window.getComputedStyle( textNode ).fontFamily,
		questionFontFamily: window.getComputedStyle( h3Node ).fontFamily,
		textInverted: window.getComputedStyle( buttonNode ).color,
		contentWideWidth: window.getComputedStyle( wideContentNode ).maxWidth,
	};
};

export const PollStyles = () => (
	<>
		<p />
		<h3>Question</h3>
		<div className="wp-block-button">
			<div className="wp-block-button__link" />
		</div>
		<div className="entry-content">
			<div className="alignwide" />
		</div>
	</>
);
