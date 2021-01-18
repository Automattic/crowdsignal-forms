/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { views } from './constants';

const PollToolbar = ( { currentView, onViewChange } ) => {
	const handleViewChange = ( view ) => () => onViewChange( view );

	return (
		<BlockControls>
			<ToolbarGroup label={ __( 'Current view', 'crowdsignal-forms' ) }>
				<ToolbarButton
					isActive={ currentView === views.RATING }
					label={ __( 'Rating', 'crowdsignal-forms' ) }
					onClick={ handleViewChange( views.RATING ) }
				>
					{ __( 'Rating', 'crowdsignal-forms' ) }
				</ToolbarButton>
				<ToolbarButton
					isActive={ currentView === views.FEEDBACK }
					label={ __( 'Feedback', 'crowdsignal-forms' ) }
					onClick={ handleViewChange( views.FEEDBACK ) }
				>
					{ __( 'Feedback', 'crowdsignal-forms' ) }
				</ToolbarButton>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default PollToolbar;
