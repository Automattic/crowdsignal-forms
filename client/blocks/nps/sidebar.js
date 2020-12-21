/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { PanelBody, TextControl } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const Sidebar = ( { attributes, setAttributes } ) => {
	const handleChangeViewThreshold = ( viewThreshold ) =>
		setAttributes( {
			viewThreshold,
		} );

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'NPS Settings', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<TextControl
					label={ __( 'View threshold', 'crowdsignal-forms' ) }
					value={ attributes.viewThreshold }
					onChange={ handleChangeViewThreshold }
					type="number"
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Sidebar;
