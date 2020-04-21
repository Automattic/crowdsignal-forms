/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Poll from 'blocks/poll';
import EditPoll from 'blocks/poll/edit';
import attributes from 'blocks/poll/attributes';

registerBlockType( 'crowdsignal-forms/poll', {
	title: 'Poll',
	category: 'widgets',
	attributes,
	edit: EditPoll,
	save: Poll,
} );
