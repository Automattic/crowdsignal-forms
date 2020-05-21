/**
 * External dependencies
 */
import { map, uniqueId } from 'lodash';

/**
 * Generates unique answer IDs for answers that have not beeen published yet.
 * This keeps the poll block working while in preview mode.
 *
 * @param  {Array} answers Answers array
 * @return {Array}         Updated answers array
 */
export const maybeAddTemporaryAnswerIds = ( answers ) =>
	map( answers, ( answer ) => {
		if ( typeof answer.answerId !== 'undefined' ) {
			return answer;
		}

		return {
			...answer,
			answerId: parseInt( uniqueId(), 10 ),
		};
	} );
