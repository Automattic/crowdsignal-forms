/**
 * External dependencies
 */
import { useEffect } from 'react';
import { isEmpty, map, omit } from 'lodash';

export default ( blockClientId, pollId, answers, setAttributes ) =>
	useEffect( () => {
		if ( isEmpty( pollId ) ) {
			return;
		}

		if ( ! window.csPolls ) {
			window.csPolls = {};
		}

		if ( ! window.csPolls[ pollId ] ) {
			window.csPolls[ pollId ] = [ blockClientId ];
		} else if ( window.csPolls[ pollId ].indexOf( blockClientId ) > -1 ) {
			// clientid already known, ignore.
		} else {
			const newAnswers = map( answers, ( answer ) =>
				omit( answer, [ 'answerId' ] )
			);

			setAttributes( { pollId: null, answers: newAnswers } );
		}
	}, [ pollId ] );
