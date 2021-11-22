<?php
/**
 * File containing the class Crowdsignal_Forms\Admin\Crowdsignal_Forms_Settings.
 *
 * @package Crowdsignal_Forms\Admin
 * @since   0.9.0
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles the management of plugin settings.
 *
 * @since 0.9.0
 */
class Crowdsignal_Forms_Settings {

	/**
	 * Our Settings.
	 *
	 * @var array Settings.
	 */
	protected $settings = array();

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->settings_group = 'crowdsignal-forms';
		add_action( 'admin_init', array( $this, 'update_settings' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 12 );
	}

	/**
	 * Enqueues scripts for setup page.
	 */
	public function admin_enqueue_scripts() {
		wp_enqueue_style( 'admin-styles', plugin_dir_url( __FILE__ ) . '/admin-styles.css', array(), '1.5.12' );
	}

	/**
	 * Get Crowdsignal Settings
	 *
	 * @return array
	 */
	public function get_settings() {
		if ( 0 === count( $this->settings ) ) {
			$this->init_settings();
		}
		return $this->settings;
	}

	/**
	 * Initializes the configuration for the plugin's setting fields.
	 *
	 * @access protected
	 */
	protected function init_settings() {

		$this->settings = apply_filters(
			'crowdsignal_forms_settings',
			array(
				'general' => array(
					__( 'General', 'crowdsignal-forms' ),
					array(
						array(
							'name'       => 'crowdsignal_api_key',
							'std'        => '',
							'label'      => __( 'Enter Crowdsignal API Key', 'crowdsignal-forms' ),
							'attributes' => array(),
						),
					),
				),
			)
		);
	}

	/**
	 * Registers the plugin's settings with WordPress's Settings API.
	 */
	public function register_settings() {
		$this->init_settings();

		foreach ( $this->settings as $section ) {
			foreach ( $section[1] as $option ) {
				if ( isset( $option['std'] ) ) {
					add_option( $option['name'], $option['std'] );
				}
				register_setting( $this->settings_group, $option['name'] );
			}
		}
	}

	/**
	 * Disconnect from Crowdsignal if required.
	 */
	public function update_settings() {
		if ( ! isset( $_GET['page'] ) || 'crowdsignal-forms-settings' !== $_GET['page'] ) {
			return;
		}

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if (
			isset( $_POST['action'] ) &&
			isset( $_POST['crowdsignal_api_key'] ) &&
			isset( $_POST['_wpnonce'] )
		) {
			$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();
			if ( 'update' === $_POST['action'] ) {
				if ( wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'add-api-key' ) ) {
					$api_key = sanitize_key( wp_unslash( $_POST['crowdsignal_api_key'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Missing -- got_api_key
					if ( ! empty( $api_key ) && $api_auth_provider->get_user_code_for_key( $api_key ) ) {
						$api_auth_provider->set_api_key( $api_key );
						wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=api-key-added' ) );
					} else {
						wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=api-key-not-added' ) );
					}
				} else {
					wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=bad-nonce' ) );
				}
			} elseif ( 'disconnect' === $_POST['action'] ) {
				if ( ! wp_verify_nonce( sanitize_key( $_POST['_wpnonce'] ), 'disconnect-api-key' ) ) {
					wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=disconnect-failed' ) );
				} else {
					$api_auth_provider->delete_api_key();
					$api_auth_provider->delete_user_code();
					wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=disconnected' ) );
				}
			}
		}
	}

	/**
	 * Shows the plugin's settings page.
	 */
	public function output() {
		$this->init_settings();
		include dirname( __FILE__ ) . '/views/html-admin-setup-header.php';
		?>
		<div class="crowdsignal-settings-wrap">

			<div class="crowdsignal-settings__main-content">
				<div class="dops-card dops-section-header is-compact">
					<div class="dops-section-header__label">
						<span class="dops-section-header__label-text">Settings</span>
					</div>
				</div>

				<div class="dops-card dops-section-header is-compact">

					<div class="crowdsignal-settings__middle">
						<div class="crowdsignal-settings__text">
							<?php
								echo wp_kses_post(
									sprintf(
										/* translators: %s is a link to the Crowdsignal connection page. */
										__( 'To collect responses and data with Crowdsignal Forms you need to <a href="%s" target="_blank">connect the plugin with a Crowdsignal account.</a>', 'crowdsignal-forms' ),
										'/wp-admin/admin.php?page=crowdsignal-forms-setup'
									)
								);
							?>
							<br>
							<?php esc_html_e( 'You can do this by entering an API key below:', 'crowdsignal-forms' ); ?>
						</div>

						<form class="crowdsignal-options" method="post" action="<?php echo esc_url( admin_url( 'admin.php?page=crowdsignal-forms-settings' ) ); ?>">
							<?php
							// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Used for basic flow.
							if ( ! empty( $_GET['settings-updated'] ) ) {
								echo '<div class="updated fade crowdsignal-updated"><p>' . esc_html__( 'Settings successfully saved', 'crowdsignal-forms' ) . '</p></div>';
							}

							$api_auth_provider = new Crowdsignal_Forms_Api_Authenticator();
							?>
							<div id="settings-general" class="settings_panel">
								<table class="form-table settings parent-settings">
									<tr valign="top" class="">
										<th scope="row"><label for="setting-crowdsignal_api_key"><?php esc_html_e( 'Enter Crowdsignal API Key', 'crowdsignal-forms' ); ?></a></th>
										<td><input
											<?php echo $api_auth_provider->get_api_key() ? 'readonly' : ''; ?>
											id="setting-crowdsignal_api_key"
											class="regular-text"
											type="text"
											name="crowdsignal_api_key"
											value="<?php echo esc_attr( $api_auth_provider->get_api_key() ); ?>"
											/>
										</td>
									</tr>
								</table>
							</div>

							<div class="crowdsignal-settings__submit">
							<?php
							if ( $api_auth_provider->get_api_key() ) {
								wp_nonce_field( 'disconnect-api-key' );
								?>
								<input type="hidden" name="action" value="disconnect" />
								<input type="submit" class="button-primary" value="<?php esc_attr_e( 'Disconnect', 'crowdsignal-forms' ); ?>" />
								<?php
							} else {
								wp_nonce_field( 'add-api-key' );
								?>
								<input type="hidden" name="action" value="update" />
								<input type="submit" class="button-primary" value="<?php esc_attr_e( 'Connect', 'crowdsignal-forms' ); ?>" />
								<?php
							}
							?>
							</div>
						</form>

						<div class="crowdsignal-settings__bottom">
							<div class="crowdsignal-settings__text">
								<?php
								if ( ! get_option( Crowdsignal_Forms_Api_Authenticator::API_KEY_NAME ) ) {
									esc_html_e( "If you don't have an API key we can help you here: ", 'crowdsignal-forms' );
									echo '<a class="button" rel="noopener noreferrer" href="/wp-admin/admin.php?page=crowdsignal-forms-setup">Get an API Key</a>';
								}
								?>

							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<?php
		include dirname( __FILE__ ) . '/views/html-admin-setup-footer.php';
	}
}
