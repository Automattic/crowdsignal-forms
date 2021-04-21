/**
 * External dependencies
 */
import React, { useLayoutEffect, useRef, useState } from 'react';

/**
 * Internal dependencies
 */
import { views } from 'blocks/feedback/constants';
import FeedbackForm from './form';
import FeedbackSubmit from './submit';

const FeedbackPopover = ( { attributes } ) => {
	const [ view, setView ] = useState( views.QUESTION );
	const [ height, setHeight ] = useState( 'auto' );

	const popover = useRef( null );

	useLayoutEffect( () => {
		setHeight( popover.current.offsetHeight );
	}, [ popover.current ] );

	const handleSubmit = () => setView( views.SUBMIT );

	const styles = {
		height,
	};

	return (
		<div
			ref={ popover }
			className="crowdsignal-forms-feedback__popover"
			style={ styles }
		>
			{ view === views.QUESTION && (
				<FeedbackForm
					attributes={ attributes }
					onSubmit={ handleSubmit }
				/>
			) }
			{ view === views.SUBMIT && (
				<FeedbackSubmit attributes={ attributes } />
			) }
		</div>
	);
};

export default FeedbackPopover;
