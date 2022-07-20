/**
 * wordpress dependencies
 */
import { createReduxStore, register } from '@wordpress/data';

import * as mainActions from './actions';
import * as accountActions from './account/actions';
import reducer from './reducer';
import { fetchAccountInfo } from '../data/poll';

/**
 * Module Constants
 */
export const STORE_NAME = 'crowdsignal-forms/editor';

const storeConfig = {
	reducer,

	actions: {
		...mainActions, // legacy, before store refactor
		...accountActions,
	},

	selectors: {
		shouldTryFetchingPollData( state ) {
			return !! state?.tryFetch;
		},
		getPollDataByClientId( state, clientId ) {
			return state.pollsByClientId[ clientId ] || null;
		},
		getPollClientIds( state ) {
			return state.pollClientIds;
		},
		isFetchingPollData( state ) {
			return !! state?.isFetching;
		},
		getAccountInfo( state ) {
			return state.account.accountInfo;
		},
	},

	controls: {
		ACCOUNT_INFO_LOAD() {
			return fetchAccountInfo();
		},
	},

	resolvers: {
		*getAccountInfo() {
			const res = yield accountActions.loadAccountInfo();
			return accountActions.updateAccountInfo( res );
		},
	},
};

export const store = createReduxStore( STORE_NAME, storeConfig );
register( store );
