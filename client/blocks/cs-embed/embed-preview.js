/**
 * WordPress dependencies
 */
import { SandBox } from '@wordpress/components';
import { useBlockProps } from '@wordpress/block-editor';

export default function EmbedPreview( { html } ) {
	return (
		<div { ...useBlockProps() }>
			<SandBox html={ html } />
		</div>
	);
}
