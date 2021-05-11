/**
 * External dependencies
 */
import React, { useCallback } from 'react';
import { CompositeItem } from 'reakit';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Tooltip, VisuallyHidden } from '@wordpress/components';

const BlockAlignmentControlGridButton = ( {
	isActive,
	column,
	onSelect,
	row,
	...props
} ) => {
	const label = `${ row.label } ${ column.label }`;

	const handleSelect = useCallback( () => {
		onSelect( row.value, column.value );
	}, [ onSelect, row.value, column.value ] );

	const classes = classnames(
		'crowdsignal-forms__block-alignment-control-button',
		{
			'is-active': isActive,
		}
	);

	return (
		<Tooltip text={ label }>
			<CompositeItem
				className={ classes }
				role="gridcell"
				onFocus={ handleSelect }
				{ ...props }
			>
				<VisuallyHidden>{ label }</VisuallyHidden>
			</CompositeItem>
		</Tooltip>
	);
};

export default BlockAlignmentControlGridButton;
