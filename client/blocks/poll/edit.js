/**
 * External dependencies
 */
import React from 'react';
const { getComputedStyle } = window;

/**
 * WordPress dependencies
 */
import { withFallbackStyles } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { ClosedPollState } from './constants';
import EditPoll from './edit-poll';
import SideBar from './sidebar';
import Toolbar from './toolbar';
import {
	getNodeBackgroundColor,
	getStyleVars,
	getBlockCssClasses,
	isPollClosed,
} from './util';

/**
 * Retrieves default theme colors as they are when the component is loaded
 */
const fallbackStyles = withFallbackStyles( ( node ) => {
	const textNode = node.querySelector(
		'.wp-block-crowdsignal-forms-poll [contenteditable="true"]'
	);
	const buttonNode = node.querySelector(
		'.wp-block-crowdsignal-forms-poll__actions [contenteditable="true"]'
	);

	return {
		fallbackBackgroundColor: ! textNode
			? undefined
			: getNodeBackgroundColor( textNode ),
		fallbackTextColor: ! textNode
			? undefined
			: getComputedStyle( textNode ).color,
		fallbackSubmitButtonBackgroundColor: ! buttonNode
			? undefined
			: getNodeBackgroundColor( buttonNode ),
		fallbackSubmitButtonTextColor: ! buttonNode
			? undefined
			: getComputedStyle( buttonNode ).color,
	};
} );

const PollBlock = ( props ) => {
	const { attributes, className, isSelected } = props;

	const isClosed = isPollClosed(
		attributes.pollStatus,
		attributes.closedAfterDateTime
	);
	const showResults =
		isClosed && ClosedPollState.SHOW_RESULTS === attributes.closedPollState;
	const isHidden =
		isClosed && ClosedPollState.HIDDEN === attributes.closedPollState;

	return (
		<>
			<Toolbar { ...props } />
			<SideBar { ...props } />

			<div
				className={ getBlockCssClasses( attributes, className, {
					'is-selected-in-editor': isSelected,
					'is-closed': isClosed,
					'is-hidden': isHidden,
				} ) }
				style={ getStyleVars( attributes, props ) }
			>
				{ ! showResults && (
					<EditPoll
						{ ...props }
						isPollClosed={ isClosed }
						isPollHidden={ isHidden }
					/>
				) }
				{ showResults && (
					<div>
						TODO: Show Results
						<br />
						c/RTITc5kn-tr
					</div>
				) }
			</div>
		</>
	);
};

export default fallbackStyles( PollBlock );
