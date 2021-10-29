/**
 * External dependencies
 */
import { debounce } from 'lodash';

export const trackFailedConnection = debounce(
	( authorId, site, blockName ) => {
		window._tkq = window._tkq || [];
		window._tkq.push( [
			'recordEvent',
			'crowdsignal_connection_failed',
			{
				author_id: authorId,
				site,
				block_name: blockName,
			},
		] );
	},
	5000
);
