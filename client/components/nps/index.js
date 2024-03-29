/**
 * External dependencies
 */
import React, { useState } from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { views } from 'blocks/nps/constants';
import { getStyleVars } from 'blocks/nps/util';
import FooterBranding from 'components/footer-branding';
import { withFallbackStyles } from 'components/with-fallback-styles';
import NpsFeedback from './feedback';
import NpsRating from './rating';

const Nps = ( {
	attributes,
	contentWidth,
	fallbackStyles,
	onClose,
	renderStyleProbe,
} ) => {
	const [ responseMeta, setResponseMeta ] = useState( null );
	const [ view, setView ] = useState( views.RATING );

	const handleRatingSubmit = () => setView( views.FEEDBACK );

	const handleFeedbackSubmit = () => setView( views.SUBMIT );

	const questionText = get(
		{
			[ views.FEEDBACK ]: attributes.feedbackQuestion,
			[ views.RATING ]: attributes.ratingQuestion,
			[ views.SUBMIT ]: __(
				'Thanks so much for your feedback!',
				'crowdsignal-forms'
			),
		},
		[ view ]
	);

	const style = {
		width: `${ contentWidth }px`,
		...getStyleVars( attributes, fallbackStyles ),
	};

	return (
		<>
			<div className="crowdsignal-forms-nps" style={ style }>
				<h3
					className="crowdsignal-forms-nps__question"
					style={ { whiteSpace: 'pre-wrap' } }
				>
					{ decodeEntities( questionText )
						.split( '<br>' )
						.join( '\n' ) }
				</h3>

				<button
					className="crowdsignal-forms-nps__close-button"
					onClick={ onClose }
				>
					✕
				</button>

				{ view === views.RATING && (
					<NpsRating
						attributes={ attributes }
						onSubmit={ handleRatingSubmit }
						onSubmitSuccess={ setResponseMeta }
					/>
				) }

				{ view === views.FEEDBACK && (
					<NpsFeedback
						attributes={ attributes }
						responseMeta={ responseMeta }
						onSubmit={ handleFeedbackSubmit }
					/>
				) }

				{ ! attributes.hideBranding && (
					<FooterBranding
						showLogo={ view === views.SUBMIT }
						message={ __(
							'Collect your own feedback with Crowdsignal',
							'crowdsignal-forms'
						) }
						trackRef="cs-forms-nps"
					/>
				) }
			</div>

			{ renderStyleProbe() }
		</>
	);
};

export default withFallbackStyles( Nps );
