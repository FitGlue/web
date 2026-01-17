# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
