/**
 * External dependencies
 */
import React, { useState } from 'react';

/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import {
	Button,
	Icon,
	Popover,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	TopLeftPlacementIcon,
	TopRightPlacementIcon,
	BottomLeftPlacementIcon,
	BottomRightPlacementIcon,
} from 'components/icon/placement';
import { views } from './constants';

const placementIcons = {
	'top-left': TopLeftPlacementIcon,
	'top-right': TopRightPlacementIcon,
	'bottom-left': BottomLeftPlacementIcon,
	'bottom-right': BottomRightPlacementIcon,
};

const FeedbackToolbar = ( { attributes, currentView, onChangePosition, onViewChange } ) => {
	const [ showPosition, setShowPosition ] = useState( false );

	const handleViewChange = ( view ) => () => onViewChange( view );

	const showPositionPopover = () => setShowPosition( true );
	const hidePositionPopover = () => setShowPosition( false );

	const { x, y } = attributes;

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
				<ToolbarButton
					className="crowdsignal-forms-feedback__toolbar-position-toggle"
					onClick={ showPositionPopover }
					icon={ placementIcons[ `${ y }-${ x }` ] }
				>
					{ showPosition && (
						<Popover
							className="crowdsignal-forms-feedback__toolbar-popover-wrapper"
							onClose={ hidePositionPopover }
						>
							<div className="crowdsignal-forms-feedback__toolbar-popover">
								<Button
									className="crowdsignal-forms-feedback__position-button"
									onClick={ () =>
										onChangePosition( 'left', 'top' )
									}
								>
									<Icon icon={ TopLeftPlacementIcon } />
								</Button>
								<Button
									className="crowdsignal-forms-feedback__position-button"
									onClick={ () =>
										onChangePosition( 'right', 'top' )
									}
								>
									<Icon icon={ TopRightPlacementIcon } />
								</Button>
								<Button
									className="crowdsignal-forms-feedback__position-button"
									onClick={ () =>
										onChangePosition( 'left', 'bottom' )
									}
								>
									<Icon icon={ BottomLeftPlacementIcon } />
								</Button>
								<Button
									className="crowdsignal-forms-feedback__position-button"
									onClick={ () =>
										onChangePosition( 'right', 'bottom' )
									}
								>
									<Icon icon={ BottomRightPlacementIcon } />
								</Button>
							</div>
						</Popover>
					) }
				</ToolbarButton>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default FeedbackToolbar;
