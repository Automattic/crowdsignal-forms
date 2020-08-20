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
import ConnectToCrowdsignal from 'components/connect-to-crowdsignal';
import { __ } from 'lib/i18n';

const EditVoteBlock = ( props ) => {
	const { className } = props;
	return (
		<ConnectToCrowdsignal
			blockIcon={ null }
			blockName={ __( 'Crowdsignal Vote' ) }
		>
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
		</ConnectToCrowdsignal>
	);
};

export default EditVoteBlock;
