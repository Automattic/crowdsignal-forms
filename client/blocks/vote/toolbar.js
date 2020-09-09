/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { DEFAULT_SIZE_CONTROLS, POPOVER_PROPS } from 'blocks/vote/constants';
import SizeIcon from 'components/icon/size';

const ToolBar = ( { attributes, setAttributes } ) => {
	const size = get( attributes, 'size', 'medium' );
	const sizeControls = DEFAULT_SIZE_CONTROLS;

	return (
		<BlockControls>
			<ToolbarGroup
				isCollapsed={ true }
				icon={ SizeIcon }
				label={ __( 'Change block size' ) }
				popoverProps={ POPOVER_PROPS }
				controls={ sizeControls.map( ( control ) => {
					const { size: controlSize } = control;
					const isActive = size === controlSize;

					return {
						...control,
						isActive,
						role: 'menuitemradio',
						onClick: () => setAttributes( { size: controlSize } ),
					};
				} ) }
			/>
		</BlockControls>
	);
};

export default ToolBar;
