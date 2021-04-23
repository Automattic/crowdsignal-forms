/**
 * External dependencies
 */
import { isObject } from 'lodash';

const addFrameOffsets = ( offset, frame ) => {
	const body = document.body;

	return {
		left: offset.left + frame.x + window.scrollX,
		right:
			offset.right +
			( window.innerWidth > frame.left + frame.width
				? body.offsetWidth - frame.left - frame.width
				: 0 ),
		top: offset.top + frame.y + window.scrollY,
		bottom:
			offset.bottom +
			( window.innerHeight > frame.top + frame.height
				? body.offsetHeight - frame.top - frame.height
				: 0 ),
	};
};

const getFeedbackButtonHorizontalPosition = ( align, width, offset ) => {
	return {
		left: align === 'left' ? offset.left : null,
		right: align === 'right' ? offset.right : null,
	};
};

const getFeedbackButtonVerticalPosition = ( verticalAlign, height, offset ) => {
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
	frameElement = null
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
			frameElement.getBoundingClientRect()
		);
	}

	return {
		...getFeedbackButtonHorizontalPosition( align, width, offset ),
		...getFeedbackButtonVerticalPosition( verticalAlign, height, offset ),
	};
};
