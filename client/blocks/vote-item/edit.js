/**
 * External dependencies
 */
import React from 'react';

const EditVoteItemBlock = ( { attributes, className } ) => {
	return (
		<>
			<div className={ className }>
				{ 'up' === attributes.type ? '👍' : '👎' }
			</div>
		</>
	);
};

export default EditVoteItemBlock;
