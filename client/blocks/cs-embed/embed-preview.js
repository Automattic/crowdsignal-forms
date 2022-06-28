/**
 * WordPress dependencies
 */
import { SandBox } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

export default function EmbedPreview( { html } ) {
	// const html = '<p> this is placeholder html </p>';

	return (
		<div { ...useBlockProps() }>
			<SandBox html={ html } />
		</div>
	);
}
