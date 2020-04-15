/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Poll from 'blocks/poll';
import EditPoll from 'blocks/poll/edit';

registerBlockType( 'crowdsignal-forms/poll', {
	title: 'Poll',
	category: 'widgets',
	example: {},
	edit: EditPoll,
	save: Poll,
} );
