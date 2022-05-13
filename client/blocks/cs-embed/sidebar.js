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
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import {
	InspectorControls,
	URLInput,
	PanelColorSettings,
	ContrastChecker,
} from '@wordpress/block-editor';
import { includes } from 'lodash';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */

import SidebarPromote from 'components/sidebar-promote';

const Sidebar = () => {
return (
	<InspectorControls>
			<PanelBody
			title={ __( 'Crowdsignal Settings', 'crowdsignal-forms' ) }
				initialOpen={ true }
		>
			<PanelRow>
				Edit your surveys on <ExternalLink href="https://app.crowdsignal.com">Crowdsignal.com</ExternalLink>
			</PanelRow>
			<PanelRow>
				<Button 
				variant="secondary" 
				href="app.crowdsignal.com"
				target="_blank"
				text={ __( "Create Survey", "crowdsignal-forms" ) }
				/>
			</PanelRow>
		</PanelBody>
		<PanelBody
			title={ __( 'Results', 'crowdsignal-forms' ) }
				initialOpen={ true }
		>
			<PanelRow>
				Manage your results on <ExternalLink href="https://app.crowdsignal.com">Crowdsignal.com</ExternalLink>
			</PanelRow>
			<PanelRow>
				<Button 
				variant="secondary" 
				href="app.crowdsignal.com"
				target="_blank"
				text={ __( "View Results", "crowdsignal-forms" ) }
				/>
			</PanelRow>
		</PanelBody>
	</InspectorControls>
)
};

export default Sidebar;