import { kebabCase, mapKeys } from 'lodash';

export const getVoteItemStyleVars = ( attributes ) => {
	return mapKeys(
		{
			borderRadius: `${ attributes.borderRadius }px`,
			borderWidth: `${ attributes.borderWidth }px`,
		},
		( _, key ) => `--crowdsignal-forms-vote-${ kebabCase( key ) }`
	);
};
