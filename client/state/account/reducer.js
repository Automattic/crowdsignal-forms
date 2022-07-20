/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ACCOUNT_INFO_UPDATE } from '../action-types';

const defaultAccountInfo = {
	is_verified: true,
	capabilities: [ 'hide-branding' ],
	signal_count: {
		count: 0,
		userLimit: 2500,
		shouldDisplay: false,
	},
};

const accountInfo = ( state = defaultAccountInfo, action ) => {
	if ( action.type === ACCOUNT_INFO_UPDATE ) {
		return {
			...state,
			...action.data,
		};
	}

	return state;
};

export default combineReducers( {
	accountInfo,
} );
