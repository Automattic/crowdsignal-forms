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
	PanelRow,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const Sidebar = ( link ) => {
	const refLink = link.attributes;
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Crowdsignal Settings', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<PanelRow>
					Edit your surveys on{ ' ' }
					<ExternalLink href={ refLink }>
						Crowdsignal.com
					</ExternalLink>
				</PanelRow>
				<PanelRow>
					<Button
						variant="secondary"
						href={ refLink }
						target="_blank"
						text={ __( 'Create Survey', 'crowdsignal-forms' ) }
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ __( 'Results', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<PanelRow>
					Manage your results on{ ' ' }
					<ExternalLink href={ refLink }>
						Crowdsignal.com
					</ExternalLink>
				</PanelRow>
				<PanelRow>
					<Button
						variant="secondary"
						href={ refLink }
						target="_blank"
						text={ __( 'View Results', 'crowdsignal-forms' ) }
					/>
				</PanelRow>
			</PanelBody>
		</InspectorControls>
	);
};

export default Sidebar;
