const path = require( 'path' );
const webpackConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );

const CLIENT_DIR = path.resolve( __dirname, 'client' );

const baseResolveModules = webpackConfig.resolve.modules || [];

module.exports = function ( env, argv ) {
	const { outputLibrary } = argv;
	const librarySetup = outputLibrary
		? {
				library: [ 'crowdsignalForms', 'apiFetch' ],
				libraryTarget: 'window',
		  }
		: {};
	const config = {
		...webpackConfig,
		output: {
			...webpackConfig.output,
			...librarySetup,
		},
		resolve: {
			...webpackConfig.resolve,
			modules: [ ...baseResolveModules, CLIENT_DIR, 'node_modules' ],
		},
		plugins: [
			// this might be a little risky, but it's the only way to make the multiple builds not clear out each other's files
			new CleanWebpackPlugin( {
				cleanAfterEveryBuildPatterns: [],
				cleanStaleWebpackAssets: false,
				cleanOnceBeforeBuildPatterns: [],
			} ),
			...webpackConfig.plugins.filter(
				( plugin ) =>
					plugin.constructor.name !==
						'DependencyExtractionWebpackPlugin' &&
					plugin.constructor.name !== 'CleanWebpackPlugin'
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
			} ),
		],
		externals: {
			...webpackConfig.externals,
			jquery: 'jQuery',
			react: 'React',
			'react-dom': 'ReactDOM',
			lodash: 'lodash',
		},
	};

	return config;
};
