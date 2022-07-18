import { ACCOUNT_INFO_LOAD, ACCOUNT_INFO_UPDATE } from '../action-types';

export function loadAccountInfo() {
	return {
		type: ACCOUNT_INFO_LOAD,
	}
}

export function updateAccountInfo(data) {
	console.log(data);
	return {
		type: ACCOUNT_INFO_UPDATE,
		data,
	}
}

// export function* getAccountInfo() {
// 	yield loadAccountInfo(); // sets isLoading

// 	fetchAccountInfo()
// 		.then(response => console.log(response))
// 		.catch(error => {
// 			// yield saveProjectError( error.message );

// 			// Request failed, re-throw error after handling
// 			throw error;
// 		});
// }
