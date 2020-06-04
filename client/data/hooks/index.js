/**
 * External dependencies
 */
import { times } from 'lodash';
import { useState } from 'react';

/**
 * Internal dependencies
 */
import { useFetch } from './util.js';
import { requestVoteNonce, requestVote } from 'data/poll/index.js';

export const usePollResults = ( pollId ) => {
	const { data, error, loading } = useFetch( () => {
		// This would be an API fetch call but we're faking it for demonstration purposes
		return new Promise( ( resolve ) => {
			setTimeout(
				() =>
					resolve(
						times( 10, () => 300 ) // Return 10 entries with 300 votes each
					),
				1500
			);
		} );
	}, [ pollId ] );

	return {
		error,
		loading,
		results: data,
	};
};

/**
 * React Hook that returns state variables for voting status and a function to perform a vote.
 */
export const usePollVote = () => {
	const [ isVoting, setIsVoting ] = useState( false );
	const [ hasVoted, setHasVoted ] = useState( false );

	const vote = async ( pollId, selectedAnswerIds ) => {
		try {
			const nonce = await requestVoteNonce( pollId );
			await requestVote( nonce, pollId, selectedAnswerIds );

			setHasVoted( true );
		} finally {
			setIsVoting( false );
		}
	};

	return {
		hasVoted,
		isVoting,
		vote,
	};
};
