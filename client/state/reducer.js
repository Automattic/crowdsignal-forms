/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import account from './account/reducer';
import { SET_TRY_FETCH, IS_FETCHING, SET_POLL, ADD_POLL_CLIENT_ID, REMOVE_POLL_CLIENT_ID } from './action-types';

const DEFAULT_STATE = {
	tryFetch: false,
	isFetching: false,
	pollsByClientId: {},
	pollClientIds: [],
};

const tryFetch = (state = false, action) => {
	if (action.type === SET_TRY_FETCH) {
		return !!action.tryFetch;
	}
	return state;
}
const isFetching = (state = false, action) => {
	if (action.type === IS_FETCHING) {
		return !!action.isFetching;
	}
	return state;
}
const pollsByClientId = (state = {}, action) => {
	if (action.type === SET_POLL) {
		return {
			...state,
			[action.clientId]: action.pollData,
		};
	}
	return state;
}
const pollClientIds = (state = [], action) => {
	if (action.type === ADD_POLL_CLIENT_ID) {
		return [
			...state,
			action.clientId,
		];
	}

	if (action.type === REMOVE_POLL_CLIENT_ID) {
		return [
			...filter(state, (clientId) => clientId !== action.clientId),
		];
	}
	return state;
}

export default combineReducers( {
	tryFetch,
	isFetching,
	pollsByClientId,
	pollClientIds,
	account,
} );
