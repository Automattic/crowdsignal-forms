/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	Button,
	ExternalLink,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

const Sidebar = ( { attributes, setAttributes } ) => {
	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const resultsUrl = `https://app.crowdsignal.com/surveys/${ attributes.surveyId }/report/overview`;

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Results', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<p>
					{ attributes.surveyId
						? __( 'Manage results on ', 'crowdsignal-forms' )
						: __(
								'Save the block to track results on ',
								'crowdsignal-forms'
						  ) }
					<ExternalLink
						href={
							attributes.surveyId
								? resultsUrl
								: 'https://www.crowdsignal.com'
						}
					>
						crowdsignal.com
					</ExternalLink>
				</p>
				<p>
					<Button
						isSecondary
						disabled={ ! attributes.surveyId }
						href={ resultsUrl }
						target="blank"
					>
						{ __( 'View results', 'crowdsignal-forms' ) }
					</Button>
				</p>

				<TextControl
					label={ __(
						'Title of the NPS block',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeTitle }
					value={ decodeEntities(
						attributes.title ?? attributes.ratingQuestion
					) }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default Sidebar;
