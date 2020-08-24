/**
 * wordpress dependencies
 */
import { registerStore } from '@wordpress/data';
import { filter } from 'lodash';

/**
 * Module Constants
 */
const MODULE_KEY = 'crowdsignal-forms/polls';
const SET_TRY_FETCH = 'SET_TRY_FETCH';
const IS_FETCHING = 'IS_FETCHING';
const SET_POLL = 'SET_POLL';
const ADD_POLL_CLIENT_ID = 'ADD_POLL_CLIENT_ID';
const REMOVE_POLL_CLIENT_ID = 'REMOVE_POLL_CLIENT_ID';

const DEFAULT_STATE = {
	tryFetch: false,
	isFetching: false,
	pollsByClientId: {},
	pollClientIds: [],
};

const actions = {
	setTryFetchPollData( tryFetch ) {
		return {
			type: SET_TRY_FETCH,
			tryFetch,
		};
	},
	setIsFetchingPollData( isFetching ) {
		return {
			type: IS_FETCHING,
			isFetching,
		};
	},
	setPollApiDataForClientId( clientId, pollData ) {
		return {
			type: SET_POLL,
			clientId,
			pollData,
		};
	},
	addPollClientId( clientId ) {
		return {
			type: ADD_POLL_CLIENT_ID,
			clientId,
		};
	},
	removePollClientId( clientId ) {
		return {
			type: REMOVE_POLL_CLIENT_ID,
			clientId,
		};
	},
};

const store = registerStore( MODULE_KEY, {
	reducer( state = DEFAULT_STATE, action ) {
		switch ( action.type ) {
			case SET_TRY_FETCH:
				return {
					...state,
					tryFetch: !! action.tryFetch,
				};
			case IS_FETCHING:
				return {
					...state,
					isFetching: !! action.isFetching,
				};
			case SET_POLL:
				return {
					...state,
					pollsByClientId: {
						...state.pollsByClientId,
						[ action.clientId ]: action.pollData,
					},
				};
			case ADD_POLL_CLIENT_ID:
				return {
					...state,
					pollClientIds:
						state.pollClientIds.indexOf( action.clientId ) < 0
							? [ ...state.pollClientIds, action.clientId ]
							: state.pollClientIds,
				};
			case REMOVE_POLL_CLIENT_ID:
				return {
					...state,
					pollClientIds: filter(
						state.pollClientIds,
						( clientId ) => clientId !== action.clientId
					),
				};
			default:
				return state;
		}
	},

	actions,

	selectors: {
		shouldTryFetchingPollData( state ) {
			return !! state.tryFetch;
		},
		getPollDataByClientId( state, clientId ) {
			return state.pollsByClientId[ clientId ] || null;
		},
		getPollClientIds( state ) {
			return state.pollClientIds;
		},
		isFetchingPollData( state ) {
			return !! state.isFetching;
		},
	},

	controls: {},

	resolvers: {},
} );

export default store;
