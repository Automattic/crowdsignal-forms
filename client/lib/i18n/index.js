/**
 * WordPress dependencies
 */
import {
	__ as wpTranslate,
	_n as wpTranslateN,
	sprintf as wpSprintf,
} from '@wordpress/i18n';

export const __ = ( text ) => wpTranslate( text, 'crowdsignal-forms' );

export const _n = ( singular, plural, count ) =>
	wpTranslateN( singular, plural, count, 'crowdsignal-forms' );

export const sprintf = wpSprintf;
