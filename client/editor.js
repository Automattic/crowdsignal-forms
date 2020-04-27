/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import pollBlock from 'blocks/poll';

registerBlockType( 'crowdsignal-forms/poll', pollBlock );
