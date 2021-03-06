=== Crowdsignal Forms ===
Contributors: automattic
Tags: polls, forms, surveys, gutenberg, block
Requires at least: 5.0
Requires PHP: 5.6.20
Tested up to: 5.6
Stable tag: 1.5.3
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

The Crowdsignal Forms plugin allows you to create and manage polls right from within the block editor.

== Description ==

The Crowdsignal Forms plugin allows you to create and manage polls right from within the block editor.
Creating polls is as simple and as fast as writing a bullet point list. No embed blocks and no copy pasting needed anymore.

Customize the look and feel of your polls to match your brand, and pick your favorite color. The poll block supports the styling of your theme by default, and from there you can customize the styling of your polls the way you want.

With Crowdsignal’s results page you can view all responses as they come in. See the geo-locations of your voters and analyze IP addresses for any suspicious voting behavior. See advanced stats and analytics for understanding your audience.

Analyze your results and then export them in a number of different formats.

Set close dates for polls, create polls with single or multiple choice answers, choose whether to show your readers the poll results or keep them private.

You can create an unlimited number of polls with a free [Crowdsignal](https://crowdsignal.com/) account and your first 2,500 signals are free. A signal is a response you get to a poll. If you are on a free plan, you still have full access to the first 2,500 signals. Any further responses you collect will still be recorded but if you [upgrade](https://crowdsignal.com/pricing/) you will get access to our unlocked reports to see them. You’ll also get access to a [range of features](https://crowdsignal.com/features/) not available to free users.

== Installation ==

The easiest way to install this plugin is through the "Add New Plugins" page on your site.
1. Go to the Plugins page and click "Add New".
2. Type "Crowdsignal Forms" in the search box and press return.
3. Click the "Install Now" button.

Once installed you must connect your site to Crowdsignal.com
1. Activate the plugin and you will be brought to the Getting Started page.
2. Click "Let's get started" to open a popup that will allow you to login or create a new Crowdsignal account.
3. You'll be presented with an API key to use so press Connect and you'll be brought back to your own site.
4. The popup will disappear and the message, "You’re ready to start using Crowdsignal!" will be shown.
5. Happy polling! Create a post and add a new "poll" block!


== Frequently Asked Questions ==

= Why Crowdsignal Forms?

We’re starting with just the Crowdsignal poll block but more blocks are coming soon.

= Who is Crowdsignal?

Crowdsignal is built by Automattic, the company behind WordPress.com, WooCommerce, Tumblr and more. We’re here to stay!

= Where can I find help with this plugin?

Automattic is a distributed team working from all around the world, so it’s always business hours for our more than 250 Happiness Engineers. Check out our [support documentation](https://crowdsignal.com/support/), the [support forum](https://wordpress.org/support/plugin/crowdsignal-forms/) or [reach out to us](https://crowdsignal.com/contact/) anytime and we'll be happy to help.

= What plans do you offer?
Compare our [simple and affordable plans](https://crowdsignal.com/pricing/) or take a [product tour](https://crowdsignal.com/features/) to learn more.


== Screenshots ==

1. Create and style your polls from within the block editor
2. Analyze your results and export them everywhere
3. Your polls adopt your theme style
4. Use the poll block inside of other blocks

== Changelog ==

= 1.5.3 =
* Remove the filter as it either turns problematic or doesn't solve the issue at all (#146)
* Fix feedback form rendering issues on mobile screens (#143)
* Add filter to control transform behavior (#142)
* Add different toggle settings for the feedback button block (#139)
* Implement a toggle for making feedback email mandatory (#138)
* Add a vertical middle position for the feedback block (#140)
* Make branding enabled by default on atomic sites (#134)
* Fix poll styling issues (#135)
* Hide CS logo on the popup form (#136)
* Consistently name panel section "Settings" and subsection "Status" (#133)
* Refresh readme (#112)

= 1.5.1 =
* Finetune footer branding (#115)
* New Feedback block added (#110)
* Use 'crowdsignal_forms_translations_path' filter to load translations (#61)
* Action: Use make command to build all blocks (#74)
* Get rid of docker step for pot file (#65)
* Add Github action for nightly builds
* Fix double entry (no uses and run on same step) (#70)
* Back to basic syntax
* More action debugging
* Simpler syntax, no inputs (#67)
* move syntax, debugging error on L1 (#66)

= 1.4.5 =
* Fix preview button causing the NPS block to break when creating a new block
* Fix linter errors
* Update the NPS preview button to behave identically to the editor's one
* Change translations pipeline (#57)
* Add UA and X-Forwarded-For headers for proper response results tracking (#53)
* Use RichText.Content component on frontend (#55)
* Use optimistic requests for submitting NPS block results
* Change copy edits (#56)
* Disable HTML editing and block reusability

= 1.4.3 =
* Add NPS block
* Fixed redirect logic for the poll block

== Upgrade Notice ==

= 1.5.3 =
Fixes for Feedback Button block. Poll block styles improvements.

= 0.9 =
Initial release
