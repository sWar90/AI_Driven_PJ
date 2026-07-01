# Package Groups

Install package groups according to the target project needs. For the closest match to this architecture, install the core Angular packages, PrimeNG UI stack, Tailwind/PostCSS stack, translation packages, RxJS, TypeScript, testing packages, linting packages, and formatting packages.

Do not install feature-specific utility packages unless the new project needs that feature.

## Core Angular Packages

| Package | Why it is used | When to install | Example command |
| --- | --- | --- | --- |
| `@angular/core` | Provides Angular's core runtime, dependency injection, components, signals, and application APIs. | Always for Angular apps. | `pnpm add @angular/core@^21.2.12` |
| `@angular/common` | Provides common directives, pipes, localization utilities, and browser-agnostic Angular services. | Always for Angular apps. | `pnpm add @angular/common@^21.2.12` |
| `@angular/compiler` | Compiles Angular templates. | Always for Angular app builds. | `pnpm add @angular/compiler@^21.2.12` |
| `@angular/forms` | Enables template-driven and reactive forms. | Install when the app has forms. Usually needed for business apps. | `pnpm add @angular/forms@^21.2.12` |
| `@angular/platform-browser` | Runs Angular in the browser. | Always for browser Angular apps. | `pnpm add @angular/platform-browser@^21.2.12` |
| `@angular/platform-browser-dynamic` | Supports dynamic browser bootstrapping and testing scenarios. | Install for standard Angular browser projects. | `pnpm add @angular/platform-browser-dynamic@^21.2.12` |
| `@angular/router` | Provides client-side routing. | Install when the app has multiple screens or URL-based navigation. | `pnpm add @angular/router@^21.2.12` |
| `@angular/cdk` | Provides low-level UI primitives used by Angular UI libraries and custom components. | Install when using Angular UI primitives, overlays, accessibility helpers, or PrimeNG/CDK-adjacent UI patterns. | `pnpm add @angular/cdk@^21.2.10` |
| `rxjs` | Provides reactive streams used heavily by Angular APIs and async workflows. | Always for Angular apps. | `pnpm add rxjs@~7.8.2` |
| `tslib` | Provides TypeScript helper functions imported by compiled output. | Always for Angular/TypeScript apps. | `pnpm add tslib@^2.8.1` |

Install together:

```bash
pnpm add @angular/core@^21.2.12 @angular/common@^21.2.12 @angular/compiler@^21.2.12 @angular/forms@^21.2.12 @angular/platform-browser@^21.2.12 @angular/platform-browser-dynamic@^21.2.12 @angular/router@^21.2.12 @angular/cdk@^21.2.10 rxjs@~7.8.2 tslib@^2.8.1
```

## UI Packages

| Package | Why it is used | When to install | Example command |
| --- | --- | --- | --- |
| `primeng` | Main Angular component library for enterprise UI controls. | Install when matching this project's UI architecture. | `pnpm add primeng@^21.1.7` |
| `primeicons` | Icon set used by PrimeNG components and buttons. | Install with PrimeNG. | `pnpm add primeicons@^7.0.0` |
| `@primeuix/themes` | Provides PrimeNG theme presets and theming primitives. | Install when using PrimeNG theming. | `pnpm add @primeuix/themes@^2.0.3` |
| `primeclt` | Prime ecosystem command-line/theming helper package. | Install only when the project workflow uses Prime tooling. | `pnpm add primeclt@^0.1.5` |
| `tailwindcss-primeui` | Integrates Tailwind utilities with Prime UI design tokens. | Install when using Tailwind together with PrimeNG. | `pnpm add tailwindcss-primeui@^0.6.1` |
| `chart.js` | Provides chart rendering. | Install when dashboards or chart components are required. | `pnpm add chart.js@^4.5.1` |
| `quill` | Rich text editor engine. | Install when rich text editing is required. | `pnpm add quill@^2.0.3` |

Install the standard UI stack:

```bash
pnpm add primeng@^21.1.7 primeicons@^7.0.0 @primeuix/themes@^2.0.3 tailwindcss-primeui@^0.6.1
```

Install optional UI features only when needed:

```bash
pnpm add chart.js@^4.5.1 quill@^2.0.3 primeclt@^0.1.5
```

Angular Material is not part of the detected package set. Do not install `@angular/material` unless the target project explicitly chooses Angular Material in addition to or instead of PrimeNG.

## State Management Packages

No dedicated state management package such as NgRx, NGXS, Akita, or Elf is installed in this project.

Use Angular services, RxJS, signals, and component state by default. Add a state management library only if the new project requires cross-feature state orchestration, undo/redo, normalized client stores, or complex data synchronization.

## Utility Packages

| Package | Why it is used | When to install | Example command |
| --- | --- | --- | --- |
| `@ngx-translate/core` | Provides runtime translation services and pipes. | Install when the app requires internationalization with runtime language switching. | `pnpm add @ngx-translate/core@^17.0.0` |
| `@ngx-translate/http-loader` | Loads translation JSON files over HTTP. | Install with `@ngx-translate/core` when translations live in asset JSON files. | `pnpm add @ngx-translate/http-loader@^17.0.0` |
| `@microsoft/signalr` | Provides real-time client communication with SignalR hubs. | Install only when the app needs real-time server events, chat, calls, notifications, or live status updates. | `pnpm add @microsoft/signalr@^10.0.0` |
| `crypto-js` | Provides cryptographic helpers such as hashing/encryption utilities. | Install only when client-side encryption, hashing, or compatible crypto transforms are required. | `pnpm add crypto-js@^4.2.0` |
| `@types/crypto-js` | Provides TypeScript types for `crypto-js`. | Install with `crypto-js` in TypeScript projects. | `pnpm add -D @types/crypto-js@^4.2.2` |
| `ngx-clipboard` | Adds Angular clipboard helpers. | Install when copy-to-clipboard UI behavior is needed. | `pnpm add ngx-clipboard@^16.0.0` |
| `ngx-cookie-service` | Provides Angular-friendly cookie get/set/delete APIs. | Install when auth/session/preferences use browser cookies. | `pnpm add ngx-cookie-service@^21.3.1` |
| `ngx-indexed-db` | Wraps IndexedDB for Angular applications. | Install when offline storage or larger browser-side persistence is needed. | `pnpm add ngx-indexed-db@^22.0.0` |
| `xlsx` | Reads and writes spreadsheet files. | Install when importing/exporting Excel files is required. | `pnpm add xlsx@^0.18.5` |

Install the standard translation stack:

```bash
pnpm add @ngx-translate/core@^17.0.0 @ngx-translate/http-loader@^17.0.0
```

Install feature utilities only when the new project needs them:

```bash
pnpm add @microsoft/signalr@^10.0.0 crypto-js@^4.2.0 ngx-clipboard@^16.0.0 ngx-cookie-service@^21.3.1 ngx-indexed-db@^22.0.0 xlsx@^0.18.5
pnpm add -D @types/crypto-js@^4.2.2
```

## Development Packages

| Package | Why it is used | When to install | Example command |
| --- | --- | --- | --- |
| `@angular/cli` | Provides the `ng` command for generating, serving, building, and testing. | Always for Angular projects. | `pnpm add -D @angular/cli@^21.2.10` |
| `@angular/build` | Provides the modern Angular application, dev-server, and unit-test builders used in `angular.json`. | Always when using Angular 21 builder architecture. | `pnpm add -D @angular/build@^21.2.10` |
| `@angular-devkit/build-angular` | Provides Angular build tooling compatibility for CLI projects. | Install for standard Angular CLI build/test compatibility. | `pnpm add -D @angular-devkit/build-angular@^21.2.10` |
| `@angular/compiler-cli` | Provides Angular's TypeScript compiler integration. | Always for Angular builds. | `pnpm add -D @angular/compiler-cli@^21.2.12` |
| `typescript` | TypeScript compiler. | Always for Angular projects; keep version compatible with Angular. | `pnpm add -D typescript@5.9.3` |
| `@tailwindcss/postcss` | Tailwind CSS v4 PostCSS plugin. | Install when using Tailwind v4. | `pnpm add -D @tailwindcss/postcss@^4.3.0` |
| `tailwindcss` | Tailwind CSS utility framework. | Install when using Tailwind styling. | `pnpm add -D tailwindcss@^4.3.0` |
| `postcss` | CSS processing pipeline used by Tailwind. | Install with Tailwind/PostCSS setup. | `pnpm add -D postcss@^8.5.14` |
| `autoprefixer` | Adds vendor prefixes where needed. | Install when the CSS pipeline requires autoprefixing. | `pnpm add -D autoprefixer@^10.5.0` |
| `cross-env` | Sets environment variables in scripts across Windows/macOS/Linux. | Install when scripts set env vars and must run cross-platform. | `pnpm add -D cross-env@^10.1.0` |
| `eslint` | JavaScript/TypeScript linting engine. | Install when enforcing lint rules. | `pnpm add -D eslint@^10.3.0` |
| `eslint-config-prettier` | Disables ESLint rules that conflict with Prettier. | Install when ESLint and Prettier are used together. | `pnpm add -D eslint-config-prettier@^10.1.8` |
| `eslint-plugin-prettier` | Runs Prettier as an ESLint rule. | Install when formatting violations should appear in lint results. | `pnpm add -D eslint-plugin-prettier@^5.5.5` |
| `eslint-plugin-import` | Lints import/export syntax and module resolution patterns. | Install when import hygiene rules are needed. | `pnpm add -D eslint-plugin-import@^2.32.0` |
| `eslint-plugin-prefer-arrow` | Enforces arrow function preferences. | Install when the code style requires arrow functions. | `pnpm add -D eslint-plugin-prefer-arrow@^1.2.3` |
| `prettier` | Formats code consistently. | Install for all projects using this architecture. | `pnpm add -D prettier@^3.8.3` |
| `vitest` | Modern test runner; project spec config references `vitest/globals`. | Install when using Angular's modern unit-test builder or Vitest-style globals. | `pnpm add -D vitest@^4.1.6` |
| `jsdom` | Browser-like DOM environment for tests. | Install when unit tests run outside a real browser. | `pnpm add -D jsdom@^29.1.1` |
| `@types/jasmine` | TypeScript types for Jasmine tests. | Install if tests or generated Angular specs use Jasmine APIs. | `pnpm add -D @types/jasmine@^6.0.0` |
| `jasmine-core` | Jasmine test framework runtime. | Install if using Jasmine-based specs or Karma/Jasmine compatibility. | `pnpm add -D jasmine-core@^6.2.0` |
| `karma` | Browser-based test runner. | Install only if maintaining Karma-based tests. For new Angular 21 projects, prefer the configured Angular unit-test builder unless Karma is required. | `pnpm add -D karma@^6.4.4` |
| `karma-chrome-launcher` | Launches Chrome for Karma tests. | Install with Karma browser tests. | `pnpm add -D karma-chrome-launcher@^3.2.0` |
| `karma-coverage` | Generates test coverage reports for Karma. | Install with Karma when coverage reports are required. | `pnpm add -D karma-coverage@^2.2.1` |
| `karma-jasmine` | Connects Jasmine to Karma. | Install with Karma/Jasmine tests. | `pnpm add -D karma-jasmine@^5.1.0` |
| `karma-jasmine-html-reporter` | Browser test result reporter for Karma/Jasmine. | Install with Karma/Jasmine browser tests. | `pnpm add -D karma-jasmine-html-reporter@^2.2.0` |

Install the standard development stack:

```bash
pnpm add -D @angular/cli@^21.2.10 @angular/build@^21.2.10 @angular-devkit/build-angular@^21.2.10 @angular/compiler-cli@^21.2.12 typescript@5.9.3 cross-env@^10.1.0
pnpm add -D tailwindcss@^4.3.0 @tailwindcss/postcss@^4.3.0 postcss@^8.5.14 autoprefixer@^10.5.0
pnpm add -D eslint@^10.3.0 eslint-config-prettier@^10.1.8 eslint-plugin-prettier@^5.5.5 eslint-plugin-import@^2.32.0 eslint-plugin-prefer-arrow@^1.2.3 prettier@^3.8.3
pnpm add -D vitest@^4.1.6 jsdom@^29.1.1 @types/jasmine@^6.0.0 jasmine-core@^6.2.0
```

Install Karma packages only for browser-based Karma compatibility:

```bash
pnpm add -D karma@^6.4.4 karma-chrome-launcher@^3.2.0 karma-coverage@^2.2.1 karma-jasmine@^5.1.0 karma-jasmine-html-reporter@^2.2.0
```
