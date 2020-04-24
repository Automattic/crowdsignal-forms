/**
 * Internal dependencies
 */
import EditPollBlock from './edit';
import SavePollBlock from './save';
import attributes from './attributes';

export default {
	title: 'Poll',
	category: 'widgets',
	attributes,
	edit: EditPollBlock,
	save: SavePollBlock,
};
