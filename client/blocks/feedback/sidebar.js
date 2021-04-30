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
	Icon,
	PanelBody,
	SelectControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	PanelColorSettings,
} from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SignalIcon from 'components/icon/signal';
import SidebarPromote from 'components/sidebar-promote';
import { getTriggerStyles } from './util';
import { FeedbackStatus } from './constants';

const Sidebar = ( {
	attributes,
	setAttributes,
	shouldPromote,
	signalWarning,
	email,
} ) => {
	const { triggerBackgroundImage, triggerBackgroundImageId } = attributes;

	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const resultsUrl = `https://app.crowdsignal.com/surveys/${ attributes.surveyId }/report/overview`;

	const handleChangeAttribute = ( attribute ) => ( value ) =>
		setAttributes( {
			[ attribute ]: value,
		} );

	const handleSelectTriggerImage = ( media ) => {
		setAttributes( {
			triggerBackgroundImageId: media.id,
			triggerBackgroundImage: media.url,
		} );
	};

	const clearTriggerImage = () =>
		setAttributes( {
			triggerBackgroundImageId: 0,
			triggerBackgroundImage: '',
		} );

	const triggerStyles = getTriggerStyles( attributes );

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
				title={ __( 'Feedback Button', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<MediaUploadCheck>
					<MediaUpload
						allowedTypes={ [ 'image' ] }
						onSelect={ handleSelectTriggerImage }
						value={ triggerBackgroundImageId }
						render={ ( { open } ) => (
							<div className="crowdsignal-forms-feedback__trigger-settings">
								<Button
									className="crowdsignal-forms-feedback__trigger-settings-trigger"
									onClick={ open }
									style={ triggerStyles }
								>
									{ ! triggerBackgroundImage && (
										<Icon icon={ SignalIcon } size={ 70 } />
									) }
								</Button>

								<Button isSecondary onClick={ open }>
									{ __(
										'Upload Image',
										'crowdsignal-forms'
									) }
								</Button>

								<Button onClick={ clearTriggerImage }>
									{ __( 'Clear', 'crowdsignal-forms' ) }
								</Button>
							</div>
						) }
					/>
				</MediaUploadCheck>
				<ToggleControl
					label={ __( 'Hide Shadow', 'crowdsignal-forms' ) }
					checked={ attributes.hideTriggerShadow }
					onChange={ handleChangeAttribute( 'hideTriggerShadow' ) }
				/>
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
			</PanelBody>
		</InspectorControls>
	);
};

export default Sidebar;
