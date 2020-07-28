/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

/**
 * Internal dependencies
 */
import {
	requestResults,
	requestVoteNonce,
	requestVote,
	requestIsCsConnected,
} from 'data/poll';
import { useFetch } from './util';
import { ConnectedAccountState } from 'blocks/poll/constants';

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
			setIsVoting( true );
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

export const useIsCsConnected = () => {
	/* assume connection is enabled, so placeholder doesn't flash while we add a block and wait for the request */
	const [ isConnected, setIsConnected ] = useState( true );
	const [ isAccountVerified, setIsAccountVerified ] = useState( true );

	const checkIsConnected = async () => {
		const connectedState = await requestIsCsConnected();

		const isNowConnected =
			ConnectedAccountState.CONNECTED === connectedState ||
			ConnectedAccountState.NOT_VERIFIED === connectedState;
		const isNowVerified =
			ConnectedAccountState.CONNECTED === connectedState;

		setIsConnected( isNowConnected );
		setIsAccountVerified( isNowVerified );

		return {
			isNowConnected,
			isNowVerified,
		};
	};

	useEffect( () => {
		checkIsConnected();
	}, [] );
	return { isConnected, isAccountVerified, checkIsConnected };
};
