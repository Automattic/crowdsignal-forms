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
	Popover,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';

const FeedbackToolbar = ( { onChangePosition } ) => {
	const [ showPosition, setShowPosition ] = useState( false );

	const showPositionPopover = () => setShowPosition( true );
	const hidePositionPopover = () => setShowPosition( false );

	return (
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton onClick={ showPositionPopover }>
					{ showPosition && (
						<Popover onClose={ hidePositionPopover }>
							<Button
								onClick={ () => onChangePosition( 'left', 'top' ) }
							>
								Top Left
							</Button>
							<Button
								onClick={ () => onChangePosition( 'left', 'center' ) }
							>
								Center Left
							</Button>
							<Button
								onClick={ () => onChangePosition( 'left', 'bottom' ) }
							>
								Bottom left
							</Button>
							<Button
								onClick={ () => onChangePosition( 'right', 'top' ) }
							>
								Top right
							</Button>
							<Button
								onClick={ () => onChangePosition( 'right', 'center' ) }
							>
								Center right
							</Button>
							<Button
								onClick={ () => onChangePosition( 'right', 'bottom' ) }
							>
								Bottom right
							</Button>
						</Popover>
					) }
				</ToolbarButton>
			</ToolbarGroup>
		</BlockControls>
	);
};

export default FeedbackToolbar;
