/**
 * External dependencies
 */
import React from 'react';
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { BlockControls } from '@wordpress/block-editor';
import { Toolbar } from '@wordpress/components';

/**
 * Internal dependencies
 */
import ChecklistMultipleChoiceIcon from 'components/icon/checklist-multiple-choice';
import ChecklistSingleChoiceIcon from 'components/icon/checklist-single-choice';
import { __ } from 'lib/i18n';

const multipleChoiceControls = [
	{
		icon: ChecklistSingleChoiceIcon,
		title: __( 'Radio (Choose one)' ),
		value: false,
	},
	{
		icon: ChecklistMultipleChoiceIcon,
		title: __( 'Checkbox (Choose many)' ),
		value: true,
	},
];

const PollToolbar = ( { attributes, setAttributes } ) => {
	const multipleChoiceToolbar = map( multipleChoiceControls, ( button ) => ( {
		...button,
		isActive: button.value === attributes.isMultipleChoice,
		onClick: () => setAttributes( { isMultipleChoice: button.value } ),
	} ) );

	return (
		<BlockControls>
			<Toolbar controls={ multipleChoiceToolbar } />
		</BlockControls>
	);
};

export default PollToolbar;
