/**
 * External dependencies
 */
import React, { useState } from 'react';
import classnames from 'classnames';
import { times } from 'lodash';

const NpsRating = ( { attributes, onSubmit } ) => {
	const [ selected, setSelected ] = useState( -1 );

	const selectRating = ( n ) => () => {
		setSelected( n );

		setTimeout( () => onSubmit(), 1000 );
	};

	return (
		<div className="crowdsignal-forms-nps__rating">
			<div className="crowdsignal-forms-nps__rating-labels">
				<span>{ attributes.lowRatingLabel }</span>
				<span>{ attributes.highRatingLabel }</span>
			</div>

			<div className="crowdsignal-forms-nps__rating-scale">
				{ times( 11, ( n ) => {
					const classes = classnames(
						'crowdsignal-forms-nps__rating-button',
						{
							'is-active': n === selected,
						}
					);

					return (
						<button
							key={ `rating-${ n }` }
							disabled={ 0 <= selected }
							className={ classes }
							onClick={ selectRating( n ) }
						>
							{ n }
						</button>
					);
				} ) }
			</div>
		</div>
	);
};

export default NpsRating;
