/**
 * External dependencies
 */
import React from 'react';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { Placeholder, Button, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { View } from '@wordpress/primitives';
/**
 * Internal dependencies
 */
import CSLogo from '../../components/icon/cslogo';
import Sidebar from './sidebar';
import EmbedPreview from './embed-preview';
import EmbedLoading from './embed-loading';
import Domains from './cs-domains';
import Toolbar from './toolbar';
import { STORE_NAME } from 'state';

const EmbedForm = ( { attributes, setAttributes } ) => {
	const [ isEditingURL, setIsEditingURL ] = useState( true );

	const {
		createText,
		createLink,
		embedMessage,
		placeholderTitle,
	} = attributes;

	const [ url, setUrl ] = useState( attributes.url );

	const accountInfo = useSelect( ( select ) =>
		select( STORE_NAME ).getAccountInfo()
	);

	const shouldPromote = get( accountInfo, [
		'signalCount',
		'shouldDisplay',
	] );

	const signalWarning =
		shouldPromote &&
		get( accountInfo, [ 'signalCount', 'count' ] ) >=
			get( accountInfo, [ 'signalCount', 'userLimit' ] );

	const { preview, fetching, cannotEmbed } = useSelect(
		( select ) => {
			const {
				getEmbedPreview,
				isPreviewEmbedFallback,
				isRequestingEmbedPreview,
			} = select( coreStore );
			if ( ! url ) {
				return { fetching: false, cannotEmbed: false };
			}

			const embedPreview = getEmbedPreview( url );
			const previewIsFallback = isPreviewEmbedFallback( url );

			//Gets our domains from cs-domains.js
			const isCrowdsignal = Domains.some( ( e ) => url.includes( e ) );

			// The external oEmbed provider does not exist. We got no type info and no html.
			const badEmbedProvider =
				embedPreview?.html === false &&
				embedPreview?.type === undefined;

			const validPreview =
				!! embedPreview && ! badEmbedProvider && isCrowdsignal;
			return {
				preview: validPreview ? embedPreview : undefined,
				fetching: isRequestingEmbedPreview( url ),
				cannotEmbed: ! validPreview || previewIsFallback,
			};
		},
		[ attributes.url ]
	);

	if ( fetching ) {
		return (
			<View>
				<Sidebar
					attributes={ attributes }
					shouldPromote={ shouldPromote }
					signalWarning={ signalWarning }
				/>
				<Toolbar setIsEditingURL={ setIsEditingURL } />
				<Placeholder>
					<EmbedLoading />
				</Placeholder>
			</View>
		);
	}

	return (
		<View>
			<Sidebar
				attributes={ attributes }
				shouldPromote={ shouldPromote }
				signalWarning={ signalWarning }
			/>
			<Toolbar setIsEditingURL={ setIsEditingURL } />
			{ ! fetching && preview && ! isEditingURL ? (
				<EmbedPreview html={ preview.html } />
			) : (
				<Placeholder icon={ CSLogo } label={ placeholderTitle }>
					<form
						onSubmit={ ( event ) => {
							event.preventDefault();
							setIsEditingURL( false );
							setAttributes( { url } );
						} }
					>
						<div className="cs-embed__instructions">
							{ embedMessage }
						</div>

						{ cannotEmbed && (
							<span className="cs-embed__error">
								{ __(
									'Unable to embed, please check the URL and try again.',
									'crowdsignal-forms'
								) }
							</span>
						) }
						<input
							className="cs-embed__field"
							label={ embedMessage }
							value={ url }
							onChange={ ( event ) =>
								setUrl( event.target.value )
							}
						/>
						<Button
							className="cs-embed__button"
							variant="primary"
							type="submit"
							label={ __( 'Embed', 'crowdsignal-forms' ) }
							text={ __( 'Embed', 'crowdsignal-forms' ) }
						></Button>
					</form>
					<ExternalLink
						href={ createLink }
						className="cs-embed__create-link"
					>
						{ createText }
					</ExternalLink>
				</Placeholder>
			) }
		</View>
	);
};
export default EmbedForm;
