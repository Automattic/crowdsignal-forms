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
	withWordPressFallbackStyles,
} from './util';

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

	const view = node.ownerDocument.defaultView;

	let accentColor = getBackgroundColor( buttonNode );
	const backgroundColor = getBackgroundColor( textNode );
	const textColor = view.getComputedStyle( textNode ).color;

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
		textColorInverted: view.getComputedStyle( buttonNode ).color,
		textFont: view.getComputedStyle( textNode ).fontFamily,
		textSize: view.getComputedStyle( textNode ).fontSize,
		headingFont: view.getComputedStyle( h3Node ).fontFamily,
		contentWideWidth: view.getComputedStyle( wideContentNode ).maxWidth,
	};
};

export const withFallbackStyles = ( WrappedComponent ) => {
	const getFallbackStyles = withWordPressFallbackStyles( ( node ) => ( {
		fallbackStyles: getStyles(
			node.querySelector( '.crowdsignal-forms__style-probe' )
		),
	} ) );

	return getFallbackStyles( ( { fallbackStyles, fallbackStylesRef, ...props } ) => {
		const renderProbe = () => {
			if ( fallbackStyles ) {
				return null;
			}

			return <StyleProbe />;
		};

		return (
			<WrappedComponent
				fallbackStyles={ fallbackStyles || {} }
				fallbackStylesRef={ fallbackStylesRef }
				renderStyleProbe={ renderProbe }
				{ ...props }
			/>
		);
	} );
};
