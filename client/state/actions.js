import { SET_TRY_FETCH, IS_FETCHING, SET_POLL, ADD_POLL_CLIENT_ID, REMOVE_POLL_CLIENT_ID } from './action-types';

export function setTryFetchPollData( tryFetch ) {
	return {
		type: SET_TRY_FETCH,
		tryFetch,
	};
};

export function setIsFetchingPollData( isFetching ) {
	return {
		type: IS_FETCHING,
		isFetching,
	};
};

export function setPollApiDataForClientId( clientId, pollData ) {
	return {
		type: SET_POLL,
		clientId,
		pollData,
	};
};

export function addPollClientId( clientId ) {
	return {
		type: ADD_POLL_CLIENT_ID,
		clientId,
	};
};

export function removePollClientId( clientId ) {
	return {
		type: REMOVE_POLL_CLIENT_ID,
		clientId,
	};
};
