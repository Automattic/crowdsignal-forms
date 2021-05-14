/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockAlignmentControl, {
	GRID,
} from 'components/block-alignment-control';
import { views } from './constants';

const FeedbackToolbar = ( {
	attributes,
	currentView,
	onViewChange,
	setAttributes,
} ) => {
	const handleViewChange = ( view ) => () => onViewChange( view );

	const handleSetPosition = ( row, column ) =>
		setAttributes( {
			x: column,
			y: row,
		} );

	return (
		<BlockControls>
			<ToolbarGroup label={ __( 'Current view', 'crowdsignal-forms' ) }>
				<ToolbarButton
					className="crowdsignal-forms-feedback__toolbar-toggle"
					isActive={ currentView === views.QUESTION }
					label={ __( 'Question', 'crowdsignal-forms' ) }
					onClick={ handleViewChange( views.QUESTION ) }
				>
					{ __( 'Question', 'crowdsignal-forms' ) }
				</ToolbarButton>
				<ToolbarButton
					className="crowdsignal-forms-feedback__toolbar-toggle"
					isActive={ currentView === views.SUBMIT }
					label={ __( 'Submit', 'crowdsignal-forms' ) }
					onClick={ handleViewChange( views.SUBMIT ) }
				>
					{ __( 'Submit', 'crowdsignal-forms' ) }
				</ToolbarButton>
			</ToolbarGroup>
			<ToolbarGroup>
				<BlockAlignmentControl
					closeOnSelectionChanged
					onChange={ handleSetPosition }
					label={ __(
						'Change button position',
						'crowdsignal-forms'
					) }
					value={ {
						row: attributes.y,
						column: attributes.x,
					} }
					{ ...GRID[ '2x3' ] }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default FeedbackToolbar;
