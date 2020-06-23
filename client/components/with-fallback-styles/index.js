/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { withFallbackStyles as withWordPressFallbackStyles } from '@wordpress/components';

const StyleProbe = ( { children } ) => (
	<div className="crowdsignal-forms__style-probe">{ children }</div>
);

export const withFallbackStyles = ( VirtualComponent, getStyles ) => (
	WrappedComponent
) => {
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

			return (
				<StyleProbe>
					<VirtualComponent />
				</StyleProbe>
			);
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
