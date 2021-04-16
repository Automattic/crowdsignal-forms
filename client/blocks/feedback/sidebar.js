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
	Icon,
	PanelBody,
	TextControl,
} from '@wordpress/components';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	PanelColorSettings,
} from '@wordpress/block-editor';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import SignalIcon from 'components/icon/signal';
import SidebarPromote from 'components/sidebar-promote';
import { getTriggerStyles } from './util';

const Sidebar = ( {
	attributes,
	setAttributes,
	shouldPromote,
	signalWarning,
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
					label={ __( 'Title (optional)', 'crowdsignal-forms' ) }
					onChange={ handleChangeTitle }
					value={ decodeEntities(
						attributes.title || attributes.header
					) }
				/>
				{ shouldPromote && (
					<SidebarPromote signalWarning={ signalWarning } />
				) }
			</PanelBody>
			<PanelBody
				title={ __( 'Feedback Button', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<div className="crowdsignal-forms-feedback__trigger-settings">
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							onSelect={ handleSelectTriggerImage }
							value={ triggerBackgroundImageId }
							render={ ( { open } ) => (
								<React.Fragment>
									<Button
										className="crowdsignal-forms-feedback__trigger-settings-trigger"
										onClick={ open }
										style={ triggerStyles }
									>
										{ ! triggerBackgroundImage && (
											<Icon
												icon={ SignalIcon }
												size={ 70 }
											/>
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
								</React.Fragment>
							) }
						/>
					</MediaUploadCheck>
				</div>
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
		</InspectorControls>
	);
};

export default Sidebar;
