/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { InnerBlocks } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import SideBar from './sidebar';

const EditVoteBlock = ( props ) => {
	const { className } = props;

	return (
		<>
			<SideBar { ...props } viewResultsUrl={ '' } />
			<div className={ className }>
				<InnerBlocks
					template={ [
						[ 'crowdsignal-forms/vote-item', { type: 'up' } ],
						[ 'crowdsignal-forms/vote-item', { type: 'down' } ],
					] }
					templateLock="insert"
					allowedBlocks={ [ 'crowdsignal-forms/vote-item' ] }
					orientation="horizontal"
				/>
			</div>
		</>
	);
};

export default EditVoteBlock;
