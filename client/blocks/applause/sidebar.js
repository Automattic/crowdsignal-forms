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
	SelectControl,
	TimePicker,
} from '@wordpress/components';
import { InspectorControls, PanelColorSettings } from '@wordpress/block-editor';
import { includes } from 'lodash';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { PollStatus } from './constants';
import SidebarPromote from 'components/sidebar-promote';

const SideBar = ( {
	attributes,
	setAttributes,
	viewResultsUrl,
	shouldPromote,
	signalWarning,
} ) => {
	const handleChangeTitle = ( title ) => setAttributes( { title } );

	const resultsLinkEnabled = '' !== viewResultsUrl;

	const handleChangePollStatus = ( pollStatus ) => {
		if ( ! includes( PollStatus, pollStatus ) ) {
			return;
		}

		// closedAfterDateTime MUST be set when pollStatus is set to CLOSED_AFTER
		setAttributes( {
			closedAfterDateTime:
				pollStatus === PollStatus.CLOSED_AFTER
					? new Date(
							new Date().getTime() + 24 * 60 * 60 * 1000
					  ).toISOString()
					: null,
			pollStatus,
		} );
	};

	const handleChangeCloseAfterDateTime = ( closedAfterDateTime ) => {
		const dateTime = new Date( closedAfterDateTime );
		setAttributes( { closedAfterDateTime: dateTime.toISOString() } );
	};

	const handleChangeTextColor = ( textColor ) =>
		setAttributes( { textColor } );

	const handleChangeBackgroundColor = ( backgroundColor ) =>
		setAttributes( { backgroundColor } );

	const handleChangeBorderColor = ( borderColor ) =>
		setAttributes( { borderColor } );

	return (
		<InspectorControls>
			<PanelBody
				title={ __( 'Results', 'crowdsignal-forms' ) }
				initialOpen={ true }
			>
				<p>
					{ resultsLinkEnabled
						? __( 'Manage results on ', 'crowdsignal-forms' )
						: __(
								'Publish this post to enable results on ',
								'crowdsignal-forms'
						  ) }
					<ExternalLink href="https://www.crowdsignal.com">
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
						{ __( 'View results', 'crowdsignal-forms' ) }
					</Button>
				</p>

				<TextControl
					value={ attributes.title }
					label={ __(
						'Title of the applause block',
						'crowdsignal-forms'
					) }
					onChange={ handleChangeTitle }
				/>
				{ shouldPromote && (
					<SidebarPromote signalWarning={ signalWarning } />
				) }
			</PanelBody>
			<PanelBody title={ __( 'Status', 'crowdsignal-forms' ) }>
				<SelectControl
					value={ attributes.pollStatus }
					label={ __( 'Currently', 'crowdsignal-forms' ) }
					options={ [
						{
							label: __( 'Open', 'crowdsignal-forms' ),
							value: PollStatus.OPEN,
						},
						{
							label: __( 'Closed after', 'crowdsignal-forms' ),
							value: PollStatus.CLOSED_AFTER,
						},
						{
							label: __( 'Closed', 'crowdsignal-forms' ),
							value: PollStatus.CLOSED,
						},
					] }
					onChange={ handleChangePollStatus }
				/>
				{ PollStatus.CLOSED_AFTER === attributes.pollStatus && (
					<TimePicker
						currentTime={ attributes.closedAfterDateTime }
						label={ __(
							'Close applause block on',
							'crowdsignal-forms'
						) }
						onChange={ handleChangeCloseAfterDateTime }
						is12Hour={ true }
					/>
				) }
			</PanelBody>
			<PanelColorSettings
				title={ __( 'Styling', 'crowdsignal-forms' ) }
				initialOpen={ true }
				colorSettings={ [
					{
						value: attributes.textColor,
						onChange: handleChangeTextColor,
						label: __( 'Text color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.backgroundColor,
						onChange: handleChangeBackgroundColor,
						label: __( 'Background color', 'crowdsignal-forms' ),
					},
					{
						value: attributes.borderColor,
						onChange: handleChangeBorderColor,
						label: __( 'Border color', 'crowdsignal-forms' ),
					},
				] }
			></PanelColorSettings>
		</InspectorControls>
	);
};

export default SideBar;
