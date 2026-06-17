# FitGlue Changelog

<!-- LAST_PUBLISHED: server=v16.55.3, web=v11.85.0 -->

## Server v16.55.3 / Web v11.85.0 - June 17, 2026

### ✨ New Features

- Get more insightful and visually rich summaries of your training with our redesigned Showcase and Roundup pages. You'll see weekly, monthly, and yearly overviews, including your best efforts, consistency calendar, photos, routes, and even AI-generated summaries. You can also track who views your showcases!
- Easily export your fitness data for personal backups or further analysis, with improved handling for large exports.
- Stay better informed with enhanced notifications. Get direct links from push notifications, new alerts for billing events, trial expiry, and sync issues, and more control over your notification preferences.
- Enjoy more reliable and comprehensive syncing from Strava and Fitbit. We now prevent duplicate uploads, handle time zones better, and pull in richer data like heart rate and GPS streams. Plus, you can easily search and filter your historical imports.
- Discover new insights with hDrop Sweat Analysis integration, and share your activities with more style. We've added new options for creating beautiful shareable "Story" cards, including direct export for Instagram Stories, better photo controls, and improved image quality.

### 🐛 Bug Fixes

- Improved the reliability and completeness of AI-generated summaries in your Roundups.
- Fixed various issues that could cause duplicate activities, notifications, or sync errors, making your activity syncing more reliable.
- Addressed several issues to improve the accuracy of your activity data (like Fitbit HR), ensure your Roundups display correctly, and make sharing your activities more visually appealing. We also fixed minor display and navigation bugs across the app.


## Server v16.24.2 / Web v11.39.2 - May 28, 2026

### ✨ New Features

- **Import your past workouts!** You can now import your historical activity data when connecting a new app to FitGlue.
- **See a complete picture of your fitness journey.** Your profile now shows your full workout history, including lifetime heart rate zone splits, streak heatmaps, and personal records for strength exercises.
- **Share your progress in new ways!** Export your activity and profile stats as images with customizable backgrounds, colors, and layouts. Share your hybrid race breakdowns with animated bars.
- **Enhancements to Hevy Integration:** You can now choose to keep your Hevy uploads private. We've also improved how we handle different types of cardio activities from Hevy.
- **Get notified when things happen!** Receive push notifications for important connection updates.
- **Manually add workouts!** You can now manually enter workouts directly into FitGlue.
- **Upload photos to your workouts!** Add photos to your workouts and display them in a beautiful photo gallery on your profile and activity pages.
- **Improved Timezone Handling:** Better support for different timezones, especially for Parkrun activities.
- **New and Improved Design!** Enjoy a completely refreshed and modernized look and feel throughout the app and website, including updated user interfaces, layouts, and branding.

### 🐛 Bug Fixes

- **No more duplicate workouts!** We've fixed several issues that could cause duplicate activities to be synced or displayed.
- **Personal records are now more accurate.** We've addressed several bugs related to calculating and displaying personal records, including filtering for 1RM weight PRs, including time-based PRs, and improving sorting.
- **Better Hevy integration:** Fixed issues with uploading workouts to Hevy.
- **Improved stability and reliability:** Resolved various bugs related to data enrichment, pipeline processing, and showcase rendering for a smoother overall experience.
- **Fixed issues with intervals.icu integration** Improved setup process and error message handling.
- **Fixed issues with showcase** Resolved various bugs related to rendering on activity and profile pages.


## Server v16.2.0 / Web v10.38.0 - April 13, 2026

### ⚠ Breaking Changes

- We've made some big changes under the hood to improve performance and stability. You shouldn't notice any difference in how you use FitGlue, but it sets us up for bigger and better things in the future!

### ✨ New Features

- Connect to Apple Health and Health Connect to automatically sync your health and fitness data.
- Personalize your Showcase profile with new themes and showcase your best activities.
- Upload FIT files directly from your computer to GitHub.
- Track your cycling PRs and native distance in your activities.
- See time markers for intervals and splits in your workouts.
- Hevy users, enjoy improved integration and error tracking.
- New and improved look and feel for your activity pipelines!
- Filter enrichments per destination in your pipeline editor.

### 🐛 Bug Fixes

- Improved connection stability with Strava and Hevy.
- Various bug fixes and improvements to make FitGlue even more reliable.
- General UI improvements and refinements.


## Server v14.8.1 / Web v10.28.0 - February 15, 2026

### ⚠ Breaking Changes

- *None - We've made backend improvements, but nothing that will interrupt your FitGlue experience.*

### ✨ New Features

- **Get more insights from your workouts!** We're now automatically detecting and displaying interval data (like sprints!) within your synced activities.
- **Personalize your FitGlue profile!** You can now create and edit your profile to showcase your fitness achievements.
- **Easily share your fitness journey!** We've enhanced the way your workout data is displayed when you share links, making them look even better.
- **Explore new workout recipes!** We've added a dedicated page to discover and import new workout routines.
- **Enjoy a smoother, more informative experience!** We've made improvements to tours, guides, and the overall look and feel of the FitGlue platform.

### 🐛 Bug Fixes

- **We've squashed some bugs related to:**
- - Profile picture uploads
- - Email notifications
- - Downloading workout data
- - Display issues on the showcase page


## Server v13.0.0 / Web v10.16.0 - February 11, 2026

### ⚠ Breaking Changes

- No breaking changes.

### ✨ New Features

- **Connect to more apps!** Google and Google Sheets are now available as connection and destination options.
- **See more insights about your workouts!** We've added Effort Score tracking, heart rate zone analysis, and muscle group rollups to give you a deeper understanding of your performance.
- **Enjoy a better experience on the platform!** We've made improvements to the pipeline creation process, added pipeline duplication, improved the look and feel of your showcase profile, and made connection actions more obvious.
- **Stay in the loop!** Get notified when your pipelines are syncing.
- **Connect to GitHub!** You can now connect to GitHub.

### 🐛 Bug Fixes

- We've fixed issues with activity streaks, personal records, and other data displays to ensure accuracy.
- We've resolved several connection issues with Google and GitHub, making it easier to connect your accounts.
- We've improved the overall stability and performance of the platform, including fixing bugs related to user tiers and analytics.
- We've polished the look and feel of the user interface, fixing spacing issues and improving plugin categorization.


## Server v12.2.0 / Web v10.7.1 - February 5, 2026

### ⚠ Breaking Changes

- See the status of your synced activities more clearly! Destinations (like Strava, etc.) are now displayed by their status: success, failure, or pending, each with distinct styling. Failed destinations now show helpful error messages so you know what went wrong.

### ✨ New Features

- Get more control over your FitGlue experience! You can now customize your notification preferences.
- Enjoy better looking and more informative pages! We've redesigned the connections page, activity detail page, help system, and more.
- We've made it easier to connect your accounts and review the sync process, with new step indicators and configuration options.
- Now you can generate AI images based on your workout data!

### 🐛 Bug Fixes

- We've improved the accuracy of heart rate data syncing, especially for activities that span across midnight.
- Fixed an issue where some Hevy exercises weren't being mapped correctly.
- Resolved various issues to improve the overall stability and performance of activity syncing.


## Server v9.4.0 / Web v8.0.0 - January 26, 2026

### ⚠ Breaking Changes

- We've updated the look and feel of the app with a major UI overhaul, and rebuilt the underlying components to make future improvements easier. You may notice some slight changes in appearance.

### ✨ New Features

- We've significantly improved Parkrun syncing to be more reliable and efficient, including better handling of results and retries.
- Enjoy a more visually appealing and informative experience with section-based descriptions in the app.

### 🐛 Bug Fixes

- Hevy workout syncing is now working correctly.
- Parkrun results are now correctly matched and updated in your account.
- You'll now see the correct source name on the pending inputs page.


## Server v7.1.0 / Web v6.0.2 - January 24, 2026

### ✨ New Features

- **Parkrun Integration** – Your Parkrun activities now automatically show official times, positions, age grades, and PB tracking!
- **Muscle Heatmaps** – See which muscles you worked during strength training with visual body heatmaps
- **AI-Generated Banners** – Get beautiful, personalized banners for your activities (Athlete tier)

### 🐛 Bug Fixes

- Fixed activity source names not displaying correctly on some cards
- Improved pending input styling on dashboard

---

## Server v6.0.0 / Web v5.0.0 - January 23, 2026

### ✨ New Features

- **Cloud CDN for Assets** – Activity images and assets now load faster globally
- **Showcase Improvements** – Better athlete banners and profile display on public showcase pages
- **Generated Assets** – View AI-generated route maps and activity visualizations on your activity detail page

### 🐛 Bug Fixes

- Fixed activity detail page not rendering SVG assets correctly
- Resolved tier-related display issues in the UI

---

## Server v5.0.0 / Web v4.0.0 - January 22, 2026

### ⚠ Breaking Changes

- Major internal improvements to how we handle errors and process requests (better reliability!)

### ✨ New Features

- **Sentry Integration** – We now have better error tracking to identify and fix issues faster
- **Pipeline Toggle** – You can now enable/disable individual pipelines
- **High-Fidelity Icons** – Sharper, crisper icons for all your connected apps

### 🐛 Bug Fixes

- Fixed various issues with pipeline configuration and error handling

---

## Server v4.0.0 / Web v3.0.0 - January 21, 2026

### ✨ New Features

- **Personal Records Tracking** – FitGlue now tracks your cardio and strength PRs automatically
- **Training Load Analysis** – See your TRIMP (Training Impulse) calculations
- **Spotify Integration** – Connect Spotify to see what you were listening to during workouts
- **Weather Data** – Activities now include weather conditions from when you exercised
- **Elevation Summary** – Detailed elevation gain/loss stats for outdoor activities
- **Location Names** – Activities automatically get named based on where you exercised

### 🐛 Bug Fixes

- Fixed Parkrun import and integrations endpoint issues
- Resolved showcase display problems

---

## Server v3.0.0 / Web v3.0.0 - January 21, 2026

### ⚠ Breaking Changes

- Strava integration completely reworked for better reliability

### ✨ New Features

- **Strava Source Support** – Pull activities directly from Strava (in addition to pushing to it)
- **Plugin Categories** – Plugins are now organized by category for easier discovery

### 🐛 Bug Fixes

- Fixed stats display on dashboard and activities list page

---

## Server v2.0.0 / Web v2.0.0 - January 20, 2026

### ✨ New Features

- **AI-Powered Descriptions** – Let AI write engaging descriptions for your activities
- **Heart Rate Summaries** – See average, max, and zone breakdown for activities with HR data
- **Pace, Cadence & Power Stats** – Detailed metrics for runners and cyclists
- **Real-Time Activity Updates** – Activities now update live in your dashboard
- **Pipeline Import/Export** – Share your pipeline configurations with friends

### 🐛 Bug Fixes

- Removed problematic light mode (dark mode only now!)
- Fixed infinite API call bug

---

## Server v1.5.0 / Web v1.5.0 - January 18, 2026

### ✨ New Features

- **Logic Gates** – Add conditional rules to your pipelines (e.g., only sync runs over 5K)
- **FIT File Upload** – Upload workout files directly from your computer
- **Public Showcase** – Share your activities publicly with a custom link
- **Better Activity Type Detection** – Improved mapping of activity types from Fitbit

### 🐛 Bug Fixes

- Fixed file upload styling issues
- Improved showcase URL handling

---

## Server v1.0.0 / Web v1.0.0 - January 17, 2026

### 🎉 Initial Release

Welcome to FitGlue! This is our first public release.

### ✨ Features

- **Connect Multiple Fitness Apps** – Strava, Fitbit, Garmin, Apple Health, Health Connect, and Hevy
- **Automatic Activity Syncing** – Activities flow between your connected apps automatically
- **Pipeline Builder** – Create custom workflows for how your activities get processed
- **Activity Enrichment** – Enhance your activities with additional data and formatting
- **Dashboard** – See all your recent activities and connection statuses at a glance
- **Webhook Instructions** – Clear setup instructions for apps that need webhooks

### 🐛 Known Issues

- Some activity types may not map perfectly between all apps
- Light mode has some visual issues (we recommend dark mode)
