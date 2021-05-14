/**
 * External dependencies
 */
import React from 'react';
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { ToolbarButton, Dropdown, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DOWN } from '@wordpress/keycodes';

/**
 * Internal dependencies
 */
import Grid from './grid';
import Icon from './icon';

const BlockAlignmentControl = ( {
	closeOnSelectionChanged,
	disabled,
	label,
	onChange,
	rows,
	columns,
	value,
} ) => {
	const toolbarIcon = (
		<Icon rows={ rows } columns={ columns } value={ value } />
	);

	return (
		<Dropdown
			className="crowdsignal-forms__block-alignment-control"
			popoverProps={ {
				className: 'crowdsignal-forms__block-alignment-control-popover',
			} }
			renderToggle={ ( { onToggle, isOpen } ) => {
				const openOnArrowDown = ( event ) => {
					if ( isOpen || event.keyCode !== DOWN ) {
						return;
					}

					event.preventDefault();
					event.stopPropagation();
					onToggle();
				};

				return (
					<Tooltip text={ label }>
						<ToolbarButton
							showTooltip
							aria-haspopup="true"
							aria-expanded={ isOpen }
							disabled={ disabled }
							icon={ toolbarIcon }
							onClick={ onToggle }
							onKeyDown={ openOnArrowDown }
						/>
					</Tooltip>
				);
			} }
			renderContent={ ( { onClose } ) => {
				const handleChange = ( row, column ) => {
					onChange( row, column );

					if (
						closeOnSelectionChanged &&
						( value.row !== row || value.column !== column )
					) {
						onClose();
					}
				};

				return (
					<Grid
						onChange={ handleChange }
						rows={ rows }
						columns={ columns }
						value={ value }
					/>
				);
			} }
		/>
	);
};

BlockAlignmentControl.defaultProps = {
	closeOnSelectionChanged: false,
	label: __( 'Change block position', 'crowdsignal-forms' ),
	onChange: noop,
};

export default BlockAlignmentControl;

export { GRID } from './constants';
