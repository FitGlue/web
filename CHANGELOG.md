# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0](https://github.com/fitglue/web/compare/v1.4.1...v1.5.0) (2026-01-18)


### Features

* Add FIT file upload panel to the dashboard, introduce a showcase page, and enhance showcase domain resolution logic. ([3949052](https://github.com/fitglue/web/commit/394905223727f02f50b5a84ff9a7a74f5dca9068))
* Add optional pipeline naming, refactor file upload panel styling, and update activity list logic. ([b88cf07](https://github.com/fitglue/web/commit/b88cf07b0333a991a79d9e9922de5ccfd8ec76bc))
* Implement Logic Gate configuration form and integrate conditional logic into pipeline management. ([326c7e3](https://github.com/fitglue/web/commit/326c7e3d4c1d55232bc13f25c14fbd087fc20387))
* introduce standardized activity type formatting and add Showcase integration. ([d1e2d6f](https://github.com/fitglue/web/commit/d1e2d6f926b8478b2f87a5ca106c9ab33f8e1def))


### Bug Fixes

* even prettier upload ([41a9810](https://github.com/fitglue/web/commit/41a98100a313599eed41edcd76b355287d3cc3a8))
* file upload prettifying, and bug fix ([dd44cb7](https://github.com/fitglue/web/commit/dd44cb7fdd3dd7c2f71363e4887016377888f537))
* parse showcase ID from URL not query ([8613171](https://github.com/fitglue/web/commit/8613171cdd42afe423108038b39d9ec763aff1ed))

### [1.4.1](https://github.com/fitglue/web/compare/v1.4.0...v1.4.1) (2026-01-18)

## [1.4.0](https://github.com/fitglue/web/compare/v1.3.0...v1.4.0) (2026-01-18)


### Features

* add public ID authentication type and its corresponding setup UI. ([1210dda](https://github.com/fitglue/web/commit/1210ddab75d1840f6354834cf79372d5b08e1339))

## [1.3.0](https://github.com/fitglue/web/compare/v1.2.0...v1.3.0) (2026-01-18)


### Features

* Implement a multi-step onboarding welcome banner with completion tracking and adjust CI/CD release creation. ([1dd93ad](https://github.com/fitglue/web/commit/1dd93adad5565146f7985544287bfd7e8151f829))

## [1.2.0](https://github.com/fitglue/web/compare/v1.1.0...v1.2.0) (2026-01-17)


### Features

* Implement webhook configuration instructions and UI for integrations requiring webhook setup on the connection success page. ([e8fdf08](https://github.com/fitglue/web/commit/e8fdf085071a1d8dac23d29a663074e49b041125))

## [1.1.0](https://github.com/fitglue/web/compare/v1.0.0...v1.1.0) (2026-01-17)


### Features

* add better loading states across the App ([a04af6c](https://github.com/fitglue/web/commit/a04af6c099938e5101534f22ccf813ad3920f372))
* add combined version control between web and server ([46fb40b](https://github.com/fitglue/web/commit/46fb40b759d69f0a9d01964b453956dabd5e2514))
* Add loading skeletons to dashboard cards and activity gallery, and ensure activities are sorted chronologically. ([b10c2e6](https://github.com/fitglue/web/commit/b10c2e6d5c87be26d1556473ddd99dab723c21f2))


### Bug Fixes

* allow hevy API key setup via UI ([fc9df9f](https://github.com/fitglue/web/commit/fc9df9f583bd8e5bd57b23f5a9ea2d047e2c69cd))
* versioning bumping ([e41f0a3](https://github.com/fitglue/web/commit/e41f0a38bf5b278a44ed6a8f0bbf02fc6ff32d46))

## [1.0.0](https://github.com/fitglue/web/releases/tag/v1.0.0) (2026-01-17)

This is the first proper release of FitGlue Web, consolidating all development work since project inception.

### ⚠ BREAKING CHANGES

* **marketing:** Complete redesign of marketing site and pipeline wizard UI
* **connections:** Add connection management UI with pages for listing, setup, success, and error states

### Features

* Add connection management UI with pages for listing, setup, success, and error states ([350dc68](https://github.com/fitglue/web/commit/350dc68))
* beautify activities page ([ead8b21](https://github.com/fitglue/web/commit/ead8b21))
* pending inputs prettified ([eca338b](https://github.com/fitglue/web/commit/eca338b))
* Redesign welcome banner UI, enhance user display in header ([0db4c0d](https://github.com/fitglue/web/commit/0db4c0d))
* **marketing:** redesign marketing site and enhance pipeline wizard UI ([5977118](https://github.com/fitglue/web/commit/5977118))
* **dashboard:** redesign dashboard with connection status, pipeline overview, and activity feed ([f6a1d88](https://github.com/fitglue/web/commit/f6a1d88))
* **web:** upgrade skier to v3.0.0 ([d53121e](https://github.com/fitglue/web/commit/d53121e))
* Add marketing pages and plugin-driven pipeline UI ([933113d](https://github.com/fitglue/web/commit/933113d))
* **auth:** implement enhanced authentication with social login ([5deddb8](https://github.com/fitglue/web/commit/5deddb8))
* **web:** implement user management, integrations, and pipeline UI ([cf7aa01](https://github.com/fitglue/web/commit/cf7aa01))
* **ci:** implement automatic versioning and changelog generation ([55249bc](https://github.com/fitglue/web/commit/55249bc))
* enhance dashboard with 'Gallery of Boosts' and update marketing ([26a2944](https://github.com/fitglue/web/commit/26a2944))
* improve header, footer, and legal docs ([88b89af](https://github.com/fitglue/web/commit/88b89af))
* dynamic page generation from registry data ([ec681c2](https://github.com/fitglue/web/commit/ec681c2))
* **site:** restructure marketing site with plugins page and remove coming soon ([b85b939](https://github.com/fitglue/web/commit/b85b939))
* **web:** overhaul auth pages and dynamic integration setup ([64038cc](https://github.com/fitglue/web/commit/64038cc))
* **web:** enhance Activity Detail page with pipeline execution trace ([bb0aac5](https://github.com/fitglue/web/commit/bb0aac5))
* **web:** enhance activity detail trace and overhaul pending inputs UI ([233f5f0](https://github.com/fitglue/web/commit/233f5f0))
* **tracing:** Visualize pipeline execution trace ([e493a60](https://github.com/fitglue/web/commit/e493a60))
* **notifications:** implement frontend push notification registration ([0c68389](https://github.com/fitglue/web/commit/0c68389))
* Implement synchronized activity management with new API endpoints ([86480f2](https://github.com/fitglue/web/commit/86480f2))
* Implement Firebase authentication with login, registration, and user dashboard pages ([750581d](https://github.com/fitglue/web/commit/750581d))
* Introduce SEO features with sitemap, favicon, structured data ([3200201](https://github.com/fitglue/web/commit/3200201))
* Add waitlist page and form submission logic ([9ebd3ce](https://github.com/fitglue/web/commit/9ebd3ce))
* Introduce a new React frontend with Vite, including pending inputs page ([7c1a189](https://github.com/fitglue/web/commit/7c1a189))
* Configure Firebase project aliases and local serving ([474e4a7](https://github.com/fitglue/web/commit/474e4a7))
* Add comprehensive documentation for web project setup and deployment ([762bb9e](https://github.com/fitglue/web/commit/762bb9e))
* Initial project setup with Skier SSG, Terraform, and Firebase Hosting ([7cf488b](https://github.com/fitglue/web/commit/7cf488b))

### Bug Fixes

* **activities:** improve UI formatting and readability ([7d914f0](https://github.com/fitglue/web/commit/7d914f0))
* remove light mode and fix infinite API calls ([1ced17c](https://github.com/fitglue/web/commit/1ced17c))
* **ci:** add guards to prevent release tag conflicts ([da14035](https://github.com/fitglue/web/commit/da14035))
* **ci:** fail fast if main has newer commits instead of rebasing ([8304420](https://github.com/fitglue/web/commit/8304420))
* Various linting, build, and style fixes
