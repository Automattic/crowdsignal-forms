/**
 * WordPress dependencies
 */
import { Button, SandBox } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

export default function EmbedPreview( { html } ) {
	// const html = '<p> this is placeholder html </p>';

	return (
		<div { ...useBlockProps() }>
			<SandBox html={ html } />
			Click preview to see this embed
			<Button
				variant="Primary"
				text={ __( 'Edit Link', 'crowdsignal-forms' ) }
			/>
		</div>
	);
}
