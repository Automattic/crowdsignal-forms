/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import NpsFeedback from './feedback';
import NpsRating from './rating';

const views = {
	RATING: 'rating',
	FEEDBACK: 'feedback',
};

const Nps = ( { attributes, contentWidth, onClose } ) => {
	const [ responseMeta, setResponseMeta ] = useState( null );
	const [ view, setView ] = useState( views.RATING );

	const handleRatingSubmit = ( meta ) => {
		setResponseMeta( meta );
		setView( views.FEEDBACK );
	};

	const questionText =
		view === views.RATING
			? attributes.ratingQuestion
			: attributes.feedbackQuestion;

	const style = {
		width: `${ contentWidth }px`,
	};

	return (
		<div className="crowdsignal-forms-nps" style={ style }>
			<h3 className="crowdsignal-forms-nps__question">
				{ questionText }
			</h3>

			<button
				className="crowdsignal-forms-nps__close-button"
				onClick={ onClose }
			>
				<Icon icon="no-alt" />
			</button>

			{ view === views.RATING && (
				<NpsRating
					attributes={ attributes }
					onFailure={ onClose }
					onSubmit={ handleRatingSubmit }
				/>
			) }

			{ view === views.FEEDBACK && (
				<NpsFeedback
					attributes={ attributes }
					responseMeta={ responseMeta }
					onFailure={ onClose }
					onSubmit={ onClose }
				/>
			) }
		</div>
	);
};

export default Nps;
