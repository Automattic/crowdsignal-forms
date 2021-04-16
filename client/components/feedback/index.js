/**
 * External dependencies
 */
import React, { useLayoutEffect, useState, useRef } from 'react';
import classnames from 'classnames';
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { RichText } from '@wordpress/block-editor';
import { Icon, Popover, TextControl, TextareaControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import SignalIcon from 'components/icon/signal';
import { getStyleVars, getTriggerStyles } from 'blocks/feedback/util';
import { withFallbackStyles } from 'components/with-fallback-styles';
import { getFeedbackButtonPosition } from './util';
import { updateFeedbackResponse } from 'data/feedback';
import { views } from 'blocks/feedback/constants';

const Feedback = ( { attributes, fallbackStyles, renderStyleProbe } ) => {
	const [ view, setView ] = useState( views.QUESTION );
	const [ active, setActive ] = useState( false );
	const [ feedback, setFeedback ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	const [ position, setPosition ] = useState( {} );

	const triggerButton = useRef( null );

	useLayoutEffect( () => {
		setPosition(
			getFeedbackButtonPosition(
				attributes.x,
				attributes.y,
				triggerButton.current.offsetWidth,
				triggerButton.current.offsetHeight,
				20,
				document.getElementById( 'page' )
			)
		);
	}, [ attributes.x, attributes.y, triggerButton.current ] );

	const handleSubmit = async () => {
		if ( ! isEmpty( feedback ) ) {
			updateFeedbackResponse( attributes.surveyId, {
				nonce: attributes.nonce,
				feedback,
				email,
			} );
		}

		setView( views.SUBMIT );
	};

	const showDialog = () => setActive( true );
	const hideDialog = () => setActive( false );

	const classes = classnames( 'crowdsignal-forms-feedback' );

	const triggerStyles = {
		...position,
		...getTriggerStyles( attributes ),
	};

	return (
		<>
			<div
				className={ classes }
				style={ getStyleVars( attributes, fallbackStyles ) }
			>
				<button
					ref={ triggerButton }
					className="crowdsignal-forms-feedback__trigger"
					onClick={ showDialog }
					style={ triggerStyles }
				>
					{ ! attributes.triggerBackgroundImage && <Icon icon={ SignalIcon } size={ 75 } /> }

					{ active && (
						<Popover
							className="crowdsignal-forms-feedback__popover-wrapper"
							onClose={ hideDialog }
						>
							{ view === views.QUESTION && (
								<div className="crowdsignal-forms-feedback__popover">
									<RichText.Content
										tagName="h3"
										className="crowdsignal-forms-feedback__header"
										value={ attributes.header }
									/>

									<TextareaControl
										className="crowdsignal-forms-feedback__input"
										rows={ 6 }
										placeholder={
											attributes.feedbackPlaceholder
										}
										value={ feedback }
										onChange={ setFeedback }
									/>

									<TextControl
										className="crowdsignal-forms-feedback__input"
										placeholder={
											attributes.emailPlaceholder
										}
										value={ email }
										onChange={ setEmail }
									/>

									<div className="wp-block-button crowdsignal-forms-feedback__button-wrapper">
										<button
											className="wp-block-button__link crowdsignal-forms-feedback__feedback-button"
											type="button"
											onClick={ handleSubmit }
										>
											{ attributes.submitButtonLabel }
										</button>
									</div>
								</div>
							) }

							{ view === views.SUBMIT && (
								<div className="crowdsignal-forms-feedback__popover">
									<RichText.Content
										tagName="h3"
										className="crowdsignal-forms-feedback__header"
										value={ attributes.submitText }
									/>
								</div>
							) }
						</Popover>
					) }
				</button>
			</div>

			{ renderStyleProbe() }
		</>
	);
};

export default withFallbackStyles( Feedback );
