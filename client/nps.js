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
import { NpsStatus } from 'blocks/nps/constants';

const NPS_VIEWS_STORAGE_PREFIX = `cs-nps-views-`;

window.addEventListener( 'load', () =>
	forEach(
		document.querySelectorAll( `div[data-crowdsignal-nps]` ),
		( element ) => {
			try {
				const attributes = JSON.parse( element.dataset.crowdsignalNps );
				const viewThreshold = parseInt( attributes.viewThreshold, 10 );

				element.removeAttribute( 'data-crowdsignal-nps' );

				if ( NpsStatus.CLOSED === attributes.status ) {
					return;
				}

				if (
					NpsStatus.CLOSED_AFTER === attributes.status &&
					null !== attributes.closedAfterDateTime &&
					new Date().toISOString() > attributes.closedAfterDateTime
				) {
					return;
				}

				if ( ! attributes.isPreview ) {
					const key = `${ NPS_VIEWS_STORAGE_PREFIX }${ attributes.surveyId }`;
					const viewCount =
						1 +
						parseInt( window.localStorage.getItem( key ) || 0, 10 );

					window.localStorage.setItem( key, viewCount );

					// eslint-disable-next-line no-console
					console.log(
						`NPS block: Current view count: ${ viewCount }. Threshold: ${ viewThreshold }.` +
							`Use "localStorage.setItem( '${ key }', 0 );" to reset the counter.`
					);

					if ( viewCount !== viewThreshold ) {
						return;
					}
				}

				const closeDialog = () => element.remove();

				render(
					<DialogWrapper onClose={ closeDialog }>
						<NpsBlock
							attributes={ attributes }
							contentWidth={ element.scrollWidth }
							onClose={ closeDialog }
						/>
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
