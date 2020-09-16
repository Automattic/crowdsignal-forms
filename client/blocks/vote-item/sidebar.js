/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const SideBar = ( { attributes, setAttributes } ) => {
	const handleChangeTextColor = ( textColor ) =>
		setAttributes( { textColor } );

	const handleChangeBackgroundColor = ( backgroundColor ) =>
		setAttributes( { backgroundColor } );

	const handleChangeBorderColor = ( borderColor ) =>
		setAttributes( { borderColor } );
	return (
		<InspectorControls>
			<PanelColorSettings
				title={ __( 'Styling' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: attributes.textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text color' ),
					},
					{
						value: attributes.backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background color' ),
					},
					{
						value: attributes.borderColor,
						onChange: handleChangeBorderColor,
						label: __( 'Border color' ),
					},
				] }
			></PanelColorSettings>
		</InspectorControls>
	);
};

export default SideBar;
