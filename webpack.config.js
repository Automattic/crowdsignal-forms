const path = require( 'path' );
const getBaseWebpackConfig = require( '@automattic/calypso-build/webpack.config.js' );

const CLIENT_DIR = path.resolve( __dirname, './client' );

function getWebpackConfig( env, argv ) {
	const webpackConfig = getBaseWebpackConfig( env, argv );

	return {
		...webpackConfig,
		resolve: {
			...webpackConfig.resolve,
			modules: [
				...webpackConfig.resolve.modules,
				CLIENT_DIR,
			],
		},
	};
}

module.exports = getWebpackConfig;
