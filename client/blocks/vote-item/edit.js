/**
 * External dependencies
 */
import React from 'react';
import SideBar from './sidebar';
import withClientId from 'components/with-client-id';
import VoteItem from 'components/vote/vote-item';

const EditVoteItemBlock = ( props ) => {
	const { attributes, className } = props;

	return (
		<>
			<SideBar { ...props } />

			<VoteItem
				{ ...attributes }
				className={ className }
				voteCount={ 0 }
			/>
		</>
	);
};

export default withClientId( EditVoteItemBlock, 'answerId' );
