/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { map } from 'lodash';

const BlockAlignmentControlIcon = ( { rows, columns, value } ) => {
	let spanKeyNum = 0;
	let divKeyNum = 0;
	return (
		<div className="crowdsignal-forms__block-alignment-control-icon">
			{ map( rows, ( row ) => (
				<div
					key={ divKeyNum++ }
					className="crowdsignal-forms__block-alignment-control-icon-row"
				>
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

						return (
							<span key={ spanKeyNum++ } className={ classes } />
						);
					} ) }
				</div>
			) ) }
		</div>
	);
};

export default BlockAlignmentControlIcon;
