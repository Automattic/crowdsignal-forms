/**
 * WordPress dependencies
 */
import { Placeholder, Button, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
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

const EmbedForm = ( { attributes, isSelected, setAttributes } ) => {
	const [ isEditingURL, setIsEditingURL ] = useState( true );
	const [ url, setUrl ] = useState( attributes.url );
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

			//Gets our domains from cs-domains.js <some> requires a pure array so we have to call the array (ourDomains) from the object
			const isCrwodsignal = Domains.ourDomains.some( ( e ) => {
				if ( url.includes( e ) ) {
					return true;
				}
				return false;
			} );

			// The external oEmbed provider does not exist. We got no type info and no html.
			const badEmbedProvider =
				embedPreview?.html === false &&
				embedPreview?.type === undefined;

			const validPreview =
				!! embedPreview && ! badEmbedProvider && isCrwodsignal;
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
				<EmbedLoading />
			</View>
		);
	}

	return (
		<View>
			<Sidebar />
			<button onClick={ () => setIsEditingURL( true ) }> edit </button>
			{ ! fetching && preview && ! isEditingURL ? (
				<EmbedPreview html={ preview.html } />
			) : (
				<Placeholder
					icon={ CSLogo }
					label={ __( 'Survey Embed', 'crowdsignal-forms' ) }
				>
					{ cannotEmbed && (
						<span className="cs-embed__error">
							{ __(
								'Unable to embed, please check the URL and try again.',
								'crowdsignal-forms'
							) }
						</span>
					) }
					<form
						onSubmit={ ( event ) => {
							event.preventDefault();
							setIsEditingURL( false );
							setAttributes( { url } );
						} }
					>
						<input
							className="cs-embed__field"
							label={ __(
								'Paste a link to the survey you want to display on your site.',
								'crowdsignal-forms'
							) }
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

					<ExternalLink href={ attributes.createLink }>
						{ attributes.createText }
					</ExternalLink>
				</Placeholder>
			) }
		</View>
	);
};
export default EmbedForm;
