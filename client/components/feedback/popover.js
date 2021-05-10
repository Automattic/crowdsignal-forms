/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { views } from 'blocks/feedback/constants';
import FeedbackForm from './form';
import FeedbackSubmit from './submit';
import FooterBranding from 'components/footer-branding';

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
			{ ! attributes.hideBranding && (
				<FooterBranding
					trackRef="cs-forms-feedback"
					showLogo={ view === views.SUBMIT }
					message={ __(
						'Collect your own feedback with Crowdsignal',
						'crowdsignal-forms'
					) }
				/>
			) }
		</div>
	);
};

export default FeedbackPopover;
