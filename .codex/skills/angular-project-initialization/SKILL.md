---
name: angular-project-initialization
description: Use this skill when creating or configuring a new Angular project that should match this repository's package selection, Angular workspace setup, TypeScript strictness, Tailwind/PostCSS styling, PrimeNG UI stack, translation setup, linting, formatting, and test tooling. Focus only on setup and packages; do not copy business logic, pages, components, services, routes, API URLs, environment values, or application-specific code.
---

# Angular Project Initialization

Use this skill to create a new Angular project with the same setup architecture as the analyzed project. Keep the output generic and reusable. Do not copy business logic, feature modules, pages, services, domain models, API endpoints, environment values, custom application code, auth flows, route guards, or app-specific layout components.

## Core Workflow

1. Create the Angular app with Angular CLI, SCSS, routing, strict mode, and `pnpm`.
2. Install required package groups based on the target app needs.
3. Configure `angular.json`, TypeScript, Tailwind/PostCSS, PrimeNG, optional translation, ESLint, Prettier, scripts, and environments.
4. Validate with install, build, tests, and lint when configured.

Prefer `pnpm` because the source project declares `packageManager: pnpm@11.0.9`.

```bash
corepack enable
corepack prepare pnpm@11.0.9 --activate
pnpm dlx @angular/cli@21 new my-angular-app --style=scss --routing=true --strict=true --package-manager=pnpm
cd my-angular-app
```

If Angular CLI generates an npm-oriented workspace, set:

```json
{
  "cli": {
    "packageManager": "pnpm"
  }
}
```

## Project Shape

Create an Angular application with:

- Angular 21 application builder: `@angular/build:application`
- Standalone application configuration
- Strict TypeScript and Angular template checking
- `pnpm` as the package manager
- `src` as the source root
- `public` as the asset input
- Global styles loaded from `src/assets/tailwind.css` and `src/assets/styles.scss`
- Production, staging, and development build configurations
- Environment file replacement for production and staging
- PrimeNG as the primary UI library
- Tailwind CSS v4 through PostCSS
- Prettier and ESLint for code style
- Angular unit-test builder with Vitest-compatible spec typing

## Load References

Read only the reference file needed for the current task:

- Package installation choices: `references/package-groups.md`
- `angular.json`, TypeScript, Tailwind/PostCSS, PrimeNG, and translation setup: `references/workspace-config.md`
- ESLint, Prettier, scripts, and environment files: `references/tooling-config.md`
- Validation and reuse rules: `references/validation-reuse.md`

## Decision Rules

- Install core Angular and build packages for every project.
- Install PrimeNG, Tailwind, Prettier, ESLint, and translation packages when matching this architecture.
- Install SignalR, Excel, rich text, clipboard, cookies, IndexedDB, charting, and crypto packages only when the new project has those feature requirements.
- Use Angular services, RxJS, signals, and component state by default; add dedicated state management only for complex cross-feature state needs.
- Do not install `@angular/material` unless the target project explicitly chooses Angular Material in addition to or instead of PrimeNG.
- Prefer generic prefixes and folder names for new projects.
