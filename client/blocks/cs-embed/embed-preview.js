/**
 * WordPress dependencies
 */
import { Button, SandBox } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function EmbedPreview( { url } ) {
	// const html = '<p> this is placeholder html </p>';

	return (
		<div { ...useBlockProps() }>
			<figure className="wp-block-crowdsignal-forms-cs-embed wp-block-embed is-type-html is-provider-crowdsignal wp-block-embed-crowdsignal">
				<div className="wp-block-embed__wrapper">
					{ `\n${ url }\n` /* URL needs to be on its own line. */ }
				</div>
			</figure>
			Click preview to see this embed
			<Button
				variant="Primary"
				text={ __( 'Edit Link', 'crowdsignal-forms' ) }
			/>
		</div>
	);
}
