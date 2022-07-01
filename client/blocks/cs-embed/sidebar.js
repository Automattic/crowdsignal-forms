/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { Button, PanelBody, PanelRow } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { createInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import SidebarPromote from 'components/sidebar-promote';

const Sidebar = ( { attributes, shouldPromote, signalWarning } ) => {
	const { editText, createText, dashboardLink } = attributes;
	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Crowdsignal Settings', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<div>{ editText }</div>
				<PanelRow>
					<Button
						variant="secondary"
						href={ dashboardLink }
						target="_blank"
						text={ createText }
					/>
				</PanelRow>
			</PanelBody>
			<PanelBody
				title={ __( 'Results', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<div>
					{ createInterpolateElement(
						__(
							'View results on <a>crowdsignal.com</a>',
							'crowdsignal-forms'
						),
						{
							a: (
								// eslint-disable-next-line jsx-a11y/anchor-has-content
								<a
									href={ dashboardLink }
									target="_blank"
									rel="external noreferrer noopener"
								/>
							),
						}
					) }
				</div>
				<PanelRow>
					<div>
						<Button
							variant="secondary"
							href={ dashboardLink }
							target="_blank"
							text={ __( 'View Results', 'crowdsignal-forms' ) }
						/>
					</div>
				</PanelRow>
			</PanelBody>

			{ shouldPromote && (
				<PanelBody title="" initialOpen={ true }>
					<PanelRow>
						<SidebarPromote signalWarning={ signalWarning } />
					</PanelRow>
				</PanelBody>
			) }
		</InspectorControls>
	);
};

export default Sidebar;
