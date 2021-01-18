/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import {
	Popover,
	TextControl,
	ToolbarGroup,
	ToolbarButton
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { views } from './constants';

const PollToolbar = ( { attributes, currentView, onViewChange, setAttributes } ) => {
	const [ showThreshold, setShowThreshold ] = useState( false );

	const handleViewChange = ( view ) => () => onViewChange( view );

	const showThresholdPopover = () =>
		setShowThreshold( true );

	const hideThresholdPopover = () =>
		setShowThreshold( false );

	const handleChangeViewThreshold = ( viewThreshold ) =>
		setAttributes( {
			viewThreshold,
		} );

	return (
		<BlockControls>
			<ToolbarGroup label={ __( 'Current view', 'crowdsignal-forms' ) }>
				<ToolbarButton
					className="crowdsignal-forms-nps__toolbar-toggle"
					isActive={ currentView === views.RATING }
					label={ __( 'Rating', 'crowdsignal-forms' ) }
					onClick={ handleViewChange( views.RATING ) }
				>
					{ __( 'Rating', 'crowdsignal-forms' ) }
				</ToolbarButton>
				<ToolbarButton
					className="crowdsignal-forms-nps__toolbar-toggle"
					isActive={ currentView === views.FEEDBACK }
					label={ __( 'Feedback', 'crowdsignal-forms' ) }
					onClick={ handleViewChange( views.FEEDBACK ) }
				>
					{ __( 'Feedback', 'crowdsignal-forms' ) }
				</ToolbarButton>
			</ToolbarGroup>
			<ToolbarGroup>
				<ToolbarButton
					className="crowdsignal-forms-nps__toolbar-popover-button"
					icon="visibility"
					label={ __( 'Set view threshold', 'crowdsignal-forms' ) }
					onClick={ showThresholdPopover }
				>
					{ showThreshold && (
						<Popover onClose={ hideThresholdPopover }>
							<div className="crowdsignal-forms-nps__toolbar-popover">
								<TextControl
									label={ __( 'Show this block after n visits:', 'crowdsignal-forms' ) }
									value={ attributes.viewThreshold }
									onChange={ handleChangeViewThreshold }
									type="number"
								/>
							</div>
						</Popover>
					) }
				</ToolbarButton>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default PollToolbar;
