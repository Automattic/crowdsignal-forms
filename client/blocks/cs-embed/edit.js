/**
 * WordPress dependencies
 */
import {
	TextControl,
	Placeholder,
	Button,
	ExternalLink,
} from '@wordpress/components';
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

const EmbedForm = ( { attributes, isSelected, setAttributes } ) => {
	const [ isEditingURL, setIsEditingURL ] = useState( true );
	const [url, setUrl] = useState( attributes.url );
	const {
		preview,
		fetching,
		themeSupportsResponsive,
		cannotEmbed,
	} = useSelect(
		( select ) => {
			const {
				getEmbedPreview,
				isPreviewEmbedFallback,
				isRequestingEmbedPreview,
				getThemeSupports,
			} = select( coreStore );
			if ( ! url ) {
				return { fetching: false, cannotEmbed: false };
			}

			const embedPreview = getEmbedPreview( url );
			const previewIsFallback = isPreviewEmbedFallback( url );

			// The external oEmbed provider does not exist. We got no type info and no html.
			const badEmbedProvider =
				embedPreview?.html === false &&
				embedPreview?.type === undefined;
			// Some WordPress URLs that can't be embedded will cause the API to return
			// a valid JSON response with no HTML and `data.status` set to 404, rather
			// than generating a fallback response as other embeds do.
			const wordpressCantEmbed = embedPreview?.data?.status === 404;
			const validPreview =
				!! embedPreview && ! badEmbedProvider && ! wordpressCantEmbed;
			return {
				preview: validPreview ? embedPreview : undefined,
				fetching: isRequestingEmbedPreview( url ),
				themeSupportsResponsive: getThemeSupports()[
					'responsive-embeds'
				],
				cannotEmbed: ! validPreview || previewIsFallback,
			};
		},
		[ url ]
	);
	// console.log('html');
	// if ( preview) {
	// 	console.log( preview.html );
	// } else {
	// 	console.log( 'no data' );
	// }
	if ( fetching && ! isSelected ) {
		return <View>{ ! isSelected ? <EmbedLoading /> : null }</View>;
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
					<form
						onSubmit={ ( event ) => {
							event.preventDefault();
							setIsEditingURL( false );
							setAttributes( { url } );
						} }
					>
						<input
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
