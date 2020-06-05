/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { withFallbackStyles } from '@wordpress/components';

const ColorProbe = ( { children } ) => (
	<div className="crowdsignal-forms__color-probe">{ children }</div>
);

export const withFallbackColors = ( VirtualComponent, getColors ) => (
	WrappedComponent
) => {
	const fallbackStyles = withFallbackStyles( ( node ) => ( {
		fallbackColors: getColors(
			node.querySelector( '.crowdsignal-forms__color-probe' )
		),
	} ) );

	return fallbackStyles( ( { fallbackColors, ...props } ) => {
		const renderColorProbe = () => {
			if ( fallbackColors ) {
				return null;
			}

			return (
				<ColorProbe>
					<VirtualComponent />
				</ColorProbe>
			);
		};

		return (
			<WrappedComponent
				fallbackColors={ fallbackColors || {} }
				renderColorProbe={ renderColorProbe }
				{ ...props }
			/>
		);
	} );
};
