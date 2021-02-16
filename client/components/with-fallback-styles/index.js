/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { withFallbackStyles as withWordPressFallbackStyles } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getBackgroundColor, getBorderColor } from './util';

const StyleProbe = () => (
	<div className="crowdsignal-forms__style-probe">
		<p />
		<h3>Text</h3>
		<div className="wp-block-button">
			<div className="wp-block-button__link" />
		</div>
		<div className="entry-content">
			<div className="alignwide" />
		</div>
	</div>
);

const getStyles = ( node ) => {
	if ( null === node ) {
		return {};
	}

	const buttonNode = node.querySelector( '.wp-block-button__link' );
	const textNode = node.querySelector( 'p' );
	const h3Node = node.querySelector( 'h3' );
	const wideContentNode = node.querySelector( '.alignwide' );

	let accentColor = getBackgroundColor( buttonNode );
	const backgroundColor = getBackgroundColor( textNode );
	const textColor = window.getComputedStyle( textNode ).color;

	// Ensure that we don't end up with the same color for surface and accent.
	// Falls back to button border color, then text color.
	if ( accentColor === backgroundColor ) {
		const borderColor = getBorderColor( buttonNode );
		accentColor = borderColor ? borderColor : textColor;
	}

	return {
		accentColor,
		backgroundColor,
		textColor,
		textColorInverted: window.getComputedStyle( buttonNode ).color,
		textFont: window.getComputedStyle( textNode ).fontFamily,
		textSize: window.getComputedStyle( textNode ).fontSize,
		headingFont: window.getComputedStyle( h3Node ).fontFamily,
		contentWideWidth: window.getComputedStyle( wideContentNode ).maxWidth,
	};
};

export const withFallbackStyles = ( WrappedComponent ) => {
	const getFallbackStyles = withWordPressFallbackStyles( ( node ) => ( {
		fallbackStyles: getStyles(
			node.querySelector( '.crowdsignal-forms__style-probe' )
		),
	} ) );

	return getFallbackStyles( ( { fallbackStyles, ...props } ) => {
		const renderProbe = () => {
			if ( fallbackStyles ) {
				return null;
			}

			return <StyleProbe />;
		};

		return (
			<WrappedComponent
				fallbackStyles={ fallbackStyles || {} }
				renderStyleProbe={ renderProbe }
				{ ...props }
			/>
		);
	} );
};
