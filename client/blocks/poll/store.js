/**
 * wordpress dependencies
 */
import { registerStore } from '@wordpress/data';

/**
 * Module Constants
 */
const MODULE_KEY = 'crowdsignal-forms/polls';
const SET_TRY_FETCH = 'SET_TRY_FETCH';
const IS_FETCHING = 'IS_FETCHING';
const SET_POLL = 'SET_POLL';

const DEFAULT_STATE = {
	tryFetch: false,
	isFetching: false,
	pollsByClientId: {},
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
		isFetchingPollData( state ) {
			return !! state.isFetching;
		},
	},

	controls: {},

	resolvers: {},
} );

export default store;
