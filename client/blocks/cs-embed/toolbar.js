/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { BlockControls } from '@wordpress/block-editor';
/**
 * Local dependencies
 */
import Pencil from '../../components/icon/pencil';

const ToolbarControls = ( { setIsEditingURL } ) => (
	<>
		<BlockControls>
			<ToolbarGroup>
				<ToolbarButton
					className="components-toolbar__control"
					label={ __( 'Edit URL', 'crowdsignal-forms' ) }
					icon={ Pencil }
					onClick={ () => {
						setIsEditingURL( true );
					} }
				/>
			</ToolbarGroup>
		</BlockControls>
	</>
);

export default ToolbarControls;
