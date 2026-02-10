/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import {
	Button,
	DateTimePicker,
	ExternalLink,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SidebarPromote from 'components/sidebar-promote';
import { FeedbackStatus, FeedbackToggleMode } from './constants';

const Sidebar = ( {
	attributes,
	setAttributes,
	shouldPromote,
	signalWarning,
	email,
	resolvedSurveyId,
} ) => {
	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const surveyId = attributes.surveyId || resolvedSurveyId;
	const resultsUrl = `https://app.crowdsignal.com/surveys/${ surveyId }/report/overview`;

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
					{ surveyId
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
						disabled={ ! surveyId }
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
				<ToggleControl
					label={ __(
						'Send me responses via email',
						'crowdsignal-forms'
					) }
					checked={ attributes.emailResponses }
					onChange={ handleChangeAttribute( 'emailResponses' ) }
					help={
						attributes.emailResponses &&
						email &&
						sprintf(
							// translators: %s: email address
							__(
								'Responses will be sent to %s',
								'crowdsignal-forms'
							),
							email
						)
					}
				/>
				{ shouldPromote && (
					<SidebarPromote signalWarning={ signalWarning } />
				) }
			</PanelBody>
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
							value: FeedbackStatus.OPEN,
						},
						{
							label: __( 'Closed after', 'crowdsignal-forms' ),
							value: FeedbackStatus.CLOSED_AFTER,
						},
						{
							label: __( 'Closed', 'crowdsignal-forms' ),
							value: FeedbackStatus.CLOSED,
						},
					] }
					onChange={ handleChangeStatus }
					help={
						FeedbackStatus.CLOSED_AFTER === attributes.status &&
						null !== attributes.closedAfterDateTime &&
						new Date().toISOString() >
							attributes.closedAfterDateTime
							? 'Currently closed as date has passed'
							: ''
					}
				/>

				{ FeedbackStatus.CLOSED_AFTER === attributes.status && (
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

				<SelectControl
					value={ attributes.toggleOn }
					label={ __(
						'Show feedback form on:',
						'crowdsignal-forms'
					) }
					options={ [
						{
							label: __( 'Click', 'crowdsignal-forms' ),
							value: FeedbackToggleMode.CLICK,
						},
						{
							label: __( 'Hover', 'crowdsignal-forms' ),
							value: FeedbackToggleMode.HOVER,
						},
						{
							label: __( 'Page load', 'crowdsignal-forms' ),
							value: FeedbackToggleMode.PAGE_LOAD,
						},
					] }
					onChange={ handleChangeAttribute( 'toggleOn' ) }
				/>

				<ToggleControl
					label={ __( 'Require email address', 'crowdsignal-forms' ) }
					checked={ attributes.emailRequired }
					onChange={ handleChangeAttribute( 'emailRequired' ) }
				/>
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Feedback Button', 'crowdsignal-forms' ) }
				initialOpen={ false }
				colorSettings={ [
					{
						label: __( 'Background color', 'crowdsignal-forms' ),
						onChange: handleChangeAttribute(
							'triggerBackgroundColor'
						),
						value: attributes.triggerBackgroundColor,
					},
					{
						label: __( 'Text color', 'crowdsignal-forms' ),
						onChange: handleChangeAttribute( 'triggerTextColor' ),
						value: attributes.triggerTextColor,
					},
				] }
			>
				<ToggleControl
					label={ __( 'Hide Shadow', 'crowdsignal-forms' ) }
					checked={ attributes.hideTriggerShadow }
					onChange={ handleChangeAttribute( 'hideTriggerShadow' ) }
				/>
			</PanelColorSettings>
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
		</InspectorControls>
	);
};

export default Sidebar;
