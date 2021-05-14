/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { Composite, CompositeGroup, useCompositeState } from 'reakit';
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { useInstanceId } from '@wordpress/compose';
import { isRTL } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import GridButton from './grid-button';

const getButtonId = ( prefix, row, column ) =>
	`${ prefix }-${ row }-${ column }`;

function BlockAlignmentControlGrid( { columns, onChange, rows, value } ) {
	const baseId = useInstanceId(
		BlockAlignmentControlGrid,
		'block-alignment-control-grid'
	);

	const composite = useCompositeState( {
		baseId,
		currentId: getButtonId( baseId, value.row, value.column ),
		rtl: isRTL(),
	} );

	useEffect( () => {
		composite.setCurrentId(
			getButtonId( baseId, value.row, value.column )
		);
	}, [ value, composite.setCurrentId ] );

	return (
		<Composite
			{ ...composite }
			className="crowdsignal-forms__block-alignment-control-grid"
		>
			{ map( rows, ( row ) => (
				<CompositeGroup
					{ ...composite }
					key={ `${ baseId }-${ row.value }` }
					role="row"
					className="crowdsignal-forms__block-alignment-control-row"
				>
					{ map( columns, ( column ) => {
						const id = getButtonId(
							baseId,
							row.value,
							column.value
						);
						const isActive =
							composite.currentId ===
							getButtonId( baseId, row.value, column.value );

						return (
							<GridButton
								{ ...composite }
								id={ id }
								key={ id }
								isActive={ isActive }
								row={ row }
								column={ column }
								onSelect={ onChange }
								tabIndex={ isActive ? 0 : -1 }
							/>
						);
					} ) }
				</CompositeGroup>
			) ) }
		</Composite>
	);
}

export default BlockAlignmentControlGrid;
