/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getBackgroundColor } from 'components/with-fallback-styles/util';

export const getPollStyles = ( node ) => {
	const buttonNode = node.querySelector( '.wp-block-button__link' );
	const textNode = node.querySelector( 'p' );
	const wideContentNode = node.querySelector( '.alignwide' );

	return {
		accent: getBackgroundColor( buttonNode ),
		surface: getBackgroundColor( textNode ),
		text: window.getComputedStyle( textNode ).color,
		textInverted: window.getComputedStyle( buttonNode ).color,
		contentWideWidth: window.getComputedStyle( wideContentNode ).maxWidth,
	};
};

export const PollStyles = () => (
	<>
		<p />
		<div className="wp-block-button">
			<div className="wp-block-button__link" />
		</div>
		<div className="entry-content">
			<div className="alignwide" />
		</div>
	</>
);
