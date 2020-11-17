=== Crowdsignal Forms ===
Contributors: automattic
Tags: polls, forms, surveys, gutenberg, block
Requires at least: 5.0
Requires PHP: 5.6.20
Tested up to: 5.4.2
Stable tag: 1.3.3
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

= 1.3.3 =
* Unwrap all i18n calls (#1)
* Use default theme font for Applause count (#3)
* Fix applause branding styles (#4)

= 1.3.0 =
* Track vote to be able to tell when user has already "clapped" (#355)
* Fix undefined warnings (#349)
* Fix applause icon sizes (#352)
* Update hover effects  (#353)
* Fixes for missing vote props (#348)
* Update Applause block meta (#341)
* Make disabled state not react to hover nor click (#345)
* Fix block paddings (#346)
* Add border controls for applause block (#344)
* Update composer libs (#347)
* Pass required attribute to vote-item component (#343)
* Add correct applause icon & animation (#337)
* Update/referral link applause block (#333)
* Update applause count parameter (#331)
* Make clap text and count not selectable (#327)
* Allow the colours of the applause block to be changed (#322)
* Add branding to Applause Block (#326)
* Display the applause claps from the API (#325)
* Queue Claps On Click (#324)
* Check for applause block when deciding if a poll block
* Add close status to sidebar and close visual effect.
* Add/block sizes (#316)
* Add a thumbs up icon (placeholder) and some margin around it.
* add support for syncing applause block type to crowdsignal (#318)
* Add skeleton of applause block (#314)

= 1.2.1 =
* Center brand link with vote items (#336)
* Fix CSS Animation for Voting Thumbs (#332)
* Vote Block: Set focus Styling to hover styling (#329)
* clean up attribute passing to vote-item (#323)
* Add referral code to public Crowdsignal links (#330)

= 1.2.0 =
* add more keywords to vote and poll block (#310)
* Show current account info on API key selection screen (#317)
* refactor common code for poll based blocks (#311)
* set mappings for missing meta values (#309)
* Fix Default Title not syncing to platform (#253)
* Consolidate Custom Mutation Observers Into Library Function (#244)
* change Block interface into abstract class, move common helpers there. (#243)
* Add Crowdsignal block category to house all blocks within the plugin (#246)
* Vote block
* Update admin notices style (#305)
* Check API key is not empty before attempting to update connection settings
* Adding a slight opacity change when hovering a button that has a custom bg color set. (#303)
* Update/security fixes (#302)

== Upgrade Notice ==

= 1.3 =
Introduces the Applause block

= 0.9 =
Initial release
