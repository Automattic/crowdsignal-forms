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
	requestAccountInfo,
} from 'data/poll';
import { useFetch } from './util';
import { ConnectedAccountState } from 'blocks/poll/constants';

export const usePollResults = ( pollId, doFetch = true ) => {
	const { data, error, loading } = useFetch(
		() => requestResults( pollId, doFetch ),
		[ pollId ]
	);

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
 * @param {boolean} enableVoteTracking sets whether or not the vote cookie is read and set
 * @param {boolean} storeAnswerIdsInCookie sets whether or not the answer ids are stored in the vote restriction cookie
 */
export const usePollVote = (
	pollId,
	enableVoteTracking = false,
	storeAnswerIdsInCookie = false
) => {
	const cookieName = `cs-poll-${ pollId }`;
	const [ isVoting, setIsVoting ] = useState( false );
	const [ hasVoted, setHasVoted ] = useState( false );
	const [ storedCookieValue, setStoredCookieValue ] = useState( '' );

	useEffect( () => {
		if ( enableVoteTracking && undefined !== Cookies.get( cookieName ) ) {
			setHasVoted( true );
			setStoredCookieValue( Cookies.get( cookieName ) );
		}
	}, [] );

	const vote = async ( selectedAnswerIds, voteCount = 1 ) => {
		try {
			setIsVoting( true );
			const nonce = await requestVoteNonce( pollId );
			await requestVote( nonce, pollId, selectedAnswerIds, voteCount );

			setHasVoted( true );
			if ( enableVoteTracking ) {
				const cookieValue = storeAnswerIdsInCookie
					? selectedAnswerIds.join( ',' )
					: new Date().getTime();

				Cookies.set( cookieName, cookieValue, {
					sameSite: 'Strict',
					expires: 365,
				} );

				setStoredCookieValue( cookieValue );
			}
		} finally {
			setIsVoting( false );
		}
	};

	return {
		hasVoted,
		isVoting,
		vote,
		storedCookieValue,
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

const defaultAccountInfo = {
	is_verified: true,
	capabilities: [ 'hide-branding' ],
	signal_count: {
		count: 0,
		userLimit: 2500,
		shouldDisplay: false,
	},
};

export const useAccountInfo = () => {
	// assume everything is fine with the user and
	// hide branding until request comes back
	const [ accountInfo, setAccountInfo ] = useState( defaultAccountInfo );
	const getAccountInfo = async () => {
		const info = await requestAccountInfo();
		setAccountInfo( info );
	};

	useEffect( () => {
		getAccountInfo();
	}, [] );
	return accountInfo;
};
