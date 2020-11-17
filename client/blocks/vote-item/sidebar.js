/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

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
				title={ __( 'Styling', 'crowdsignal-forms' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: attributes.textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.borderColor,
						onChange: handleChangeBorderColor,
						label: __( 'Border color', 'crowdsignal-forms' ),
					},
				] }
			></PanelColorSettings>
		</InspectorControls>
	);
};

export default SideBar;
