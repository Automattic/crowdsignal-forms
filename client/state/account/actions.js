import { ACCOUNT_INFO_LOAD, ACCOUNT_INFO_UPDATE } from '../action-types';

export function loadAccountInfo() {
	return {
		type: ACCOUNT_INFO_LOAD,
	}
}

export function updateAccountInfo(data) {
	return {
		type: ACCOUNT_INFO_UPDATE,
		data,
	}
}

