=== Crowdsignal Forms ===
Contributors: automattic
Tags: polls, forms, surveys, gutenberg, block
Requires at least: 5.0
Requires PHP: 5.6.20
Tested up to: 6.2
Stable tag: 1.7.0
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

= 1.7.0 =
* Optimize frontend components (#263)
* Update dependencies for node 18.13.0 (#262)

= 1.6.7 =
* Fix block spacing for better theme compatibility (#258)
* Fix line jumps (#259)
* Remove RawHTML use from the blocks (#255)
* Bump tested version to 6.2 (#256)
* Fix rendering on question and note (#252)
* Update scripts to use python2 (#254)

= 1.6.6 =
* update package lock
* Add the site_url() to the wp-json URL so directory installs work. (#247)

= 1.6.5 =
* Fix makefile and dependencies (#245)
* Fix the (optional) text that shows up on the front end for email (#243)
* GH build action for named releases (#242)
* Back to PHP 7.4 for builds (#241)
* Create store (#234)
* Update docker to build with PHP 8.1 (#237)
* update build action to use php 8.1 (#240)
* Update development environment (#236)
* Update feedback button block condition for triggering the widget mode (#235)
* Build Tools: Add `allow-plugins` to `composer.json` for v2-compat (#227)
* fix/add missing ref links to quiz variation (#233)

= 1.6.4 =
* Update/survey help landing page (#231)
* add/quiz variation to CS Embed block (#230)
* add/crowdsignal-embed block (#222)
* Fix POT compilation on the local environment (#226)

= 1.6.3 =
* remove php8.1 from docker, PHP and php-mysql libs (#221)
* Update filter name due to deprecation (block_categories) (#220)
* Remove styling for Hello Dolly (#223)

= 1.6.1 =
* Fix TwentyTwentyTwo styling issues (#218)
* Unset border-style on crowdsignal-forms-vote class (#216)
* Adjust code syntax to comply with standards (#215)

= 1.6.0 =
* Remove editor dependencies (#213)
* Remove templateLock: insert also prevents removals (#212)
* Update documentation
* Update Dockerfile to pull latest stable Ubuntu. Small update to .yml file (#210)

= 1.5.15 =
* Fix CSS so it doesn't interfere with Jetpack (#208)
* add trigger for crowdsignal_forms_get_account_info (#203)
* fix typo on respones -> responses (#207)

= 1.5.14 =
* Rollback to 1.5.12

= 1.5.13 =
* Update the text and styling of the settings page. (#199)
* Fix transient and empty user (#200)
* Update links to settings page. (#198)
* Let the dashboard plugin take care of menus. (#196)
* WIP: Move the "Getting Started" process into the Settings page. (#179)
* Some fixes along the way (#197)
* Update and delete the dashboard login details too (#195)

= 1.5.12 =
* Improve broken connection handling (#193)
* Fix multiple choice poll check position (#192)
* Rework backend code (#191)

= 1.5.11 =
* Default polls to "Button" style (#189)

= 1.5.10 =
* Attempt to track failed connections (#187)
* Fix warnings and skips (#186)

= 1.5.9 =
* Bugfix: Set the priority of withFixedPosition hook on BlockListBlock to 1 (#180)

= 1.5.8 =
* Fix Feedback Button block on Block Widget editor. (#173)
* Fix isPollBlock to prevent crashes when getBlocks() returns null (#175)
* Fix toolbar/feedback overlay interactions (#172)

= 1.5.7 =
* Fix toolbar remaining behind the feedback overlay (#170)
* Make video iframe dimension-less, add CSS rules for it (#169)
* Fix new interface package compatibility (#168)
* Update dockerfile (#156)
* Fix little typo on the welcome screen (#167)

= 1.5.6 =
* Use poll.fm for the nonce check (#164)

= 1.5.5 =
* Fix answer inputs (#160)
* Fix feedback block editor overlay on the full site editor (#157)

= 1.5.4 =
* Default to site URL on source_link prop when no permalink is returned (#155)
* Add a widget-editor compatible interface for the feedback block (#154)
* Fix verify info request logic (#137)

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

= 1.6.7 =
Better theme compatibility with button styles and block spacing. Security fixes.

= 0.9 =
Initial release
