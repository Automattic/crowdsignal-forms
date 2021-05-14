/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { map } from 'lodash';

const BlockAlignmentControlIcon = ( { rows, columns, value } ) => {
	return (
		<div className="crowdsignal-forms__block-alignment-control-icon">
			{ map( rows, ( row ) => (
				<div className="crowdsignal-forms__block-alignment-control-icon-row">
					{ map( columns, ( column ) => {
						const isActive =
							row.value === value.row &&
							column.value === value.column;

						const classes = classnames(
							'crowdsignal-forms__block-alignment-control-icon-dot',
							{
								'is-active': isActive,
							}
						);

						return <span className={ classes } />;
					} ) }
				</div>
			) ) }
		</div>
	);
};

export default BlockAlignmentControlIcon;
