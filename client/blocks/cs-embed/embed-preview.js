/**
 * WordPress dependencies
 */
import { SandBox } from '@wordpress/components';

export default function EmbedPreview( { html } ) {
	return <SandBox html={ html } />;
}
