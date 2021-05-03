/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';

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

	const handleSubmit = () => {
		setHeight( popover.current.offsetHeight );
		setView( views.SUBMIT );
	};

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
