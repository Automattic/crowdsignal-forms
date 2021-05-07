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
	SelectControl,
	TextControl,
	DateTimePicker,
} from '@wordpress/components';
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SidebarPromote from 'components/sidebar-promote';
import { NpsStatus } from './constants';

const Sidebar = ( {
	attributes,
	setAttributes,
	shouldPromote,
	signalWarning,
} ) => {
	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const resultsUrl = `https://app.crowdsignal.com/surveys/${ attributes.surveyId }/report/overview`;

	const handleChangeAttribute = ( attribute ) => ( value ) =>
		setAttributes( {
			[ attribute ]: value,
		} );

	const handleChangeStatus = ( status ) => setAttributes( { status } );

	const handleChangeCloseAfterDateTime = ( closedAfterDateTime ) => {
		const dateTime = new Date( closedAfterDateTime );
		setAttributes( { closedAfterDateTime: dateTime.toISOString() } );
	};

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
					<ExternalLink href="https://www.crowdsignal.com">
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
					label={ __( 'Title (optional)', 'crowdsignal-forms' ) }
					onChange={ handleChangeTitle }
					value={ decodeEntities( attributes.title ) }
				/>
				{ shouldPromote && (
					<SidebarPromote signalWarning={ signalWarning } />
				) }
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Block styling', 'crowdsignal-forms' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						label: __( 'Background color', 'crowdsignal-forms' ),
						onChange: handleChangeAttribute( 'backgroundColor' ),
						value: attributes.backgroundColor,
					},
					{
						label: __( 'Text color', 'crowdsignal-forms' ),
						onChange: handleChangeAttribute( 'textColor' ),
						value: attributes.textColor,
					},
					{
						label: __( 'Button color', 'crowdsignal-forms' ),
						onChange: handleChangeAttribute( 'buttonColor' ),
						value: attributes.buttonColor,
					},
					{
						label: __( 'Button text color', 'crowdsignal-forms' ),
						onChange: handleChangeAttribute( 'buttonTextColor' ),
						value: attributes.buttonTextColor,
					},
				] }
			/>
			<PanelBody
				title={ __( 'Settings', 'crowdsignal-forms' ) }
				initialOpen={ false }
			>
				<SelectControl
					value={ attributes.status }
					label={ __( 'Status', 'crowdsignal-forms' ) }
					options={ [
						{
							label: __( 'Open', 'crowdsignal-forms' ),
							value: NpsStatus.OPEN,
						},
						{
							label: __( 'Closed after', 'crowdsignal-forms' ),
							value: NpsStatus.CLOSED_AFTER,
						},
						{
							label: __( 'Closed', 'crowdsignal-forms' ),
							value: NpsStatus.CLOSED,
						},
					] }
					onChange={ handleChangeStatus }
					help={
						NpsStatus.CLOSED_AFTER === attributes.status &&
						null !== attributes.closedAfterDateTime &&
						new Date().toISOString() >
							attributes.closedAfterDateTime
							? 'Currently closed as date has passed'
							: ''
					}
				/>

				{ NpsStatus.CLOSED_AFTER === attributes.status && (
					<DateTimePicker
						currentDate={
							( attributes.closedAfterDateTime &&
								new Date( attributes.closedAfterDateTime ) ) ||
							new Date()
						}
						label={ __( 'Close on', 'crowdsignal-forms' ) }
						onChange={ handleChangeCloseAfterDateTime }
						is12Hour={ true }
					/>
				) }
			</PanelBody>
		</InspectorControls>
	);
};

export default Sidebar;
