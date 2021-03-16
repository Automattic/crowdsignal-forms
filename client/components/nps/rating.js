/**
 * External dependencies
 */
import React, { useState } from 'react';
import classnames from 'classnames';
import { pick, times } from 'lodash';

/**
 * Internal dependencies
 */
import { updateNpsResponse } from 'data/nps';

const NpsRating = ( { attributes, onSubmit, onSubmitSuccess } ) => {
	const [ selected, setSelected ] = useState( -1 );

	const handleSubmit = ( rating ) => async () => {
		setSelected( rating );

		updateNpsResponse( attributes.surveyId, {
			nonce: attributes.nonce,
			score: rating,
		} ).then( ( data ) =>
			onSubmitSuccess( pick( data, [ 'r', 'checksum' ] ) )
		);

		// Wait for the animation to complete before proceeding to the next step
		setTimeout( onSubmit, 300 );
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
							onClick={ handleSubmit( n ) }
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
