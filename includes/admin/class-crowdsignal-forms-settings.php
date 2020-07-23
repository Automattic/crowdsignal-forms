<?php
/**
 * File containing the class Crowdsignal_Forms\Admin\Crowdsignal_Forms_Settings.
 *
 * @package Crowdsignal_Forms\Admin
 * @since   1.0.0
 */

namespace Crowdsignal_Forms\Admin;

use Crowdsignal_Forms\Auth\Crowdsignal_Forms_Api_Authenticator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles the management of plugin settings.
 *
 * @since 1.0.0
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
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_init', array( $this, 'maybe_disconnect' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 12 );
	}

	/**
	 * Enqueues scripts for setup page.
	 */
	public function admin_enqueue_scripts() {
		wp_enqueue_style( 'admin-styles', plugin_dir_url( __FILE__ ) . '/admin-styles.css', array(), '0.9' );
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
	public function maybe_disconnect() {
		if ( isset( $_GET['page'] ) && 'crowdsignal-forms-settings' === $_GET['page'] && isset( $_GET['disconnect'] ) && isset( $_GET['_wpnonce'] ) ) {
			if ( ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'crowdsignal-disconnect' ) ) {
				wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=disconnect-failed' ) );
			} else {
				delete_option( Crowdsignal_Forms_Api_Authenticator::USER_CODE_NAME );
				delete_option( Crowdsignal_Forms_Api_Authenticator::API_KEY_NAME );
				wp_safe_redirect( admin_url( 'admin.php?page=crowdsignal-forms-settings&msg=disconnected' ) );
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
		<div class="wrap crowdsignal-settings-wrap">

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

						<form class="crowdsignal-options" method="post" action="options.php">

							<?php settings_fields( $this->settings_group ); ?>

							<?php
							// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Used for basic flow.
							if ( ! empty( $_GET['settings-updated'] ) ) {
								echo '<div class="updated fade crowdsignal-updated"><p>' . esc_html__( 'Settings successfully saved', 'crowdsignal-forms' ) . '</p></div>';
							}

							if ( ! empty( $_GET['disconnect'] ) && ! empty( $_GET['_wpnonce'] ) ) {
								if ( ! wp_verify_nonce( sanitize_key( $_GET['_wpnonce'] ), 'crowdsignal-disconnect' ) ) {
									echo '<div class="error fade crowdsignal-updated"><p>' . esc_html__( 'Could not disconnect. Please try again.', 'crowdsignal-forms' ) . '</p></div>';
								} else {
									// Remove options.
									delete_option( Crowdsignal_Forms_Api_Authenticator::USER_CODE_NAME );
									delete_option( Crowdsignal_Forms_Api_Authenticator::API_KEY_NAME );
									echo '<div class="updated fade crowdsignal-updated"><p>' . esc_html__( 'Successfully disconnected from Crowdsignal.', 'crowdsignal-forms' ) . '</p></div>';
								}
							}

							foreach ( $this->settings as $key => $section ) {
								$section_args = isset( $section[2] ) ? (array) $section[2] : array();
								echo '<div id="settings-' . esc_attr( sanitize_title( $key ) ) . '" class="settings_panel">';
								if ( ! empty( $section_args['before'] ) ) {
									echo '<p class="before-settings">' . wp_kses_post( $section_args['before'] ) . '</p>';
								}
								echo '<table class="form-table settings parent-settings">';

								foreach ( $section[1] as $option ) {
									$value = get_option( $option['name'] );
									$this->output_field( $option, $value );
								}

								echo '</table>';
								if ( ! empty( $section_args['after'] ) ) {
									echo '<p class="after-settings">' . wp_kses_post( $section_args['after'] ) . '</p>';
								}
								echo '</div>';

							}
							?>

							<div class="crowdsignal-settings__submit">
								<input type="submit" class="button-primary" value="<?php esc_attr_e( 'Connect', 'crowdsignal-forms' ); ?>" />
							</div>
						</form>

						<div class="crowdsignal-settings__bottom">
							<div class="crowdsignal-settings__text">
								<?php
								if ( get_option( Crowdsignal_Forms_Api_Authenticator::API_KEY_NAME ) ) {
									$disconnect_url = wp_nonce_url( '?page=crowdsignal-forms-settings&disconnect=true', 'crowdsignal-disconnect' );
									echo '<a href="' . esc_attr( $disconnect_url ) . '">' . esc_html( __( 'Disconnect Crowdsignal account', 'crowdsignal-forms' ) ) . '</a>';
								} else {
									esc_html_e( "If you don't have an API key we can help you here:", 'crowdsignal-forms' );
									echo '<a class="button crowdsignal-settings__cta" rel="noopener noreferrer" href="/wp-admin/admin.php?page=crowdsignal-forms-setup">Get an API Key</a>';
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




	/**
	 * Checkbox input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $ignored_placeholder
	 */
	protected function input_checkbox( $option, $attributes, $value, $ignored_placeholder ) {
		if ( ! isset( $option['hidden_value'] ) ) {
			$option['hidden_value'] = '0';
		}
		?>
		<label>
		<input type="hidden" name="<?php echo esc_attr( $option['name'] ); ?>" value="<?php echo esc_attr( $option['hidden_value'] ); ?>" />
		<input
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			type="checkbox"
			value="1"
			<?php
			echo implode( ' ', $attributes ) . ' '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			checked( '1', $value );
			?>
		/> <?php echo wp_kses_post( $option['cb_label'] ); ?></label>
		<?php
		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Text area input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $placeholder
	 */
	protected function input_textarea( $option, $attributes, $value, $placeholder ) {
		?>
		<textarea
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			class="large-text"
			cols="50"
			rows="3"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			<?php
			echo implode( ' ', $attributes ) . ' '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $placeholder; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		>
			<?php echo esc_textarea( $value ); ?>
		</textarea>
		<?php

		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Select input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $ignored_placeholder
	 */
	protected function input_select( $option, $attributes, $value, $ignored_placeholder ) {
		?>
		<select
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			class="regular-text"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			<?php
			echo implode( ' ', $attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		>
		<?php
		foreach ( $option['options'] as $key => $name ) {
			echo '<option value="' . esc_attr( $key ) . '" ' . selected( $value, $key, false ) . '>' . esc_html( $name ) . '</option>';
		}
		?>
		</select>
		<?php

		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Radio input field.
	 *
	 * @param array  $option
	 * @param array  $ignored_attributes
	 * @param mixed  $value
	 * @param string $ignored_placeholder
	 */
	protected function input_radio( $option, $ignored_attributes, $value, $ignored_placeholder ) {
		?>
		<fieldset>
		<legend class="screen-reader-text">
		<span><?php echo esc_html( $option['label'] ); ?></span>
		</legend>
		<?php
		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}

		foreach ( $option['options'] as $key => $name ) {
			echo '<label><input name="' . esc_attr( $option['name'] ) . '" type="radio" value="' . esc_attr( $key ) . '" ' . checked( $value, $key, false ) . ' />' . esc_html( $name ) . '</label><br>';
		}
		?>
		</fieldset>
		<?php
	}

	/**
	 * Page input field.
	 *
	 * @param array  $option
	 * @param array  $ignored_attributes
	 * @param mixed  $value
	 * @param string $ignored_placeholder
	 */
	protected function input_page( $option, $ignored_attributes, $value, $ignored_placeholder ) {
		$args = array(
			'name'             => $option['name'],
			'id'               => $option['name'],
			'sort_column'      => 'menu_order',
			'sort_order'       => 'ASC',
			'show_option_none' => __( '--no page--', 'crowdsignal-forms' ),
			'echo'             => false,
			'selected'         => absint( $value ),
		);

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Safe output.
		echo str_replace( ' id=', " data-placeholder='" . esc_attr__( 'Select a page&hellip;', 'crowdsignal-forms' ) . "' id=", wp_dropdown_pages( $args ) );

		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Hidden input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $ignored_placeholder
	 */
	protected function input_hidden( $option, $attributes, $value, $ignored_placeholder ) {
		$human_value = $value;
		if ( $option['human_value'] ) {
			$human_value = $option['human_value'];
		}
		?>
		<input
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			type="hidden"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			value="<?php echo esc_attr( $value ); ?>"
			<?php
			echo implode( ' ', $attributes ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		/><strong><?php echo esc_html( $human_value ); ?></strong>
		<?php

		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Password input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $placeholder
	 */
	protected function input_password( $option, $attributes, $value, $placeholder ) {
		?>
		<input
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			class="regular-text"
			type="password"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			value="<?php echo esc_attr( $value ); ?>"
			<?php
			echo implode( ' ', $attributes ) . ' '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $placeholder; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		/>
		<?php

		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Number input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $placeholder
	 */
	protected function input_number( $option, $attributes, $value, $placeholder ) {
		echo isset( $option['before'] ) ? wp_kses_post( $option['before'] ) : '';
		?>
		<input
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			class="small-text"
			type="number"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			value="<?php echo esc_attr( $value ); ?>"
			<?php
			echo implode( ' ', $attributes ) . ' '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $placeholder; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		/>
		<?php
		echo isset( $option['after'] ) ? wp_kses_post( $option['after'] ) : '';
		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Text input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $placeholder
	 */
	protected function input_text( $option, $attributes, $value, $placeholder ) {
		?>
		<input
			id="setting-<?php echo esc_attr( $option['name'] ); ?>"
			class="regular-text"
			type="text"
			name="<?php echo esc_attr( $option['name'] ); ?>"
			value="<?php echo esc_attr( $value ); ?>"
			<?php
			echo implode( ' ', $attributes ) . ' '; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo $placeholder; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			?>
		/>
		<?php

		if ( ! empty( $option['desc'] ) ) {
			echo ' <p class="description">' . wp_kses_post( $option['desc'] ) . '</p>';
		}
	}

	/**
	 * Outputs the field row.
	 *
	 * @param array $option
	 * @param mixed $value
	 */
	protected function output_field( $option, $value ) {
		$placeholder    = ( ! empty( $option['placeholder'] ) ) ? 'placeholder="' . esc_attr( $option['placeholder'] ) . '"' : '';
		$class          = ! empty( $option['class'] ) ? $option['class'] : '';
		$option['type'] = ! empty( $option['type'] ) ? $option['type'] : 'text';
		$attributes     = array();
		if ( ! empty( $option['attributes'] ) && is_array( $option['attributes'] ) ) {
			foreach ( $option['attributes'] as $attribute_name => $attribute_value ) {
				$attributes[] = esc_attr( $attribute_name ) . '="' . esc_attr( $attribute_value ) . '"';
			}
		}

		echo '<tr valign="top" class="' . esc_attr( $class ) . '">';

		if ( ! empty( $option['label'] ) ) {
			echo '<th scope="row"><label for="setting-' . esc_attr( $option['name'] ) . '">' . esc_html( $option['label'] ) . '</a></th><td>';
		} else {
			echo '<td colspan="2">';
		}

		$method_name = 'input_' . $option['type'];
		if ( method_exists( $this, $method_name ) ) {
			$this->$method_name( $option, $attributes, $value, $placeholder );
		} else {
			/**
			 * Allows for custom fields in admin setting panes.
			 *
			 * @since 1.0.0
			 *
			 * @param string $option     Field name.
			 * @param array  $attributes Array of attributes.
			 * @param mixed  $value      Field value.
			 * @param string $value      Placeholder text.
			 */
			do_action( 'crowdsignal_forms_admin_field_' . $option['type'], $option, $attributes, $value, $placeholder );
		}
		echo '</td></tr>';
	}

	/**
	 * Multiple settings stored in one setting array that are shown when the `enable` setting is checked.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param array  $values
	 * @param string $placeholder
	 */
	protected function input_multi_enable_expand( $option, $attributes, $values, $placeholder ) {
		echo '<div class="setting-enable-expand">';
		$enable_option               = $option['enable_field'];
		$enable_option['name']       = $option['name'] . '[' . $enable_option['name'] . ']';
		$enable_option['type']       = 'checkbox';
		$enable_option['attributes'] = array( 'class="sub-settings-expander"' );

		if ( isset( $enable_option['force_value'] ) && is_bool( $enable_option['force_value'] ) ) {
			if ( true === $enable_option['force_value'] ) {
				$values[ $option['enable_field']['name'] ] = '1';
			} else {
				$values[ $option['enable_field']['name'] ] = '0';
			}

			$enable_option['hidden_value'] = $values[ $option['enable_field']['name'] ];
			$enable_option['attributes'][] = 'disabled="disabled"';
		}

		$this->input_checkbox( $enable_option, $enable_option['attributes'], $values[ $option['enable_field']['name'] ], null );

		echo '<div class="sub-settings-expandable">';
		$this->input_multi( $option, $attributes, $values, $placeholder );
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Multiple settings stored in one setting array.
	 *
	 * @param array  $option
	 * @param array  $ignored_attributes
	 * @param array  $values
	 * @param string $ignored_placeholder
	 */
	protected function input_multi( $option, $ignored_attributes, $values, $ignored_placeholder ) {
		echo '<table class="form-table settings child-settings">';
		foreach ( $option['settings'] as $sub_option ) {
			$value              = isset( $values[ $sub_option['name'] ] ) ? $values[ $sub_option['name'] ] : $sub_option['std'];
			$sub_option['name'] = $option['name'] . '[' . $sub_option['name'] . ']';
			$this->output_field( $sub_option, $value );
		}
		echo '</table>';
	}

	/**
	 * Proxy for text input field.
	 *
	 * @param array  $option
	 * @param array  $attributes
	 * @param mixed  $value
	 * @param string $placeholder
	 */
	protected function input_input( $option, $attributes, $value, $placeholder ) {
		$this->input_text( $option, $attributes, $value, $placeholder );
	}
}
