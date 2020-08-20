/**
 * External dependencies
 */
import React from 'react';
import SideBar from './sidebar';

const EditVoteItemBlock = ( props ) => {
	const { attributes, className } = props;

	return (
		<>
			<SideBar { ...props } />

			<div className={ className }>
				{ 'up' === attributes.type ? '👍' : '👎' }
			</div>
		</>
	);
};

export default EditVoteItemBlock;
