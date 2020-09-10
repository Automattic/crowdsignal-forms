/**
 * External dependencies
 */
import { round } from 'lodash';

/**
 * Formats the counter values on vote items:
 *
 * @param  {number} count Vote count
 * @return {string}       Formatted count
 */
export const formatVoteCount = ( count ) => {
	if ( ! count ) {
		return '0';
	}

	if ( count >= 10000000 ) {
		return `${ round( count / 1000000 ) }M`;
	}

	if ( count >= 1000000 ) {
		return `${ ( count / 1000000 ).toFixed( 1 ) }M`;
	}

	if ( count >= 10000 ) {
		return `${ round( count / 1000 ) }K`;
	}

	if ( count >= 1000 ) {
		return `${ ( count / 1000 ).toFixed( 1 ) }K`;
	}

	return count.toString();
};
