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

/**
 * Internal dependencies
 */
import { __ } from 'lib/i18n';

const SideBar = ( { attributes, setAttributes, viewResultsUrl } ) => {
	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const resultsLinkEnabled = '' !== viewResultsUrl;

	return (
		<InspectorControls>
			<PanelBody title={ __( 'Results' ) } initialOpen={ true }>
				<p>
					{ resultsLinkEnabled
						? __( 'Manage results on ' )
						: __( 'Publish this post to enable results on ' ) }
					<ExternalLink
						href={
							resultsLinkEnabled
								? viewResultsUrl
								: 'https://www.crowdsignal.com'
						}
					>
						crowdsignal.com
					</ExternalLink>
				</p>
				<p>
					<Button
						href={ viewResultsUrl }
						isSecondary
						target="_blank"
						disabled={ ! resultsLinkEnabled }
					>
						{ __( 'View results' ) }
					</Button>
				</p>

				<TextControl
					value={ attributes.title ?? __( 'Vote block' ) }
					label={ __( 'Title of the vote block' ) }
					onChange={ handleChangeTitle }
				/>
			</PanelBody>
		</InspectorControls>
	);
};

export default SideBar;
