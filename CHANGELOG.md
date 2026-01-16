# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## 0.3.0 (2026-01-16)


### ⚠ BREAKING CHANGES

* **marketing:** Remove standalone /plugins and /connections pages (consolidated into /the-magic).
* **marketing:** Plugin registry schema now requires keyOptions/valueOptions alignment with server.

- Overhaul "How It Works" page with a simplified 4-step structure and static showcase cards.
- Redesign the global 404 page with a fitness-themed "40 x 4 reps" aesthetic.
- Implement automatic redirect from app 404s to the dashboard with a notification toast.
- Enhance `PipelineWizardPage` with improved `EnricherTimeline` and `EnricherConfigForm`.
- Update SEO metadata and Open Graph tags across all marketing pages.
- Refine header/footer styling with pill-shaped navigation buttons.
* **web:** Updated skier static site generator from v2 to v3.

- Bump skier from ^2.0.0 to ^3.0.0
- Remove npm overrides for chalk and feed (no longer needed after
  skier's ESM conversion addressed the dependency compatibility issues)

### Features

* Add API endpoint to dismiss pending inputs and implement dismiss functionality in the UI. ([44e15e1](https://github.com/fitglue/web/commit/44e15e1228fe42adb3540c7a1788ed9e1addb696))
* Add auth success and error pages and configure Firebase for clean URLs and caching headers. ([5cc4f1a](https://github.com/fitglue/web/commit/5cc4f1ad09f205de4e2033ee1393a38707f13bc3))
* Add comprehensive documentation for web project setup, local development, deployment, and architectural decisions. ([762bb9e](https://github.com/fitglue/web/commit/762bb9ec6f2c25cad010332c5e505739ad14cade))
* Add custom 404 page and remove catch-all rewrite to index.html in Firebase config. ([207d197](https://github.com/fitglue/web/commit/207d197a50dba6d009e10f482bb220eed8d441aa))
* add Firebase project initialization step to CircleCI configuration. ([a53179b](https://github.com/fitglue/web/commit/a53179b08e769a27019c3a0af5bf1949f49dc10c))
* Add Firebase rewrite for Fitbit OAuth callback. ([9448b7c](https://github.com/fitglue/web/commit/9448b7cee158136f77b12a77f1dcfd5e2557413f))
* Add Fitbit webhook handler rewrite rule to firebase.json ([9265b37](https://github.com/fitglue/web/commit/9265b372245a24c46ff9358f81613d5c459e0679))
* add marketing pages and plugin-driven pipeline UI ([933113d](https://github.com/fitglue/web/commit/933113d118def9d033b4ee2f7b86727f37d972ba))
* Add refresh control with last updated timestamp to activity and input pages. ([b57022c](https://github.com/fitglue/web/commit/b57022c134c49189e48d06fa04605ca43bee873d))
* Add routing for `/hooks/test` to `mock-source-handler` service. ([91a8252](https://github.com/fitglue/web/commit/91a8252cb39b957e4e478a9467e4799b72d0d8ed))
* add type attribute to dismiss button and change its text color to red. ([867248a](https://github.com/fitglue/web/commit/867248ac8cb474451c428debae1aba985696e8cc))
* Add waitlist page, form submission logic, and integrate necessary build and routing configurations. ([9ebd3ce](https://github.com/fitglue/web/commit/9ebd3cee7208b108641d2067f68be576692689de))
* allow viewing of unsynchronized activities ([49b7b6f](https://github.com/fitglue/web/commit/49b7b6f697e667bd07497be32a3c9badfa79805a))
* **auth:** implement enhanced authentication with social login ([5deddb8](https://github.com/fitglue/web/commit/5deddb8940a88c241812416f748d3cc366e8b313))
* **ci:** implement automatic versioning and changelog generation ([55249bc](https://github.com/fitglue/web/commit/55249bc0bc89c9fb6d4f8c2a70b11db944cb5fa0))
* Configure Firebase project aliases, add local serving script, and track package dependencies. ([474e4a7](https://github.com/fitglue/web/commit/474e4a72b15a14bc88c8231de046fc6e6d417b2f))
* create components for loads of stuff ([26ea224](https://github.com/fitglue/web/commit/26ea224aef5bc034eca2f124ba47edf7afdb5744))
* **dashboard:** redesign dashboard with connection status, pipeline overview, and activity feed ([f6a1d88](https://github.com/fitglue/web/commit/f6a1d887e8e502e183e88529d85d972152fc859b))
* Display distinct waitlist success messages for new and existing subscribers. ([cf99977](https://github.com/fitglue/web/commit/cf99977213b047bf10bf97699af1c68eaf006205))
* dynamic page generation from registry data ([ec681c2](https://github.com/fitglue/web/commit/ec681c22fb4b0243bd1f2760a5cb6cb6b4b1b43a))
* empty state for synchronized page ([e09c16d](https://github.com/fitglue/web/commit/e09c16df6ac08f0127588848485415dbbe8fc0d5))
* enhance dashboard with 'Gallery of Boosts' and update marketing ([26a2944](https://github.com/fitglue/web/commit/26a2944b34391f19d8326aa723eb84359947ef8a))
* fixes to integration and pipeline wizard ([f966fdc](https://github.com/fitglue/web/commit/f966fdca2742a26f6757c867c51e99cae731c8d6))
* grant Service Account Token Creator role for workload identity impersonation ([588a33e](https://github.com/fitglue/web/commit/588a33e83f2038c814a61e3d1ce4d1bf5b5e7ebe))
* Implement environment-specific builds and VAPID key management using Vite environment variables. ([e14ba8b](https://github.com/fitglue/web/commit/e14ba8b295f605606e9263b41ff9bb18af96bde9))
* Implement FCM token registration via InputsService and adjust postbuild script. ([68ae5a1](https://github.com/fitglue/web/commit/68ae5a173286d471aa06e44024e305a0500fd3dc))
* Implement Firebase authentication with login, registration, and user dashboard pages. ([750581d](https://github.com/fitglue/web/commit/750581d7f7d2ddc8fb2e632597ec9c9d3fcc7708))
* Implement Firebase authentication, add Dashboard page, and refactor input fetching into a custom hook. ([19818d5](https://github.com/fitglue/web/commit/19818d52ef1c6656ca68b8a72f873b5cbc642857))
* Implement input loading state for better caching and refactor navigation to use `react-router-dom`. ([32bd5d3](https://github.com/fitglue/web/commit/32bd5d322bd555a2d30a5a20e9553599dccc11f5))
* Implement pending inputs page, add OpenAPI schema and API definitions, and update build/watch scripts. ([07ede40](https://github.com/fitglue/web/commit/07ede40e8919be5a53851911784782aae1c21a86))
* Implement synchronized activity management with new API endpoints, UI pages, state, and dashboard integration. ([86480f2](https://github.com/fitglue/web/commit/86480f2fd65e5a6aee0624a813d1a4d52a28f9a5))
* improve header, footer, and legal docs ([88b89af](https://github.com/fitglue/web/commit/88b89afe970b7d7aff407f57ec36e6c349a7a452))
* improve rendering of pipeline executions ([e9c0361](https://github.com/fitglue/web/commit/e9c0361fe204e9ab10cc4a0269b1618beb5c2f9a))
* Introduce `ActivityCard`, `MetaBadge`, and `StatusBadge` components to enhance activity display and status handling across lists and details. ([2c5646d](https://github.com/fitglue/web/commit/2c5646d1ee30d6912575a6f899c98841229b1bb2))
* Introduce a new React frontend with Vite, including a pending inputs page, API client, and Firebase authentication. ([7c1a189](https://github.com/fitglue/web/commit/7c1a189a811e9ce2d22c9a7e5c9c7964cbeedc7c))
* Introduce API and service for dismissing inputs. ([bef5c7a](https://github.com/fitglue/web/commit/bef5c7a99c77d81e80155a43bcbd3f9cd6b2f0b1))
* Introduce pipeline execution trace component and dynamic HSL coloring for meta badges. ([6dcc349](https://github.com/fitglue/web/commit/6dcc3499b3a0cbe03b6131c93254b2b29f532cf9))
* Introduce SEO features with sitemap, favicon, structured data, and conditional robots.txt deployment via CircleCI. ([3200201](https://github.com/fitglue/web/commit/3200201683568f572ac3482ce3db291a052e319a))
* Manage Firebase Hosting site via Terraform and force CircleCI deployments. ([fe97a80](https://github.com/fitglue/web/commit/fe97a8054ef43d86994ce55c4b23d4359c3a2263))
* **marketing:** redesign marketing site and enhance pipeline wizard UI ([5977118](https://github.com/fitglue/web/commit/59771181848730cef47c5cb1c59aacec5bdd8374))
* Migrate Firebase API enablement and project initialization to Terraform, removing manual steps from deploy scripts. ([1585fea](https://github.com/fitglue/web/commit/1585feaa673c6a6e87c74ecd88c01f48d99e9b11))
* **notifications:** implement frontend push notification registration ([0c68389](https://github.com/fitglue/web/commit/0c683893eba65aac6d880862e693540e01d49479))
* refactor authentication pages, introduce dynamic content generation for registry details, and add a new 404 page ([9014265](https://github.com/fitglue/web/commit/901426580ec11ea3d5e0fcbbd14db4b065fd7e72))
* Relocate app HTML to a dedicated directory, update navigation paths, authentication redirects, and Firebase rewrites for clean URLs. ([5a11c0e](https://github.com/fitglue/web/commit/5a11c0ec5207ce9a42dadd8fb6dfd06d71d33ee0))
* **site:** restructure marketing site with plugins page and remove coming soon ([b85b939](https://github.com/fitglue/web/commit/b85b939b3fa1e1b4eeda1043c81a6bd6ca56c394))
* skier refactor, always use registry data from backend ([7be7df0](https://github.com/fitglue/web/commit/7be7df07e526278fb5093f9af7d748ae0f5d7970))
* snazzier design everywhere ([fa775b5](https://github.com/fitglue/web/commit/fa775b530b71e59540c5aad890cbf2dc063b7bb7))
* split deployment into dedicated `terraform-apply` and `firebase-deploy` jobs and refactor authentication. ([84413ec](https://github.com/fitglue/web/commit/84413ec77a720efc8338bfa5debbecd0b23a39ec))
* **tracing:** Visualize pipeline execution trace ([e493a60](https://github.com/fitglue/web/commit/e493a60e009bfc4d39055f3067cac47e652efd03))
* update CircleCI OIDC binding to use project number and grant service account token creator role. ([c359100](https://github.com/fitglue/web/commit/c35910038d159cfabd202afedcc549407fdc9809))
* update pending inputs page style ([2b2de51](https://github.com/fitglue/web/commit/2b2de517839d4c5fe90156de83b400059948695a))
* update pending inputs page to be prettier ([ad1ce99](https://github.com/fitglue/web/commit/ad1ce994ff1de00caced2071f7c6e000b79028cd))
* updated documentation ([2537844](https://github.com/fitglue/web/commit/2537844cb98b393d08bc4febb264600a0a529198))
* Use wildcard principal for Workload Identity binding in web deployer setup. ([41fc79a](https://github.com/fitglue/web/commit/41fc79a67d48c3d6527c8c6233ef15571c4be68d))
* **web:** enhance Activity Detail page with pipeline execution trace ([bb0aac5](https://github.com/fitglue/web/commit/bb0aac5bc27de5a33a5cd6d0fd53c1605670d479))
* **web:** enhance activity detail trace and overhaul pending inputs UI ([233f5f0](https://github.com/fitglue/web/commit/233f5f0762a8a5f32b3b5fa23c53b966b2e2b145))
* **web:** implement user management, integrations, and pipeline UI ([cf7aa01](https://github.com/fitglue/web/commit/cf7aa01800dbd56934821355fd2766b060053b89))
* **web:** overhaul auth pages and dynamic integration setup ([64038cc](https://github.com/fitglue/web/commit/64038cce443bbedccd0fef8d71a5e449e7cfaa56))
* **web:** upgrade skier to v3.0.0 ([d53121e](https://github.com/fitglue/web/commit/d53121e41702400476d34adb9d7f941fa1879d8f))


### Bug Fixes

* **activities:** improve UI formatting and readability ([7d914f0](https://github.com/fitglue/web/commit/7d914f09ad5f8eeb4b0973ce3102bca6e5abaa5c))
* add eslint config and fix failures ([cd50efc](https://github.com/fitglue/web/commit/cd50efc26a211d5a0b7554312e07a6a7d866ef58))
* allow hand-rolled firebase config if init'd config does not contain appId ([51ed440](https://github.com/fitglue/web/commit/51ed4406403191a14736de155f1825005830569d))
* allow sub-paths for activities api ([90967c3](https://github.com/fitglue/web/commit/90967c3bb02e7b697f08563099e197a6bd2d188a))
* backlinks ([ed8e16e](https://github.com/fitglue/web/commit/ed8e16ec2ffd51a106204ad71b9826a7f5ba90ed))
* build and remove static-dist ([d3fc184](https://github.com/fitglue/web/commit/d3fc184681683773b53cea19a2548bdbfd79491b))
* ci errors ([8740625](https://github.com/fitglue/web/commit/87406250d9fc1aad4b5e28dfaa37013d3c7f3f43))
* **ci:** add guards to prevent release tag conflicts ([da14035](https://github.com/fitglue/web/commit/da140351b06fd19b429522b845ee936848534b89))
* **ci:** fail fast if main has newer commits instead of rebasing ([8304420](https://github.com/fitglue/web/commit/8304420288c2533ab9adab9fda2159057d8db484))
* convert VAPID key into base64 from base64URL ([8105a54](https://github.com/fitglue/web/commit/8105a54c4b39c02bb1b8c4bfea8598cf051d8e1f))
* enable rewrites to profile handler ([36cc721](https://github.com/fitglue/web/commit/36cc721a51131fb92dc7a382cd1eb7acede194e8))
* esm problems ([a2d2d6c](https://github.com/fitglue/web/commit/a2d2d6c2a3fe5a9a64dadf5b297b5afcdecf9a91))
* grant `iam.serviceAccountTokenCreator` role to the workload identity pool instead of the service account itself. ([195bff2](https://github.com/fitglue/web/commit/195bff258c35d0f26a67fa01a9695fa85a8e6c9f))
* lint ([46b35fe](https://github.com/fitglue/web/commit/46b35fe254bacc133b9b266f3029f81edf62407f))
* lint and build errors ([8c35ea5](https://github.com/fitglue/web/commit/8c35ea5a533e38cf1cd8fbc3d2a6acdfe2f0d597))
* lint issues ([f439241](https://github.com/fitglue/web/commit/f439241bd300c93fa788d9aff8c3c8bd20276441))
* linting ([628f5f4](https://github.com/fitglue/web/commit/628f5f401742106e282067dc8753150fa8d80a1f))
* linting ([f64239a](https://github.com/fitglue/web/commit/f64239aee2a67ffdacd0c02539d643efe77db243))
* linting ([bd04acc](https://github.com/fitglue/web/commit/bd04accdca4f52aa22bbf3a94f18ac1cfc219e4c))
* login/register form styling ([12d3864](https://github.com/fitglue/web/commit/12d38643ff3b5248f4693fcbcf7ec23d6e328fc8))
* lookup enricher providers by number ([afa878c](https://github.com/fitglue/web/commit/afa878c14853ea3846d2e077b738ce6eb5111755))
* new pipeline button placement ([0566f90](https://github.com/fitglue/web/commit/0566f903637a1acdce5727cbec6eea038d4c920b))
* pipelines page ([152b22b](https://github.com/fitglue/web/commit/152b22b24b8bbe335713c9a12f7c0f2f18c7878c))
* remove apple login ([2f8f702](https://github.com/fitglue/web/commit/2f8f702be56ce3add6ca6a22f52d77f5d9ff7b68))
* remove copying scripts task ([5008a49](https://github.com/fitglue/web/commit/5008a4901e94cb57f25b3ffbd851fc02c615ae3a))
* remove light mode and fix infinite API calls ([1ced17c](https://github.com/fitglue/web/commit/1ced17c1f03edfff1c96d396886a6bdbc62a6c15))
* retain line breaks for descriptions ([1d9e33f](https://github.com/fitglue/web/commit/1d9e33f92acd9cf820701fd5b47c9c9102f1e369))
* revert env-file shenanigans ([110b718](https://github.com/fitglue/web/commit/110b71878995b1cb565aef2f783a27306afa375b))
* rewrite paths with trailing slashes ([c28d0a0](https://github.com/fitglue/web/commit/c28d0a0907560e347b5d00303e270b49b0858918))
* set REGISTRY_API_URL for various build targets ([d270195](https://github.com/fitglue/web/commit/d27019567865dbba8b5d438450a375cf82c7cc34))
* skier ([057b14f](https://github.com/fitglue/web/commit/057b14f5a252ef974e0c5e2a1420874df944428f))
* styles for non-app pages and logout redirect loop ([b3b13a3](https://github.com/fitglue/web/commit/b3b13a3fbde2c947decbfaf9b4ca56365fc41c84))
* try concrete rewrites ([7356444](https://github.com/fitglue/web/commit/7356444ac7422a5834e7406931df4106a5d3f124))
* type mangling ([3c63bdd](https://github.com/fitglue/web/commit/3c63bdd48f58cf49947916e1291831d8a772dbdc))
* use run rather than function ([5099de4](https://github.com/fitglue/web/commit/5099de4300a2b3b05d1686f4a106dcc716262201))

## [0.2.0](https://github.com/ripixel/fitglue-web/compare/v0.1.1...v0.2.0) (2026-01-13)


### ⚠ BREAKING CHANGES

* **web:** Updated skier static site generator from v2 to v3.

- Bump skier from ^2.0.0 to ^3.0.0
- Remove npm overrides for chalk and feed (no longer needed after
  skier's ESM conversion addressed the dependency compatibility issues)

### Features

* add marketing pages and plugin-driven pipeline UI ([933113d](https://github.com/ripixel/fitglue-web/commit/933113d118def9d033b4ee2f7b86727f37d972ba))
* **dashboard:** redesign dashboard with connection status, pipeline overview, and activity feed ([f6a1d88](https://github.com/ripixel/fitglue-web/commit/f6a1d887e8e502e183e88529d85d972152fc859b))
* fixes to integration and pipeline wizard ([f966fdc](https://github.com/ripixel/fitglue-web/commit/f966fdca2742a26f6757c867c51e99cae731c8d6))
* **web:** upgrade skier to v3.0.0 ([d53121e](https://github.com/ripixel/fitglue-web/commit/d53121e41702400476d34adb9d7f941fa1879d8f))


### Bug Fixes

* backlinks ([ed8e16e](https://github.com/ripixel/fitglue-web/commit/ed8e16ec2ffd51a106204ad71b9826a7f5ba90ed))
* build and remove static-dist ([d3fc184](https://github.com/ripixel/fitglue-web/commit/d3fc184681683773b53cea19a2548bdbfd79491b))
* ci errors ([8740625](https://github.com/ripixel/fitglue-web/commit/87406250d9fc1aad4b5e28dfaa37013d3c7f3f43))
* esm problems ([a2d2d6c](https://github.com/ripixel/fitglue-web/commit/a2d2d6c2a3fe5a9a64dadf5b297b5afcdecf9a91))
* lookup enricher providers by number ([afa878c](https://github.com/ripixel/fitglue-web/commit/afa878c14853ea3846d2e077b738ce6eb5111755))
* pipelines page ([152b22b](https://github.com/ripixel/fitglue-web/commit/152b22b24b8bbe335713c9a12f7c0f2f18c7878c))
* remove copying scripts task ([5008a49](https://github.com/ripixel/fitglue-web/commit/5008a4901e94cb57f25b3ffbd851fc02c615ae3a))
* skier ([057b14f](https://github.com/ripixel/fitglue-web/commit/057b14f5a252ef974e0c5e2a1420874df944428f))

### 0.1.1 (2026-01-10)


### Features

* Add API endpoint to dismiss pending inputs and implement dismiss functionality in the UI. ([44e15e1](https://github.com/ripixel/fitglue-web/commit/44e15e1228fe42adb3540c7a1788ed9e1addb696))
* Add auth success and error pages and configure Firebase for clean URLs and caching headers. ([5cc4f1a](https://github.com/ripixel/fitglue-web/commit/5cc4f1ad09f205de4e2033ee1393a38707f13bc3))
* Add comprehensive documentation for web project setup, local development, deployment, and architectural decisions. ([762bb9e](https://github.com/ripixel/fitglue-web/commit/762bb9ec6f2c25cad010332c5e505739ad14cade))
* Add custom 404 page and remove catch-all rewrite to index.html in Firebase config. ([207d197](https://github.com/ripixel/fitglue-web/commit/207d197a50dba6d009e10f482bb220eed8d441aa))
* add Firebase project initialization step to CircleCI configuration. ([a53179b](https://github.com/ripixel/fitglue-web/commit/a53179b08e769a27019c3a0af5bf1949f49dc10c))
* Add Firebase rewrite for Fitbit OAuth callback. ([9448b7c](https://github.com/ripixel/fitglue-web/commit/9448b7cee158136f77b12a77f1dcfd5e2557413f))
* Add Fitbit webhook handler rewrite rule to firebase.json ([9265b37](https://github.com/ripixel/fitglue-web/commit/9265b372245a24c46ff9358f81613d5c459e0679))
* Add refresh control with last updated timestamp to activity and input pages. ([b57022c](https://github.com/ripixel/fitglue-web/commit/b57022c134c49189e48d06fa04605ca43bee873d))
* Add routing for `/hooks/test` to `mock-source-handler` service. ([91a8252](https://github.com/ripixel/fitglue-web/commit/91a8252cb39b957e4e478a9467e4799b72d0d8ed))
* add type attribute to dismiss button and change its text color to red. ([867248a](https://github.com/ripixel/fitglue-web/commit/867248ac8cb474451c428debae1aba985696e8cc))
* Add waitlist page, form submission logic, and integrate necessary build and routing configurations. ([9ebd3ce](https://github.com/ripixel/fitglue-web/commit/9ebd3cee7208b108641d2067f68be576692689de))
* allow viewing of unsynchronized activities ([49b7b6f](https://github.com/ripixel/fitglue-web/commit/49b7b6f697e667bd07497be32a3c9badfa79805a))
* **auth:** implement enhanced authentication with social login ([5deddb8](https://github.com/ripixel/fitglue-web/commit/5deddb8940a88c241812416f748d3cc366e8b313))
* **ci:** implement automatic versioning and changelog generation ([55249bc](https://github.com/ripixel/fitglue-web/commit/55249bc0bc89c9fb6d4f8c2a70b11db944cb5fa0))
* Configure Firebase project aliases, add local serving script, and track package dependencies. ([474e4a7](https://github.com/ripixel/fitglue-web/commit/474e4a72b15a14bc88c8231de046fc6e6d417b2f))
* create components for loads of stuff ([26ea224](https://github.com/ripixel/fitglue-web/commit/26ea224aef5bc034eca2f124ba47edf7afdb5744))
* Display distinct waitlist success messages for new and existing subscribers. ([cf99977](https://github.com/ripixel/fitglue-web/commit/cf99977213b047bf10bf97699af1c68eaf006205))
* empty state for synchronized page ([e09c16d](https://github.com/ripixel/fitglue-web/commit/e09c16df6ac08f0127588848485415dbbe8fc0d5))
* grant Service Account Token Creator role for workload identity impersonation ([588a33e](https://github.com/ripixel/fitglue-web/commit/588a33e83f2038c814a61e3d1ce4d1bf5b5e7ebe))
* Implement environment-specific builds and VAPID key management using Vite environment variables. ([e14ba8b](https://github.com/ripixel/fitglue-web/commit/e14ba8b295f605606e9263b41ff9bb18af96bde9))
* Implement FCM token registration via InputsService and adjust postbuild script. ([68ae5a1](https://github.com/ripixel/fitglue-web/commit/68ae5a173286d471aa06e44024e305a0500fd3dc))
* Implement Firebase authentication with login, registration, and user dashboard pages. ([750581d](https://github.com/ripixel/fitglue-web/commit/750581d7f7d2ddc8fb2e632597ec9c9d3fcc7708))
* Implement Firebase authentication, add Dashboard page, and refactor input fetching into a custom hook. ([19818d5](https://github.com/ripixel/fitglue-web/commit/19818d52ef1c6656ca68b8a72f873b5cbc642857))
* Implement input loading state for better caching and refactor navigation to use `react-router-dom`. ([32bd5d3](https://github.com/ripixel/fitglue-web/commit/32bd5d322bd555a2d30a5a20e9553599dccc11f5))
* Implement pending inputs page, add OpenAPI schema and API definitions, and update build/watch scripts. ([07ede40](https://github.com/ripixel/fitglue-web/commit/07ede40e8919be5a53851911784782aae1c21a86))
* Implement synchronized activity management with new API endpoints, UI pages, state, and dashboard integration. ([86480f2](https://github.com/ripixel/fitglue-web/commit/86480f2fd65e5a6aee0624a813d1a4d52a28f9a5))
* improve rendering of pipeline executions ([e9c0361](https://github.com/ripixel/fitglue-web/commit/e9c0361fe204e9ab10cc4a0269b1618beb5c2f9a))
* Introduce `ActivityCard`, `MetaBadge`, and `StatusBadge` components to enhance activity display and status handling across lists and details. ([2c5646d](https://github.com/ripixel/fitglue-web/commit/2c5646d1ee30d6912575a6f899c98841229b1bb2))
* Introduce a new React frontend with Vite, including a pending inputs page, API client, and Firebase authentication. ([7c1a189](https://github.com/ripixel/fitglue-web/commit/7c1a189a811e9ce2d22c9a7e5c9c7964cbeedc7c))
* Introduce API and service for dismissing inputs. ([bef5c7a](https://github.com/ripixel/fitglue-web/commit/bef5c7a99c77d81e80155a43bcbd3f9cd6b2f0b1))
* Introduce pipeline execution trace component and dynamic HSL coloring for meta badges. ([6dcc349](https://github.com/ripixel/fitglue-web/commit/6dcc3499b3a0cbe03b6131c93254b2b29f532cf9))
* Introduce SEO features with sitemap, favicon, structured data, and conditional robots.txt deployment via CircleCI. ([3200201](https://github.com/ripixel/fitglue-web/commit/3200201683568f572ac3482ce3db291a052e319a))
* Manage Firebase Hosting site via Terraform and force CircleCI deployments. ([fe97a80](https://github.com/ripixel/fitglue-web/commit/fe97a8054ef43d86994ce55c4b23d4359c3a2263))
* Migrate Firebase API enablement and project initialization to Terraform, removing manual steps from deploy scripts. ([1585fea](https://github.com/ripixel/fitglue-web/commit/1585feaa673c6a6e87c74ecd88c01f48d99e9b11))
* **notifications:** implement frontend push notification registration ([0c68389](https://github.com/ripixel/fitglue-web/commit/0c683893eba65aac6d880862e693540e01d49479))
* Relocate app HTML to a dedicated directory, update navigation paths, authentication redirects, and Firebase rewrites for clean URLs. ([5a11c0e](https://github.com/ripixel/fitglue-web/commit/5a11c0ec5207ce9a42dadd8fb6dfd06d71d33ee0))
* snazzier design everywhere ([fa775b5](https://github.com/ripixel/fitglue-web/commit/fa775b530b71e59540c5aad890cbf2dc063b7bb7))
* split deployment into dedicated `terraform-apply` and `firebase-deploy` jobs and refactor authentication. ([84413ec](https://github.com/ripixel/fitglue-web/commit/84413ec77a720efc8338bfa5debbecd0b23a39ec))
* **tracing:** Visualize pipeline execution trace ([e493a60](https://github.com/ripixel/fitglue-web/commit/e493a60e009bfc4d39055f3067cac47e652efd03))
* update CircleCI OIDC binding to use project number and grant service account token creator role. ([c359100](https://github.com/ripixel/fitglue-web/commit/c35910038d159cfabd202afedcc549407fdc9809))
* update pending inputs page style ([2b2de51](https://github.com/ripixel/fitglue-web/commit/2b2de517839d4c5fe90156de83b400059948695a))
* update pending inputs page to be prettier ([ad1ce99](https://github.com/ripixel/fitglue-web/commit/ad1ce994ff1de00caced2071f7c6e000b79028cd))
* Use wildcard principal for Workload Identity binding in web deployer setup. ([41fc79a](https://github.com/ripixel/fitglue-web/commit/41fc79a67d48c3d6527c8c6233ef15571c4be68d))
* **web:** enhance Activity Detail page with pipeline execution trace ([bb0aac5](https://github.com/ripixel/fitglue-web/commit/bb0aac5bc27de5a33a5cd6d0fd53c1605670d479))
* **web:** enhance activity detail trace and overhaul pending inputs UI ([233f5f0](https://github.com/ripixel/fitglue-web/commit/233f5f0762a8a5f32b3b5fa23c53b966b2e2b145))
* **web:** implement user management, integrations, and pipeline UI ([cf7aa01](https://github.com/ripixel/fitglue-web/commit/cf7aa01800dbd56934821355fd2766b060053b89))


### Bug Fixes

* **activities:** improve UI formatting and readability ([7d914f0](https://github.com/ripixel/fitglue-web/commit/7d914f09ad5f8eeb4b0973ce3102bca6e5abaa5c))
* add eslint config and fix failures ([cd50efc](https://github.com/ripixel/fitglue-web/commit/cd50efc26a211d5a0b7554312e07a6a7d866ef58))
* allow hand-rolled firebase config if init'd config does not contain appId ([51ed440](https://github.com/ripixel/fitglue-web/commit/51ed4406403191a14736de155f1825005830569d))
* allow sub-paths for activities api ([90967c3](https://github.com/ripixel/fitglue-web/commit/90967c3bb02e7b697f08563099e197a6bd2d188a))
* **ci:** add guards to prevent release tag conflicts ([da14035](https://github.com/ripixel/fitglue-web/commit/da140351b06fd19b429522b845ee936848534b89))
* **ci:** fail fast if main has newer commits instead of rebasing ([8304420](https://github.com/ripixel/fitglue-web/commit/8304420288c2533ab9adab9fda2159057d8db484))
* convert VAPID key into base64 from base64URL ([8105a54](https://github.com/ripixel/fitglue-web/commit/8105a54c4b39c02bb1b8c4bfea8598cf051d8e1f))
* enable rewrites to profile handler ([36cc721](https://github.com/ripixel/fitglue-web/commit/36cc721a51131fb92dc7a382cd1eb7acede194e8))
* grant `iam.serviceAccountTokenCreator` role to the workload identity pool instead of the service account itself. ([195bff2](https://github.com/ripixel/fitglue-web/commit/195bff258c35d0f26a67fa01a9695fa85a8e6c9f))
* lint ([46b35fe](https://github.com/ripixel/fitglue-web/commit/46b35fe254bacc133b9b266f3029f81edf62407f))
* lint and build errors ([8c35ea5](https://github.com/ripixel/fitglue-web/commit/8c35ea5a533e38cf1cd8fbc3d2a6acdfe2f0d597))
* lint issues ([f439241](https://github.com/ripixel/fitglue-web/commit/f439241bd300c93fa788d9aff8c3c8bd20276441))
* linting ([f64239a](https://github.com/ripixel/fitglue-web/commit/f64239aee2a67ffdacd0c02539d643efe77db243))
* linting ([bd04acc](https://github.com/ripixel/fitglue-web/commit/bd04accdca4f52aa22bbf3a94f18ac1cfc219e4c))
* new pipeline button placement ([0566f90](https://github.com/ripixel/fitglue-web/commit/0566f903637a1acdce5727cbec6eea038d4c920b))
* remove apple login ([2f8f702](https://github.com/ripixel/fitglue-web/commit/2f8f702be56ce3add6ca6a22f52d77f5d9ff7b68))
* retain line breaks for descriptions ([1d9e33f](https://github.com/ripixel/fitglue-web/commit/1d9e33f92acd9cf820701fd5b47c9c9102f1e369))
* revert env-file shenanigans ([110b718](https://github.com/ripixel/fitglue-web/commit/110b71878995b1cb565aef2f783a27306afa375b))
* rewrite paths with trailing slashes ([c28d0a0](https://github.com/ripixel/fitglue-web/commit/c28d0a0907560e347b5d00303e270b49b0858918))
* styles for non-app pages and logout redirect loop ([b3b13a3](https://github.com/ripixel/fitglue-web/commit/b3b13a3fbde2c947decbfaf9b4ca56365fc41c84))
* try concrete rewrites ([7356444](https://github.com/ripixel/fitglue-web/commit/7356444ac7422a5834e7406931df4106a5d3f124))
* use run rather than function ([5099de4](https://github.com/ripixel/fitglue-web/commit/5099de4300a2b3b05d1686f4a106dcc716262201))

### 0.1.1 (2026-01-10)


### Features

* Add API endpoint to dismiss pending inputs and implement dismiss functionality in the UI. ([44e15e1](https://github.com/ripixel/fitglue-web/commit/44e15e1228fe42adb3540c7a1788ed9e1addb696))
* Add auth success and error pages and configure Firebase for clean URLs and caching headers. ([5cc4f1a](https://github.com/ripixel/fitglue-web/commit/5cc4f1ad09f205de4e2033ee1393a38707f13bc3))
* Add comprehensive documentation for web project setup, local development, deployment, and architectural decisions. ([762bb9e](https://github.com/ripixel/fitglue-web/commit/762bb9ec6f2c25cad010332c5e505739ad14cade))
* Add custom 404 page and remove catch-all rewrite to index.html in Firebase config. ([207d197](https://github.com/ripixel/fitglue-web/commit/207d197a50dba6d009e10f482bb220eed8d441aa))
* add Firebase project initialization step to CircleCI configuration. ([a53179b](https://github.com/ripixel/fitglue-web/commit/a53179b08e769a27019c3a0af5bf1949f49dc10c))
* Add Firebase rewrite for Fitbit OAuth callback. ([9448b7c](https://github.com/ripixel/fitglue-web/commit/9448b7cee158136f77b12a77f1dcfd5e2557413f))
* Add Fitbit webhook handler rewrite rule to firebase.json ([9265b37](https://github.com/ripixel/fitglue-web/commit/9265b372245a24c46ff9358f81613d5c459e0679))
* Add refresh control with last updated timestamp to activity and input pages. ([b57022c](https://github.com/ripixel/fitglue-web/commit/b57022c134c49189e48d06fa04605ca43bee873d))
* Add routing for `/hooks/test` to `mock-source-handler` service. ([91a8252](https://github.com/ripixel/fitglue-web/commit/91a8252cb39b957e4e478a9467e4799b72d0d8ed))
* add type attribute to dismiss button and change its text color to red. ([867248a](https://github.com/ripixel/fitglue-web/commit/867248ac8cb474451c428debae1aba985696e8cc))
* Add waitlist page, form submission logic, and integrate necessary build and routing configurations. ([9ebd3ce](https://github.com/ripixel/fitglue-web/commit/9ebd3cee7208b108641d2067f68be576692689de))
* allow viewing of unsynchronized activities ([49b7b6f](https://github.com/ripixel/fitglue-web/commit/49b7b6f697e667bd07497be32a3c9badfa79805a))
* **auth:** implement enhanced authentication with social login ([5deddb8](https://github.com/ripixel/fitglue-web/commit/5deddb8940a88c241812416f748d3cc366e8b313))
* **ci:** implement automatic versioning and changelog generation ([55249bc](https://github.com/ripixel/fitglue-web/commit/55249bc0bc89c9fb6d4f8c2a70b11db944cb5fa0))
* Configure Firebase project aliases, add local serving script, and track package dependencies. ([474e4a7](https://github.com/ripixel/fitglue-web/commit/474e4a72b15a14bc88c8231de046fc6e6d417b2f))
* create components for loads of stuff ([26ea224](https://github.com/ripixel/fitglue-web/commit/26ea224aef5bc034eca2f124ba47edf7afdb5744))
* Display distinct waitlist success messages for new and existing subscribers. ([cf99977](https://github.com/ripixel/fitglue-web/commit/cf99977213b047bf10bf97699af1c68eaf006205))
* empty state for synchronized page ([e09c16d](https://github.com/ripixel/fitglue-web/commit/e09c16df6ac08f0127588848485415dbbe8fc0d5))
* grant Service Account Token Creator role for workload identity impersonation ([588a33e](https://github.com/ripixel/fitglue-web/commit/588a33e83f2038c814a61e3d1ce4d1bf5b5e7ebe))
* Implement environment-specific builds and VAPID key management using Vite environment variables. ([e14ba8b](https://github.com/ripixel/fitglue-web/commit/e14ba8b295f605606e9263b41ff9bb18af96bde9))
* Implement FCM token registration via InputsService and adjust postbuild script. ([68ae5a1](https://github.com/ripixel/fitglue-web/commit/68ae5a173286d471aa06e44024e305a0500fd3dc))
* Implement Firebase authentication with login, registration, and user dashboard pages. ([750581d](https://github.com/ripixel/fitglue-web/commit/750581d7f7d2ddc8fb2e632597ec9c9d3fcc7708))
* Implement Firebase authentication, add Dashboard page, and refactor input fetching into a custom hook. ([19818d5](https://github.com/ripixel/fitglue-web/commit/19818d52ef1c6656ca68b8a72f873b5cbc642857))
* Implement input loading state for better caching and refactor navigation to use `react-router-dom`. ([32bd5d3](https://github.com/ripixel/fitglue-web/commit/32bd5d322bd555a2d30a5a20e9553599dccc11f5))
* Implement pending inputs page, add OpenAPI schema and API definitions, and update build/watch scripts. ([07ede40](https://github.com/ripixel/fitglue-web/commit/07ede40e8919be5a53851911784782aae1c21a86))
* Implement synchronized activity management with new API endpoints, UI pages, state, and dashboard integration. ([86480f2](https://github.com/ripixel/fitglue-web/commit/86480f2fd65e5a6aee0624a813d1a4d52a28f9a5))
* improve rendering of pipeline executions ([e9c0361](https://github.com/ripixel/fitglue-web/commit/e9c0361fe204e9ab10cc4a0269b1618beb5c2f9a))
* Introduce `ActivityCard`, `MetaBadge`, and `StatusBadge` components to enhance activity display and status handling across lists and details. ([2c5646d](https://github.com/ripixel/fitglue-web/commit/2c5646d1ee30d6912575a6f899c98841229b1bb2))
* Introduce a new React frontend with Vite, including a pending inputs page, API client, and Firebase authentication. ([7c1a189](https://github.com/ripixel/fitglue-web/commit/7c1a189a811e9ce2d22c9a7e5c9c7964cbeedc7c))
* Introduce API and service for dismissing inputs. ([bef5c7a](https://github.com/ripixel/fitglue-web/commit/bef5c7a99c77d81e80155a43bcbd3f9cd6b2f0b1))
* Introduce pipeline execution trace component and dynamic HSL coloring for meta badges. ([6dcc349](https://github.com/ripixel/fitglue-web/commit/6dcc3499b3a0cbe03b6131c93254b2b29f532cf9))
* Introduce SEO features with sitemap, favicon, structured data, and conditional robots.txt deployment via CircleCI. ([3200201](https://github.com/ripixel/fitglue-web/commit/3200201683568f572ac3482ce3db291a052e319a))
* Manage Firebase Hosting site via Terraform and force CircleCI deployments. ([fe97a80](https://github.com/ripixel/fitglue-web/commit/fe97a8054ef43d86994ce55c4b23d4359c3a2263))
* Migrate Firebase API enablement and project initialization to Terraform, removing manual steps from deploy scripts. ([1585fea](https://github.com/ripixel/fitglue-web/commit/1585feaa673c6a6e87c74ecd88c01f48d99e9b11))
* **notifications:** implement frontend push notification registration ([0c68389](https://github.com/ripixel/fitglue-web/commit/0c683893eba65aac6d880862e693540e01d49479))
* Relocate app HTML to a dedicated directory, update navigation paths, authentication redirects, and Firebase rewrites for clean URLs. ([5a11c0e](https://github.com/ripixel/fitglue-web/commit/5a11c0ec5207ce9a42dadd8fb6dfd06d71d33ee0))
* snazzier design everywhere ([fa775b5](https://github.com/ripixel/fitglue-web/commit/fa775b530b71e59540c5aad890cbf2dc063b7bb7))
* split deployment into dedicated `terraform-apply` and `firebase-deploy` jobs and refactor authentication. ([84413ec](https://github.com/ripixel/fitglue-web/commit/84413ec77a720efc8338bfa5debbecd0b23a39ec))
* **tracing:** Visualize pipeline execution trace ([e493a60](https://github.com/ripixel/fitglue-web/commit/e493a60e009bfc4d39055f3067cac47e652efd03))
* update CircleCI OIDC binding to use project number and grant service account token creator role. ([c359100](https://github.com/ripixel/fitglue-web/commit/c35910038d159cfabd202afedcc549407fdc9809))
* update pending inputs page style ([2b2de51](https://github.com/ripixel/fitglue-web/commit/2b2de517839d4c5fe90156de83b400059948695a))
* update pending inputs page to be prettier ([ad1ce99](https://github.com/ripixel/fitglue-web/commit/ad1ce994ff1de00caced2071f7c6e000b79028cd))
* Use wildcard principal for Workload Identity binding in web deployer setup. ([41fc79a](https://github.com/ripixel/fitglue-web/commit/41fc79a67d48c3d6527c8c6233ef15571c4be68d))
* **web:** enhance Activity Detail page with pipeline execution trace ([bb0aac5](https://github.com/ripixel/fitglue-web/commit/bb0aac5bc27de5a33a5cd6d0fd53c1605670d479))
* **web:** enhance activity detail trace and overhaul pending inputs UI ([233f5f0](https://github.com/ripixel/fitglue-web/commit/233f5f0762a8a5f32b3b5fa23c53b966b2e2b145))
* **web:** implement user management, integrations, and pipeline UI ([cf7aa01](https://github.com/ripixel/fitglue-web/commit/cf7aa01800dbd56934821355fd2766b060053b89))


### Bug Fixes

* **activities:** improve UI formatting and readability ([7d914f0](https://github.com/ripixel/fitglue-web/commit/7d914f09ad5f8eeb4b0973ce3102bca6e5abaa5c))
* add eslint config and fix failures ([cd50efc](https://github.com/ripixel/fitglue-web/commit/cd50efc26a211d5a0b7554312e07a6a7d866ef58))
* allow hand-rolled firebase config if init'd config does not contain appId ([51ed440](https://github.com/ripixel/fitglue-web/commit/51ed4406403191a14736de155f1825005830569d))
* allow sub-paths for activities api ([90967c3](https://github.com/ripixel/fitglue-web/commit/90967c3bb02e7b697f08563099e197a6bd2d188a))
* convert VAPID key into base64 from base64URL ([8105a54](https://github.com/ripixel/fitglue-web/commit/8105a54c4b39c02bb1b8c4bfea8598cf051d8e1f))
* grant `iam.serviceAccountTokenCreator` role to the workload identity pool instead of the service account itself. ([195bff2](https://github.com/ripixel/fitglue-web/commit/195bff258c35d0f26a67fa01a9695fa85a8e6c9f))
* lint ([46b35fe](https://github.com/ripixel/fitglue-web/commit/46b35fe254bacc133b9b266f3029f81edf62407f))
* lint and build errors ([8c35ea5](https://github.com/ripixel/fitglue-web/commit/8c35ea5a533e38cf1cd8fbc3d2a6acdfe2f0d597))
* lint issues ([f439241](https://github.com/ripixel/fitglue-web/commit/f439241bd300c93fa788d9aff8c3c8bd20276441))
* linting ([f64239a](https://github.com/ripixel/fitglue-web/commit/f64239aee2a67ffdacd0c02539d643efe77db243))
* linting ([bd04acc](https://github.com/ripixel/fitglue-web/commit/bd04accdca4f52aa22bbf3a94f18ac1cfc219e4c))
* retain line breaks for descriptions ([1d9e33f](https://github.com/ripixel/fitglue-web/commit/1d9e33f92acd9cf820701fd5b47c9c9102f1e369))
* revert env-file shenanigans ([110b718](https://github.com/ripixel/fitglue-web/commit/110b71878995b1cb565aef2f783a27306afa375b))
* try concrete rewrites ([7356444](https://github.com/ripixel/fitglue-web/commit/7356444ac7422a5834e7406931df4106a5d3f124))
* use run rather than function ([5099de4](https://github.com/ripixel/fitglue-web/commit/5099de4300a2b3b05d1686f4a106dcc716262201))

### 0.1.1 (2026-01-09)


### Features

* Add API endpoint to dismiss pending inputs and implement dismiss functionality in the UI. ([44e15e1](https://github.com/ripixel/fitglue-web/commit/44e15e1228fe42adb3540c7a1788ed9e1addb696))
* Add auth success and error pages and configure Firebase for clean URLs and caching headers. ([5cc4f1a](https://github.com/ripixel/fitglue-web/commit/5cc4f1ad09f205de4e2033ee1393a38707f13bc3))
* Add comprehensive documentation for web project setup, local development, deployment, and architectural decisions. ([762bb9e](https://github.com/ripixel/fitglue-web/commit/762bb9ec6f2c25cad010332c5e505739ad14cade))
* Add custom 404 page and remove catch-all rewrite to index.html in Firebase config. ([207d197](https://github.com/ripixel/fitglue-web/commit/207d197a50dba6d009e10f482bb220eed8d441aa))
* add Firebase project initialization step to CircleCI configuration. ([a53179b](https://github.com/ripixel/fitglue-web/commit/a53179b08e769a27019c3a0af5bf1949f49dc10c))
* Add Firebase rewrite for Fitbit OAuth callback. ([9448b7c](https://github.com/ripixel/fitglue-web/commit/9448b7cee158136f77b12a77f1dcfd5e2557413f))
* Add Fitbit webhook handler rewrite rule to firebase.json ([9265b37](https://github.com/ripixel/fitglue-web/commit/9265b372245a24c46ff9358f81613d5c459e0679))
* Add refresh control with last updated timestamp to activity and input pages. ([b57022c](https://github.com/ripixel/fitglue-web/commit/b57022c134c49189e48d06fa04605ca43bee873d))
* Add routing for `/hooks/test` to `mock-source-handler` service. ([91a8252](https://github.com/ripixel/fitglue-web/commit/91a8252cb39b957e4e478a9467e4799b72d0d8ed))
* add type attribute to dismiss button and change its text color to red. ([867248a](https://github.com/ripixel/fitglue-web/commit/867248ac8cb474451c428debae1aba985696e8cc))
* Add waitlist page, form submission logic, and integrate necessary build and routing configurations. ([9ebd3ce](https://github.com/ripixel/fitglue-web/commit/9ebd3cee7208b108641d2067f68be576692689de))
* allow viewing of unsynchronized activities ([49b7b6f](https://github.com/ripixel/fitglue-web/commit/49b7b6f697e667bd07497be32a3c9badfa79805a))
* **ci:** implement automatic versioning and changelog generation ([55249bc](https://github.com/ripixel/fitglue-web/commit/55249bc0bc89c9fb6d4f8c2a70b11db944cb5fa0))
* Configure Firebase project aliases, add local serving script, and track package dependencies. ([474e4a7](https://github.com/ripixel/fitglue-web/commit/474e4a72b15a14bc88c8231de046fc6e6d417b2f))
* create components for loads of stuff ([26ea224](https://github.com/ripixel/fitglue-web/commit/26ea224aef5bc034eca2f124ba47edf7afdb5744))
* Display distinct waitlist success messages for new and existing subscribers. ([cf99977](https://github.com/ripixel/fitglue-web/commit/cf99977213b047bf10bf97699af1c68eaf006205))
* empty state for synchronized page ([e09c16d](https://github.com/ripixel/fitglue-web/commit/e09c16df6ac08f0127588848485415dbbe8fc0d5))
* grant Service Account Token Creator role for workload identity impersonation ([588a33e](https://github.com/ripixel/fitglue-web/commit/588a33e83f2038c814a61e3d1ce4d1bf5b5e7ebe))
* Implement environment-specific builds and VAPID key management using Vite environment variables. ([e14ba8b](https://github.com/ripixel/fitglue-web/commit/e14ba8b295f605606e9263b41ff9bb18af96bde9))
* Implement FCM token registration via InputsService and adjust postbuild script. ([68ae5a1](https://github.com/ripixel/fitglue-web/commit/68ae5a173286d471aa06e44024e305a0500fd3dc))
* Implement Firebase authentication with login, registration, and user dashboard pages. ([750581d](https://github.com/ripixel/fitglue-web/commit/750581d7f7d2ddc8fb2e632597ec9c9d3fcc7708))
* Implement Firebase authentication, add Dashboard page, and refactor input fetching into a custom hook. ([19818d5](https://github.com/ripixel/fitglue-web/commit/19818d52ef1c6656ca68b8a72f873b5cbc642857))
* Implement input loading state for better caching and refactor navigation to use `react-router-dom`. ([32bd5d3](https://github.com/ripixel/fitglue-web/commit/32bd5d322bd555a2d30a5a20e9553599dccc11f5))
* Implement pending inputs page, add OpenAPI schema and API definitions, and update build/watch scripts. ([07ede40](https://github.com/ripixel/fitglue-web/commit/07ede40e8919be5a53851911784782aae1c21a86))
* Implement synchronized activity management with new API endpoints, UI pages, state, and dashboard integration. ([86480f2](https://github.com/ripixel/fitglue-web/commit/86480f2fd65e5a6aee0624a813d1a4d52a28f9a5))
* improve rendering of pipeline executions ([e9c0361](https://github.com/ripixel/fitglue-web/commit/e9c0361fe204e9ab10cc4a0269b1618beb5c2f9a))
* Introduce `ActivityCard`, `MetaBadge`, and `StatusBadge` components to enhance activity display and status handling across lists and details. ([2c5646d](https://github.com/ripixel/fitglue-web/commit/2c5646d1ee30d6912575a6f899c98841229b1bb2))
* Introduce a new React frontend with Vite, including a pending inputs page, API client, and Firebase authentication. ([7c1a189](https://github.com/ripixel/fitglue-web/commit/7c1a189a811e9ce2d22c9a7e5c9c7964cbeedc7c))
* Introduce API and service for dismissing inputs. ([bef5c7a](https://github.com/ripixel/fitglue-web/commit/bef5c7a99c77d81e80155a43bcbd3f9cd6b2f0b1))
* Introduce pipeline execution trace component and dynamic HSL coloring for meta badges. ([6dcc349](https://github.com/ripixel/fitglue-web/commit/6dcc3499b3a0cbe03b6131c93254b2b29f532cf9))
* Introduce SEO features with sitemap, favicon, structured data, and conditional robots.txt deployment via CircleCI. ([3200201](https://github.com/ripixel/fitglue-web/commit/3200201683568f572ac3482ce3db291a052e319a))
* Manage Firebase Hosting site via Terraform and force CircleCI deployments. ([fe97a80](https://github.com/ripixel/fitglue-web/commit/fe97a8054ef43d86994ce55c4b23d4359c3a2263))
* Migrate Firebase API enablement and project initialization to Terraform, removing manual steps from deploy scripts. ([1585fea](https://github.com/ripixel/fitglue-web/commit/1585feaa673c6a6e87c74ecd88c01f48d99e9b11))
* **notifications:** implement frontend push notification registration ([0c68389](https://github.com/ripixel/fitglue-web/commit/0c683893eba65aac6d880862e693540e01d49479))
* Relocate app HTML to a dedicated directory, update navigation paths, authentication redirects, and Firebase rewrites for clean URLs. ([5a11c0e](https://github.com/ripixel/fitglue-web/commit/5a11c0ec5207ce9a42dadd8fb6dfd06d71d33ee0))
* snazzier design everywhere ([fa775b5](https://github.com/ripixel/fitglue-web/commit/fa775b530b71e59540c5aad890cbf2dc063b7bb7))
* split deployment into dedicated `terraform-apply` and `firebase-deploy` jobs and refactor authentication. ([84413ec](https://github.com/ripixel/fitglue-web/commit/84413ec77a720efc8338bfa5debbecd0b23a39ec))
* **tracing:** Visualize pipeline execution trace ([e493a60](https://github.com/ripixel/fitglue-web/commit/e493a60e009bfc4d39055f3067cac47e652efd03))
* update CircleCI OIDC binding to use project number and grant service account token creator role. ([c359100](https://github.com/ripixel/fitglue-web/commit/c35910038d159cfabd202afedcc549407fdc9809))
* update pending inputs page style ([2b2de51](https://github.com/ripixel/fitglue-web/commit/2b2de517839d4c5fe90156de83b400059948695a))
* update pending inputs page to be prettier ([ad1ce99](https://github.com/ripixel/fitglue-web/commit/ad1ce994ff1de00caced2071f7c6e000b79028cd))
* Use wildcard principal for Workload Identity binding in web deployer setup. ([41fc79a](https://github.com/ripixel/fitglue-web/commit/41fc79a67d48c3d6527c8c6233ef15571c4be68d))
* **web:** enhance Activity Detail page with pipeline execution trace ([bb0aac5](https://github.com/ripixel/fitglue-web/commit/bb0aac5bc27de5a33a5cd6d0fd53c1605670d479))
* **web:** enhance activity detail trace and overhaul pending inputs UI ([233f5f0](https://github.com/ripixel/fitglue-web/commit/233f5f0762a8a5f32b3b5fa23c53b966b2e2b145))


### Bug Fixes

* **activities:** improve UI formatting and readability ([7d914f0](https://github.com/ripixel/fitglue-web/commit/7d914f09ad5f8eeb4b0973ce3102bca6e5abaa5c))
* add eslint config and fix failures ([cd50efc](https://github.com/ripixel/fitglue-web/commit/cd50efc26a211d5a0b7554312e07a6a7d866ef58))
* allow hand-rolled firebase config if init'd config does not contain appId ([51ed440](https://github.com/ripixel/fitglue-web/commit/51ed4406403191a14736de155f1825005830569d))
* allow sub-paths for activities api ([90967c3](https://github.com/ripixel/fitglue-web/commit/90967c3bb02e7b697f08563099e197a6bd2d188a))
* convert VAPID key into base64 from base64URL ([8105a54](https://github.com/ripixel/fitglue-web/commit/8105a54c4b39c02bb1b8c4bfea8598cf051d8e1f))
* grant `iam.serviceAccountTokenCreator` role to the workload identity pool instead of the service account itself. ([195bff2](https://github.com/ripixel/fitglue-web/commit/195bff258c35d0f26a67fa01a9695fa85a8e6c9f))
* lint ([46b35fe](https://github.com/ripixel/fitglue-web/commit/46b35fe254bacc133b9b266f3029f81edf62407f))
* lint and build errors ([8c35ea5](https://github.com/ripixel/fitglue-web/commit/8c35ea5a533e38cf1cd8fbc3d2a6acdfe2f0d597))
* lint issues ([f439241](https://github.com/ripixel/fitglue-web/commit/f439241bd300c93fa788d9aff8c3c8bd20276441))
* linting ([bd04acc](https://github.com/ripixel/fitglue-web/commit/bd04accdca4f52aa22bbf3a94f18ac1cfc219e4c))
* retain line breaks for descriptions ([1d9e33f](https://github.com/ripixel/fitglue-web/commit/1d9e33f92acd9cf820701fd5b47c9c9102f1e369))
* revert env-file shenanigans ([110b718](https://github.com/ripixel/fitglue-web/commit/110b71878995b1cb565aef2f783a27306afa375b))
* try concrete rewrites ([7356444](https://github.com/ripixel/fitglue-web/commit/7356444ac7422a5834e7406931df4106a5d3f124))
* use run rather than function ([5099de4](https://github.com/ripixel/fitglue-web/commit/5099de4300a2b3b05d1686f4a106dcc716262201))

## [0.1.0] - 2024-01-09

### Added
- Initial versioning system setup.
