const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const CLIENT_DIR = path.resolve( __dirname, './client' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( env, argv );

	const { outputLibraryExport } = argv;

	return {
		...webpackConfig,
		output: {
			...webpackConfig.output,
			...( outputLibraryExport ? { libraryExport: outputLibraryExport } : {}),
		},
		resolve: {
			...webpackConfig.resolve,
			modules: [
				...webpackConfig.resolve.modules,
				CLIENT_DIR,
			],
		},
		plugins: [
			...webpackConfig.plugins.filter(
				( plugin ) =>
					plugin.constructor.name !== 'DependencyExtractionWebpackPlugin'
			),
			new DependencyExtractionWebpackPlugin( {
				injectPolyfill: true,
				requestToExternal: ( request ) => {
					if ( request === '@crowdsignalForms/apifetch' ) {
						return [ 'crowdsignalForms', 'apiFetch' ];
					}
				},
				requestToHandle: ( request ) => {
					// These values must match the names defined in class-crowdsignal-forms-blocks-assets.php
					if ( request === '@crowdsignalForms/apifetch' ) {
						return 'crowdsignal-forms-apifetch';
					}
				},
			} )
		]
	};
}

module.exports = getWebpackConfig;
