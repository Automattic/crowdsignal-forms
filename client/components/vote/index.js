/**
 * External dependencies
 */
import React from 'react';
import { map } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import VoteItem from 'components/vote/vote-item';

const Vote = ( { attributes } ) => {
	const classes = classNames(
		'wp-block-crowdsignal-forms-vote',
		attributes.className
	);

	return (
		<div className={ classes }>
			{ map( attributes.innerBlocks, ( voteAttributes ) => (
				<VoteItem { ...voteAttributes } key={ voteAttributes.type } />
			) ) }
		</div>
	);
};

export default Vote;
