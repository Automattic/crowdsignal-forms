/**
 * External dependencies
 */
import { isObject } from 'lodash';

const addFrameOffsets = ( offset, frame, win = window ) => ( {
	left: offset.left + frame.x + win.scrollX,
	right:
		offset.right +
		( win.innerWidth > frame.left + frame.width
			? win.innerWidth - frame.left - frame.width
			: 0 ),
	top: offset.top + frame.y + win.scrollY,
	bottom:
		offset.bottom +
		( win.innerHeight > frame.top + frame.height
			? win.innerHeight - frame.top - frame.height
			: 0 ),
} );

const getFeedbackButtonHorizontalPosition = ( align, width, offset ) => {
	return {
		left: align === 'left' ? offset.left : null,
		right: align === 'right' ? offset.right : null,
	};
};

const getFeedbackButtonVerticalPosition = ( verticalAlign, height, offset, win = window ) => {
	if ( verticalAlign === 'center' ) {
		return {
			top: ( win.innerHeight - height ) / 2,
			bottom: null,
		};
	}

	return {
		top: verticalAlign === 'top' ? offset.top : null,
		bottom: verticalAlign === 'bottom' ? offset.bottom : null,
	};
};

export const getFeedbackButtonPosition = (
	align,
	verticalAlign,
	width,
	height,
	padding,
	frameElement = null,
	win = window
) => {
	let offset = {
		left: isObject( padding ) ? padding.left : padding,
		right: isObject( padding ) ? padding.right : padding,
		top: isObject( padding ) ? padding.top : padding,
		bottom: isObject( padding ) ? padding.bottom : padding,
	};

	if ( frameElement ) {
		offset = addFrameOffsets(
			offset,
			frameElement.getBoundingClientRect(),
			win
		);
	}

	return {
		...getFeedbackButtonHorizontalPosition( align, width, offset ),
		...getFeedbackButtonVerticalPosition( verticalAlign, height, offset, win ),
	};
};
