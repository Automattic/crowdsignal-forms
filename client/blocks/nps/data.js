/**
 * External dependencies
 */
import { pick, tap } from 'lodash';

/**
 * Internal dependencies
 */
import { updateNps } from 'data/nps';

export const saveNps = async ( attributes, setAttributes ) => {
	const { surveyId } = await updateNps(
		tap(
			pick( attributes, [
				'feedbackQuestion',
				'ratingQuestion',
				'surveyId',
				'title',
			] ),
			( data ) => {
				if ( ! data.title ) {
					data.title = data.ratingQuestion;
				}
			}
		)
	);

	if ( ! attributes.surveyId ) {
		setAttributes( { surveyId } );
	}
};
