<?php

class Crowdsignal_Forms_Unit_Tests_Bootstrap {
    /** @var Crowdsignal_Forms_Unit_Tests_Bootstrap instance */
    protected static $instance = null;

    /** @var string directory where wordpress-tests-lib is installed */
    public $wp_tests_dir;

    /** @var string testing directory */
    public $tests_dir;

    /** @var string plugin directory */
    public $plugin_dir;

    /**
     * Test bootstrap constructor.
     *
     * @since 1.0.0
     */
    public function __construct() {
        // phpcs:disable WordPress.PHP.DiscouragedPHPFunctions, WordPress.PHP.DevelopmentFunctions
        ini_set( 'display_errors', 'on' );
        error_reporting( E_ALL );

        // phpcs:enable WordPress.PHP.DiscouragedPHPFunctions, WordPress.PHP.DevelopmentFunctions
        // Ensure server variable is set for WP email functions.
        // phpcs:disable WordPress.VIP.SuperGlobalInputUsage.AccessDetected
        if ( ! isset( $_SERVER['SERVER_NAME'] ) ) {
            $_SERVER['SERVER_NAME'] = 'localhost';
        }

        // phpcs:enable WordPress.VIP.SuperGlobalInputUsage.AccessDetected
        $this->tests_dir                   = dirname( __FILE__ );
        $this->plugin_dir                  = dirname( $this->tests_dir );
        $this->wp_tests_dir                = getenv( 'WP_TESTS_DIR' ) ? getenv( 'WP_TESTS_DIR' ) : '/tmp/wordpress-tests-lib';

        if (
            ! file_exists( $this->wp_tests_dir . '/includes/functions.php' )
            || ! file_exists( $this->wp_tests_dir . '/includes/bootstrap.php' )
        ) {
            echo sprintf( 'WordPress testing library not found at %s', $this->wp_tests_dir ) . PHP_EOL;
            exit( 1 );
        }

        // load test function so tests_add_filter() is available
        require_once $this->wp_tests_dir . '/includes/functions.php';

        // load this plugin.
        tests_add_filter( 'muplugins_loaded', [ $this, 'load_plugin' ] );

        // install WC.
        tests_add_filter( 'setup_theme', [ $this, 'install_plugin' ] );

        // load the WP testing environment.
        require_once $this->wp_tests_dir . '/includes/bootstrap.php';

        $this->includes();
    }

    /**
     * Loads the plugin.
     *
     * @since 1.0.0
     */
    public function load_plugin() {
        require_once $this->plugin_dir . '/crowdsignal-forms.php';
    }

    /**
     * Sets up the plugin after everything is loaded.
     *
     * @since 1.0.0
     */
    public function install_plugin() {

        // Reload capabilities after install, see https://core.trac.wordpress.org/ticket/28374
        if ( version_compare( $GLOBALS['wp_version'], '4.7', '<' ) ) {
            $GLOBALS['wp_roles']->reinit();
        } else {
            $GLOBALS['wp_roles'] = null; // WPCS: override ok.
            wp_roles();
        }

    }
    /**
     * Load plugin-specific test cases and factories.
     *
     * @since 1.0.0
     */
    public function includes() {
        require_once $this->tests_dir . '/framework/class-crowdsignal-forms-unit-test-case.php';
    }

    /**
     * Get the single class instance.
     *
     * @since 1.0.0
     *
     * @return self
     */
    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }

        return self::$instance;
    }
}

Crowdsignal_Forms_Unit_Tests_Bootstrap::instance();
