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

/**
 * Internal dependencies
 */
import CSLogo from '../../components/icon/cslogo';
import Sidebar from './sidebar';
import EmbedPreview from './embed-preview';

const EmbedForm = ( { attributes, isSelected, setAttributes } ) => {
	const url = attributes.url;
	// const {html, type, providerNameSlug } = { attributes };
	// const CS_TEMPLATE = ( 'core/embed', {type: 'html', providerNameSlug: 'crowdsignal'} );
	// return <InnerBlocks template={ CS_TEMPLATE } templateLock="all" />;
	return (
		<div { ...useBlockProps() }>
			<Sidebar />
			{ url && ! isSelected ? (
				<EmbedPreview url={ url } />
			) : (
				<Placeholder
					icon={ CSLogo }
					label={ __( 'Survey Embed', 'crowdsignal-forms' ) }
				>
					<TextControl
						label={ __(
							'Paste a link to the survey you want to display on your site.',
							'crowdsignal-forms'
						) }
						value={ url }
						onChange={ ( value ) =>
							setAttributes( { url: value } )
						}
					/>
					<div>
						<Button
							className="cs-embed__button"
							variant="primary"
							type="submit"
							label={ __( 'Embed', 'crowdsignal-forms' ) }
							text={ __( 'Embed', 'crowdsignal-forms' ) }
						></Button>
					</div>
					<ExternalLink href={ attributes.createLink }>
						{ attributes.createText }
					</ExternalLink>
				</Placeholder>
			) }
		</div>
	);
};
export default EmbedForm;
