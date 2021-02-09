/**
 * External dependencies
 */
import React, { useState } from 'react';
import classnames from 'classnames';
import { pick, times } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { updateNpsResponse } from 'data/nps';
import FooterBranding from 'components/footer-branding';

const NpsRating = ( { attributes, onFailure, onSubmit } ) => {
	const [ selected, setSelected ] = useState( -1 );

	const handleSubmit = ( rating ) => async () => {
		setSelected( rating );

		try {
			const data = await updateNpsResponse( attributes.surveyId, {
				nonce: attributes.nonce,
				score: rating,
			} );

			onSubmit( pick( data, [ 'r', 'checksum' ] ) );
		} catch ( error ) {
			onFailure();
		}
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
			{ ! attributes.hideBranding && (
				<FooterBranding
					message={ __(
						'Collect your own feedback with Crowdsignal',
						'crowdsignal-forms'
					) }
				/>
			) }
		</div>
	);
};

export default NpsRating;
