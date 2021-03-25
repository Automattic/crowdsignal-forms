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
								onClick={ () => onChangePosition( [ -1, 1 ] ) }
							>
								Top Left
							</Button>
							<Button
								onClick={ () => onChangePosition( [ -1, 0 ] ) }
							>
								Center Left
							</Button>
							<Button
								onClick={ () => onChangePosition( [ -1, -1 ] ) }
							>
								Bottom left
							</Button>
							<Button
								onClick={ () => onChangePosition( [ 1, 1 ] ) }
							>
								Top right
							</Button>
							<Button
								onClick={ () => onChangePosition( [ 1, 0 ] ) }
							>
								Center right
							</Button>
							<Button
								onClick={ () => onChangePosition( [ 1, -1 ] ) }
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
