/**
 * External dependencies
 */
import React, { useRef } from 'react';

const DialogWrapper = ( { children, onClose } ) => {
	const wrapper = useRef( null );

	const handleClose = ( event ) =>
		event.target === wrapper.current && onClose();

	return (
		// eslint-disable-next-line
		<div
			ref={ wrapper }
			role="dialog"
			aria-modal="true"
			className="crowdsignal-forms-dialog-wrapper"
			onClick={ handleClose }
		>
			{ children }
		</div>
	);
};

export default DialogWrapper;
