/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getBackgroundColor } from 'components/with-fallback-colors/util';

export const getPollColors = ( node ) => {
	const buttonNode = node.querySelector( '.wp-block-button__link' );
	const captionNode = node.querySelector( 'figcaption' );
	const textNode = node.querySelector( 'p' );

	return {
		accent: getBackgroundColor( buttonNode ),
		surface: getBackgroundColor( textNode ),
		text: window.getComputedStyle( textNode ).color,
		textInverted: window.getComputedStyle( buttonNode ).color,
		textSubtle: window.getComputedStyle( captionNode ).color,
	};
};

export const PollColors = () => (
	<>
		<p />
		<figcaption />
		<div className="wp-block-button">
			<div className="wp-block-button__link" />
		</div>
	</>
);
