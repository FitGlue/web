# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [9.1.0](https://github.com/fitglue/web/compare/v9.0.1...v9.1.0) (2026-02-03)


### Features

* redesign connections page with premium GlowCard styling ([6ea765c](https://github.com/fitglue/web/commit/6ea765ca0912178eb1151ca9f2238456fe163e89))

### [9.0.1](https://github.com/fitglue/web/compare/v9.0.0...v9.0.1) (2026-02-03)

## [9.0.0](https://github.com/fitglue/web/compare/v8.6.0...v9.0.0) (2026-02-03)


### ⚠ BREAKING CHANGES

* **ui:** Destination badges now render by status category
(success/failed/pending) instead of all together. UI consumers
expecting a single flat list of destinations will see different markup.

- Display destinations by status (success, failed, pending) with distinct styling
- Show pending destinations with muted opacity when pipeline failed at enricher
- Add dedicated Failed Destinations section with error messages
- Add Not Synced section for configured but unexecuted destinations
- Fix RepostActionsMenu to correctly show icons for retry actions
- Update EnrichedActivityCard to handle pending destination badges
- Update showcase.html with Wall Balls station data

### Features

* much prettier showcase page and activity detail page ([1ae7252](https://github.com/fitglue/web/commit/1ae72529e124e3de714e4327e4efe794af817209))
* **ui:** improve destination status display on Activity Detail Page ([b85a8b4](https://github.com/fitglue/web/commit/b85a8b4e5caab8b297db5727be29ffb273afc370))


### Bug Fixes

* pipeline runs display ([0b58c4e](https://github.com/fitglue/web/commit/0b58c4e19dfccc7a9dc0b57b3eb5e2a54f119ed7))
* show all interpolated heart rate data ([0c214db](https://github.com/fitglue/web/commit/0c214dbbd5802765410934c6fc73b3456c8abca2))

## [8.6.0](https://github.com/fitglue/web/compare/v8.5.0...v8.6.0) (2026-02-02)


### Features

* add full-width layout option and enhance modal styling ([d015c8e](https://github.com/fitglue/web/commit/d015c8ec29760e22637ba6e3741aca007fb9d3ff))

## [8.5.0](https://github.com/fitglue/web/compare/v8.4.4...v8.5.0) (2026-02-02)


### Features

* enhance user feedback with toast notifications and improve error handling ([97b319e](https://github.com/fitglue/web/commit/97b319e402b7d676d9454bcbdd18dc5ac387934a))

### [8.4.4](https://github.com/fitglue/web/compare/v8.4.3...v8.4.4) (2026-02-02)

### [8.4.3](https://github.com/fitglue/web/compare/v8.4.2...v8.4.3) (2026-02-02)

### [8.4.2](https://github.com/fitglue/web/compare/v8.4.1...v8.4.2) (2026-02-02)


### Bug Fixes

* implement global listener registry for Firestore hooks ([f5110d5](https://github.com/fitglue/web/commit/f5110d52ee2ac441491c49db00146fcb372c1b77))
* transition to realtime pipeline runs and update related components ([a63c63d](https://github.com/fitglue/web/commit/a63c63ddfc659fac2c84602a9c6ded64969d50b3))

### [8.4.1](https://github.com/fitglue/web/compare/v8.4.0...v8.4.1) (2026-02-02)


### Bug Fixes

* **pipeline runs:** transition to realtime pipeline runs and clean up Firestore rules ([194e552](https://github.com/fitglue/web/commit/194e5521027570e223f827398cdd45ff7a979750))

## [8.4.0](https://github.com/fitglue/web/compare/v8.3.2...v8.4.0) (2026-02-02)


### Features

* Massive styling pass ([3f408b9](https://github.com/fitglue/web/commit/3f408b91a5eb15ab501a8f2e5de1a1260dffb391))

### [8.3.2](https://github.com/fitglue/web/compare/v8.3.1...v8.3.2) (2026-02-02)

### [8.3.1](https://github.com/fitglue/web/compare/v8.3.0...v8.3.1) (2026-02-02)


### Bug Fixes

* empty state for gallery of boosts ([78181a2](https://github.com/fitglue/web/commit/78181a2282104757b9bc295ac2d82c3a965794ec))

## [8.3.0](https://github.com/fitglue/web/compare/v8.2.0...v8.3.0) (2026-02-02)


### Features

* refactor activity, pipeline, input, and integration data fetching to use new realtime hooks and remove the API key setup modal. ([dace5a2](https://github.com/fitglue/web/commit/dace5a239f1b755f0010f85dc63552956d8dbf25))

## [8.2.0](https://github.com/fitglue/web/compare/v8.1.1...v8.2.0) (2026-02-01)


### Features

* **api:** update generated types for running dynamics support ([30ad859](https://github.com/fitglue/web/commit/30ad859d3441a3b10a0bfd48c2fccbb9b0f74dde))
* **web:** enhance account management and implement enricher data UI ([bfa47d3](https://github.com/fitglue/web/commit/bfa47d3b5ec9a31ac0dcf2658c74f24a79abd922))

### [8.1.1](https://github.com/fitglue/web/compare/v8.1.0...v8.1.1) (2026-01-26)

## [8.1.0](https://github.com/fitglue/web/compare/v8.0.0...v8.1.0) (2026-01-26)


### Features

* **ui:** add skeleton loading pattern with extracted dashboard components ([67dbb15](https://github.com/fitglue/web/commit/67dbb1586501ce847cd92af58c97c377fc0f7fd6))

## [8.0.0](https://github.com/fitglue/web/compare/v7.0.1...v8.0.0) (2026-01-26)


### ⚠ BREAKING CHANGES

* Created component library, and refactored all components and pages to use them - some still in progress.

### Features

* Major UI overhaul ([673edcc](https://github.com/fitglue/web/commit/673edcc44651b9c19d434153c74e26ca232de836))

### [7.0.1](https://github.com/fitglue/web/compare/v7.0.0...v7.0.1) (2026-01-25)


### Bug Fixes

* pending inputs page grabs source name correctly ([f98fe0f](https://github.com/fitglue/web/commit/f98fe0fbf823f365e95621584a485f5bdb0499df))

## [7.0.0](https://github.com/fitglue/web/compare/v6.0.2...v7.0.0) (2026-01-25)


### ⚠ BREAKING CHANGES

* Major component library refactor across the web-app estate

### Features

* UI Component library refactor ([961080b](https://github.com/fitglue/web/commit/961080bb62fe5cd5fbbd0a8825ff208599c4fd8f))

### [6.0.2](https://github.com/fitglue/web/compare/v6.0.1...v6.0.2) (2026-01-24)


### Bug Fixes

* style updates to pending inputs on dashboard and list page ([f1d79e1](https://github.com/fitglue/web/commit/f1d79e107c0dc356230bdf5665b21abc9a5f9fec))

### [6.0.1](https://github.com/fitglue/web/compare/v6.0.0...v6.0.1) (2026-01-24)


### Bug Fixes

* source formatting on enriched activity card ([5386904](https://github.com/fitglue/web/commit/5386904ab035f722be2b9b1456341e2afdc5c0aa))

## [6.0.0](https://github.com/fitglue/web/compare/v5.3.0...v6.0.0) (2026-01-24)


### ⚠ BREAKING CHANGES

* PendingInput schema now includes pipelineId field; clients should handle this new property.

- Show pipeline names in EnrichedActivityCard and PendingInputsPage
- Add red styling for failed destination pills
- Derive source name and icon from pipeline's source via registry lookup
- Add UploadedActivityRecord type for loop prevention ledger
- Sync ActivitySource enum with new destination-only sources

### Features

* enhance activity cards and pending inputs with pipeline context and failed status ([38041a2](https://github.com/fitglue/web/commit/38041a262838c029805289b435b0d01748f2e3a3))

## [5.3.0](https://github.com/fitglue/web/compare/v5.2.0...v5.3.0) (2026-01-24)


### Features

* many things I'm tired ([dc6cb91](https://github.com/fitglue/web/commit/dc6cb91265fb47eeeaf1f5f9a1d1173083386944))

## [5.2.0](https://github.com/fitglue/web/compare/v5.1.3...v5.2.0) (2026-01-23)


### Features

* better showcase styling and athlete banners ([06e1e85](https://github.com/fitglue/web/commit/06e1e85bb2045163f58bdf17d081f4f4746d1d21))

### [5.1.3](https://github.com/fitglue/web/compare/v5.1.2...v5.1.3) (2026-01-23)


### Bug Fixes

* activity detail page not rendering SVG assets correctly ([6f02e7d](https://github.com/fitglue/web/commit/6f02e7d767e6d1c7c511dcf77b3c6646b3074493))
* tier-related ui issues ([243f192](https://github.com/fitglue/web/commit/243f192afab252432f427f7aae13eef96f461ec9))

### [5.1.2](https://github.com/fitglue/web/compare/v5.1.1...v5.1.2) (2026-01-23)


### Bug Fixes

* initmap issue ([a389445](https://github.com/fitglue/web/commit/a389445dc2fe5a6ff9c5657ea9811f8c76f0119f))
* showcase getElementById didn't exist ([ae6e923](https://github.com/fitglue/web/commit/ae6e9232efe464e88edcca12723876acd390b8c6))

### [5.1.1](https://github.com/fitglue/web/compare/v5.1.0...v5.1.1) (2026-01-23)


### Bug Fixes

* unicode symbols instead of && ([86f54f9](https://github.com/fitglue/web/commit/86f54f94d6de97667a468391e143c82a805a2915))

## [5.1.0](https://github.com/fitglue/web/compare/v5.0.3...v5.1.0) (2026-01-23)


### Features

* add generated assets to activity detail page ([a2357c5](https://github.com/fitglue/web/commit/a2357c5a5bcd7b53eb5daf2e98e2973c73b53fc2))

### [5.0.3](https://github.com/fitglue/web/compare/v5.0.2...v5.0.3) (2026-01-23)

### [5.0.2](https://github.com/fitglue/web/compare/v5.0.1...v5.0.2) (2026-01-23)


### Bug Fixes

* coming soon badges and pricing updates ([9775a46](https://github.com/fitglue/web/commit/9775a462adab241a5cceb0f016cdea55225cf56a))

### [5.0.1](https://github.com/fitglue/web/compare/v5.0.0...v5.0.1) (2026-01-23)


### Bug Fixes

* pass marketingMode flag to registry call ([5353aa3](https://github.com/fitglue/web/commit/5353aa3964d0497380e655744ede6263f1d12ad6))

## [5.0.0](https://github.com/fitglue/web/compare/v4.0.2...v5.0.0) (2026-01-23)


### ⚠ BREAKING CHANGES

* **ui:** implement registry-driven icon fidelity and hybrid rendering

### Features

* **ui:** implement registry-driven icon fidelity and hybrid rendering ([bf896c0](https://github.com/fitglue/web/commit/bf896c0077c1dc77634a2aee55cbc955bf85aad6))

### [4.0.2](https://github.com/fitglue/web/compare/v4.0.1...v4.0.2) (2026-01-22)


### Bug Fixes

* env vars for sentry and build process ([744e5ea](https://github.com/fitglue/web/commit/744e5eae4f30b481502a4696cd090a687c9fb95e))

### [4.0.1](https://github.com/fitglue/web/compare/v4.0.0...v4.0.1) (2026-01-22)


### Bug Fixes

* correct env vars for sentry ([4ad4ce4](https://github.com/fitglue/web/commit/4ad4ce4a43d9d33f263eef9b8248ec8fb3dff560))

## [4.0.0](https://github.com/fitglue/web/compare/v3.1.0...v4.0.0) (2026-01-22)


### ⚠ BREAKING CHANGES

* **web:** Synchronized TypeScript types and enum formatters are incompatible with previous versions due to mandatory Protobuf enum updates in the server repository.

### Features

* add pipeline toggling and sentry integration ([23dbe7d](https://github.com/fitglue/web/commit/23dbe7d055463927b2c140e510cc485f1785e5f2))
* **web:** premium showcase overhaul and breaking type synchronization ([8612a6d](https://github.com/fitglue/web/commit/8612a6d1cd97112c6e7505c149666a5e58fdf322))


### Bug Fixes

* generated up-to-date-protos ([151add1](https://github.com/fitglue/web/commit/151add1b3f1fcd7aa6f31cdc1f454aeccbae9fb5))
* sentry setup and some bug fixing ([d751114](https://github.com/fitglue/web/commit/d75111481d5e5668ef75f2132a8e2f1d16e02126))

## [3.1.0](https://github.com/fitglue/web/compare/v3.0.0...v3.1.0) (2026-01-21)


### Features

* add plugin categories and merge magic and features pages ([860e39d](https://github.com/fitglue/web/commit/860e39daa44939f5aeb85c382c159e38f9e62d7d))
* **web:** bump version to 3.0.0 and sync generated protobufs ([44b7a6b](https://github.com/fitglue/web/commit/44b7a6b1c5a3e61be75e4d4ad6a112206fa4212a))

## [3.0.0](https://github.com/fitglue/web/compare/v2.2.1...v3.0.0) (2026-01-21)


### ⚠ BREAKING CHANGES

* strava source and changes to user mappings

### Features

* strava source and changes to user mappings ([f2e1862](https://github.com/fitglue/web/commit/f2e186205e876035c30f994b07f2a645b44ea164))


### Bug Fixes

* change "via" and "activity type" tag ordering on activity detail page ([4fdfba4](https://github.com/fitglue/web/commit/4fdfba450d5ca64829205f7ed6efbd0041f39607))
* stats on dashboard and activities list page ([b6d723b](https://github.com/fitglue/web/commit/b6d723b356dbf2032b8c66ef6670da753d7b6b41))

### [2.2.1](https://github.com/fitglue/web/compare/v2.2.0...v2.2.1) (2026-01-21)

## [2.2.0](https://github.com/fitglue/web/compare/v2.1.2...v2.2.0) (2026-01-21)


### Features

* Display backend-provided activity statistics and refactor user tiers to an enum, renaming 'Pro' to 'Athlete' and adding prevented sync counts. ([cdd42ac](https://github.com/fitglue/web/commit/cdd42acd71f4c776335b5ae8b57299a750238a3b))


### Bug Fixes

* parkrun import and integrations endpoint ([78bf79e](https://github.com/fitglue/web/commit/78bf79e9ccb8d37016b20aed6f0497d13e78cb73))

### [2.1.2](https://github.com/fitglue/web/compare/v2.1.1...v2.1.2) (2026-01-21)


### Bug Fixes

* **showcase:** use registry data, align exercises, supersets ([2758042](https://github.com/fitglue/web/commit/2758042ef88349b4944bb9ad62f9f9c79b3b4e47))

### [2.1.1](https://github.com/fitglue/web/compare/v2.1.0...v2.1.1) (2026-01-21)

## [2.1.0](https://github.com/fitglue/web/compare/v2.0.0...v2.1.0) (2026-01-21)


### Features

* improvements to live sync and enum usage ([88b8136](https://github.com/fitglue/web/commit/88b813673a592050a50853b925160461c48ded47))

## [2.0.0](https://github.com/fitglue/web/compare/v1.14.0...v2.0.0) (2026-01-20)


### ⚠ BREAKING CHANGES

* many updates to marketing terminology, add AI and fix pipeline sharing for app, unlock registration for waitlist

### Features

* many updates to marketing terminology, add AI and fix pipeline sharing for app, unlock registration for waitlist ([62e4317](https://github.com/fitglue/web/commit/62e43171656b6b4075cdf57e1985b2000ff54fbc))

## [1.14.0](https://github.com/fitglue/web/compare/v1.13.0...v1.14.0) (2026-01-20)


### Features

* remove social logins ([e7379bf](https://github.com/fitglue/web/commit/e7379bfb912dffb0f7c6f2d9563e076845cf2da9))

## [1.13.0](https://github.com/fitglue/web/compare/v1.12.0...v1.13.0) (2026-01-20)


### Features

* pipeline import/export and emoji hardcoding removal ([b37b7e5](https://github.com/fitglue/web/commit/b37b7e506b7c235cca3f0fc79849989afc7367fb))

## [1.12.0](https://github.com/fitglue/web/compare/v1.11.0...v1.12.0) (2026-01-20)


### Features

* Implement real-time activity updates and enhance activity detail page with dynamic source/destination information. ([8d3bd81](https://github.com/fitglue/web/commit/8d3bd8192d71c254aec676da5a9e7484496bf38f))

## [1.11.0](https://github.com/fitglue/web/compare/v1.10.0...v1.11.0) (2026-01-20)


### Features

* Add user filtering capabilities and an execution detail modal to the Admin page. ([956f2e8](https://github.com/fitglue/web/commit/956f2e899c080f7781de39a3c2b714073c40f6e0))

## [1.10.0](https://github.com/fitglue/web/compare/v1.9.1...v1.10.0) (2026-01-20)


### Features

* admin page capability updates ([d2193c6](https://github.com/fitglue/web/commit/d2193c6960ef8711323c790a509742120fb226af))
* Introduce new admin API route and refactor Admin page state management with `useReducer`, update app version, and refine various type definitions. ([8fb8ecc](https://github.com/fitglue/web/commit/8fb8ecc5b92e299dc4dc2a0d00ec72e07cacb02a))

### [1.9.1](https://github.com/fitglue/web/compare/v1.9.0...v1.9.1) (2026-01-19)


### Bug Fixes

* repost actions menu uses destinations enum ([118d739](https://github.com/fitglue/web/commit/118d739821edd24164392128d19ca5491b3fc493))

## [1.9.0](https://github.com/fitglue/web/compare/v1.8.0...v1.9.0) (2026-01-19)


### Features

* Migrate web client to Protobuf-generated data models, replacing custom activity types and updating UI components. ([e3e3eb4](https://github.com/fitglue/web/commit/e3e3eb41e470c861a8466f114fb7f7c757124fae))


### Bug Fixes

* linting ([4230e07](https://github.com/fitglue/web/commit/4230e073d5b2b249acf88188333e5f26b54cced8))

## [1.8.0](https://github.com/fitglue/web/compare/v1.7.0...v1.8.0) (2026-01-19)


### Features

* Add Repost Actions menu to the Activity Detail Page, including new re-posting service methods and UI components. ([6fa3e6d](https://github.com/fitglue/web/commit/6fa3e6debf3b99408a53667be62f04a535bd6c0d))

## [1.7.0](https://github.com/fitglue/web/compare/v1.6.0...v1.7.0) (2026-01-18)


### Features

* show owner name ([b9f2b09](https://github.com/fitglue/web/commit/b9f2b09a834964af355aded2378685ff21e67318))

## [1.6.0](https://github.com/fitglue/web/compare/v1.5.0...v1.6.0) (2026-01-18)


### Features

* massively enhanced showcase page ([000540e](https://github.com/fitglue/web/commit/000540e7b3943872242711e2d6baab8b9d0be10c))

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
