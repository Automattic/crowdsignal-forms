/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

/**
 * Internal dependencies
 */
import { requestResults, requestVoteNonce, requestVote } from 'data/poll';
import { useFetch } from './util';

export const usePollResults = ( pollId ) => {
	const { data, error, loading } = useFetch( () => requestResults( pollId ), [
		pollId,
	] );

	return {
		error,
		loading,
		results: data,
	};
};

/**
 * React Hook that returns state variables for voting status and a function to perform a vote.
 *
 * @param {number} pollId ID of the poll being loaded.
 * @param {boolean} enableVoteRestriction sets whether or not the vote cookie is read and set
 */
export const usePollVote = ( pollId, enableVoteRestriction = false ) => {
	const cookieName = `cs-poll-${ pollId }`;
	const [ isVoting, setIsVoting ] = useState( false );
	const [ hasVoted, setHasVoted ] = useState( false );

	useEffect( () => {
		if (
			enableVoteRestriction &&
			undefined !== Cookies.get( cookieName )
		) {
			setHasVoted( true );
		}
	}, [] );

	const vote = async ( selectedAnswerIds ) => {
		try {
			const nonce = await requestVoteNonce( pollId );
			await requestVote( nonce, pollId, selectedAnswerIds );

			setHasVoted( true );
			if ( enableVoteRestriction ) {
				Cookies.set( cookieName, new Date().getTime(), {
					sameSite: 'Strict',
					expires: 365,
				} );
			}
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
