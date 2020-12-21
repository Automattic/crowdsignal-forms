/**
 * External dependencies
 */
import React from 'react';
import { render } from 'react-dom';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import DialogWrapper from 'components/dialog-wrapper';
import NpsBlock from 'components/nps';

const NPS_VIEWS_STORAGE_PREFIX = `cs-nps-views-`;

window.addEventListener( 'load', () =>
	forEach(
		document.querySelectorAll( `div[data-crowdsignal-nps]` ),
		( element ) => {
			try {
				const attributes = JSON.parse( element.dataset.crowdsignalNps );
				const { surveyId, viewThreshold } = attributes;

				const key = `${ NPS_VIEWS_STORAGE_PREFIX }${ surveyId }`;
				const viewCount =
					1 + parseInt( window.localStorage.getItem( key ) || 0, 10 );

				window.localStorage.setItem( key, viewCount );

				// eslint-disable-next-line no-console
				console.log(
					`NPS block: Current view count: ${ viewCount }. Threshold: ${ viewThreshold }.` +
						`Use "localStorage.setItem( '${ key }', 0 );" to reset the counter.`
				);

				element.removeAttribute( 'data-crowdsignal-nps' );

				if ( viewCount !== viewThreshold ) {
					return;
				}

				const closeDialog = () => element.remove();

				render(
					<DialogWrapper onClose={ closeDialog }>
						<NpsBlock attributes={ attributes } />
					</DialogWrapper>,
					element
				);
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( error );
			}
		}
	)
);
