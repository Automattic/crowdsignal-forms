export const ConfirmMessageType = Object.freeze( {
	THANK_YOU: 'thank-you',
	CUSTOM_TEXT: 'custom-text',
	REDIRECT: 'redirect',
	RESULTS: 'results',
} );

export const FontFamilyType = Object.freeze( {
	THEME_DEFAULT: 'theme-default',
	GEORGIA: 'georgia',
	PALATINO: 'palatino',
	TIMES_NEW_ROMAN: 'times-new-roman',
	ARIAL: 'arial',
	IMPACT: 'impact',
	LUCIDA: 'lucida',
	TAHOMA: 'tahoma',
	TREBUCHET: 'trebuchet',
	VERDANA: 'verdana',
	COURIER: 'courier',
} );

export const FontFamilyMap = Object.freeze( {
	[ FontFamilyType.THEME_DEFAULT ]: null,
	[ FontFamilyType.GEORGIA ]: 'Georgia, serif',
	[ FontFamilyType.PALATINO ]:
		'"Palatino Linotype", "Book Antiqua", Palatino, serif',
	[ FontFamilyType.TIMES_NEW_ROMAN ]: '"Times New Roman", Times, serif',
	[ FontFamilyType.ARIAL ]: 'Arial, Helvetica, sans-serif',
	[ FontFamilyType.IMPACT ]: 'Impact, Charcoal, sans-serif',
	[ FontFamilyType.LUCIDA ]:
		'"Lucida Sans Unicode", "Lucida Grande", sans-serif',
	[ FontFamilyType.TAHOMA ]: 'Tahoma, Geneva, sans-serif',
	[ FontFamilyType.TREBUCHET ]: '"Trebuchet MS", Helvetica, sans-serif',
	[ FontFamilyType.VERDANA ]: 'Verdana, Geneva, sans-serif',
	[ FontFamilyType.COURIER ]: '"Courier New", Courier, monospace',
} );

export const PollStatus = Object.freeze( {
	OPEN: 'open',
	CLOSED: 'closed',
	CLOSED_AFTER: 'closed-after',
} );

export const ClosedPollState = Object.freeze( {
	SHOW_RESULTS: 'show-results',
	SHOW_CLOSED_BANNER: 'show-closed-banner',
	HIDDEN: 'hidden',
} );

export const ConnectedAccountState = Object.freeze( {
	CONNECTED: 'connected',
	NOT_CONNECTED: 'not-connected',
	NOT_VERIFIED: 'not-verified',
} );
