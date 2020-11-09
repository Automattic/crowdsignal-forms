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
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ChecklistMultipleChoiceIcon from 'components/icon/checklist-multiple-choice';
import ChecklistSingleChoiceIcon from 'components/icon/checklist-single-choice';
import { toggleButtonStyleAvailability } from './util';

const multipleChoiceControls = [
	{
		icon: ChecklistSingleChoiceIcon,
		title: __( 'Choose one answer', 'crowdsignal-forms' ),
		value: false,
	},
	{
		icon: ChecklistMultipleChoiceIcon,
		title: __( 'Choose multiple answers', 'crowdsignal-forms' ),
		value: true,
	},
];

const PollToolbar = ( { attributes, setAttributes } ) => {
	const multipleChoiceToolbar = map( multipleChoiceControls, ( button ) => ( {
		...button,
		isActive: button.value === attributes.isMultipleChoice,
		onClick: () => {
			setAttributes( { isMultipleChoice: button.value } );

			toggleButtonStyleAvailability( button.value );
		},
	} ) );

	return (
		<BlockControls>
			<Toolbar controls={ multipleChoiceToolbar } />
		</BlockControls>
	);
};

export default PollToolbar;
