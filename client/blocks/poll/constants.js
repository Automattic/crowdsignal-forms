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
	// Google fonts:  enum value = google font url slug
	CABIN: 'Cabin',
	CHIVO: 'Chivo',
	OPEN_SANS: 'Open+Sans',
	FIRA_SANS: 'Fira+Sans',
	ROBOTO: 'Roboto',
	NUNITO: 'Nunito',
	OVERPASS: 'Overpass',
	LATO: 'Lato',
	LIBRE_FRANKLIN: 'Libre+Franklin',
	MONTSERRAT: 'Montserrat',
	POPPINS: 'Poppins',
	RUBIK: 'Rubik',
	RALEWAY: 'Raleway',
	JOSEFIN_SANS: 'Josefin+Sans',
	ALEGREYA_SANS: 'Alegreya+Sans',
	OSWALD: 'Oswald',
} );

export const GoogleFonts = Object.freeze( [
	FontFamilyType.CABIN,
	FontFamilyType.CHIVO,
	FontFamilyType.OPEN_SANS,
	FontFamilyType.FIRA_SANS,
	FontFamilyType.ROBOTO,
	FontFamilyType.NUNITO,
	FontFamilyType.OVERPASS,
	FontFamilyType.LATO,
	FontFamilyType.LIBRE_FRANKLIN,
	FontFamilyType.MONTSERRAT,
	FontFamilyType.POPPINS,
	FontFamilyType.RUBIK,
	FontFamilyType.RALEWAY,
	FontFamilyType.JOSEFIN_SANS,
	FontFamilyType.ALEGREYA_SANS,
	FontFamilyType.OSWALD,
] );

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
	[ FontFamilyType.CABIN ]: '"Cabin", sans-serif',
	[ FontFamilyType.CHIVO ]: '"Chivo", sans-serif',
	[ FontFamilyType.OPEN_SANS ]: '"Open Sans", sans-serif',
	[ FontFamilyType.FIRA_SANS ]: '"Fira Sans", sans-serif',
	[ FontFamilyType.ROBOTO ]: '"Roboto", sans-serif',
	[ FontFamilyType.NUNITO ]: '"Nunito", sans-serif',
	[ FontFamilyType.OVERPASS ]: '"Overpass", sans-serif',
	[ FontFamilyType.LATO ]: '"Lato", sans-serif',
	[ FontFamilyType.LIBRE_FRANKLIN ]: '"Libre Franklin", sans-serif',
	[ FontFamilyType.MONTSERRAT ]: '"Montserrat", sans-serif',
	[ FontFamilyType.POPPINS ]: '"Poppins", sans-serif',
	[ FontFamilyType.RUBIK ]: '"Rubik", sans-serif',
	[ FontFamilyType.RALEWAY ]: '"Raleway", sans-serif',
	[ FontFamilyType.JOSEFIN_SANS ]: '"Josefin Sans", sans-serif',
	[ FontFamilyType.ALEGREYA_SANS ]: '"Alegreya Sans", sans-serif',
	[ FontFamilyType.OSWALD ]: '"Oswald", sans-serif',
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

export const AnswerStyle = Object.freeze( {
	RADIO: 'radio',
	BUTTON: 'button',
} );

export const ButtonAlignment = Object.freeze( {
	LIST: 'list',
	INLINE: 'inline',
} );
