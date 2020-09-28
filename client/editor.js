/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import pollBlock from 'blocks/poll';
import voteBlock from 'blocks/vote';
import voteItemBlock from 'blocks/vote-item';
import applauseBlock from 'blocks/applause';

registerBlockType( 'crowdsignal-forms/poll', pollBlock );
registerBlockType( 'crowdsignal-forms/vote', voteBlock );
registerBlockType( 'crowdsignal-forms/vote-item', voteItemBlock );
registerBlockType( 'crowdsignal-forms/applause', applauseBlock );
