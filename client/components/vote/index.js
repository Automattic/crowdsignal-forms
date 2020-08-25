/**
 * External dependencies
 */
import React from 'react';

const Vote = ( { attributes } ) => {
	return (
		<div>
			Vote Placeholder with { attributes.innerBlocks.length } children
			{ attributes.apiPollData && (
				<>
					<br />
					Poll ID: { attributes.apiPollData.id }
					<br />
					Answer IDs:
					{ attributes.apiPollData.answers.map(
						( answer ) => answer.id + ', '
					) }
				</>
			) }
			{ ! attributes.apiPollData && <>No API Poll data</> }
		</div>
	);
};

export default Vote;
