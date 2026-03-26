/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import SideBar from './sidebar';
import withClientId from 'components/with-client-id';
import VoteItem from 'components/vote/vote-item';
import { withFallbackStyles } from 'components/with-fallback-styles';

const EditVoteItemBlock = ( props ) => {
	const { attributes, className, fallbackStyles, fallbackStylesRef, renderStyleProbe } = props;

	const blockProps = useBlockProps();
	const mergedRef = ( node ) => {
		if ( typeof blockProps.ref === 'function' ) blockProps.ref( node );
		else if ( blockProps.ref ) blockProps.ref.current = node;
		if ( fallbackStylesRef ) fallbackStylesRef( node );
	};

	return (
		<div { ...blockProps } ref={ mergedRef }>
			<SideBar { ...props } />

			<VoteItem
				attributes={ attributes }
				fallbackStyles={ fallbackStyles }
				className={ className }
				voteCount={ 0 }
				isInEditor={ true }
				type={ attributes.type }
			/>

			{ renderStyleProbe() }
		</div>
	);
};

export default compose( [
	withFallbackStyles,
	withClientId( [ 'answerId' ] ),
] )( EditVoteItemBlock );
