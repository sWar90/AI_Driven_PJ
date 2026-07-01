# Tooling Configuration

## ESLint Configuration

The detected project uses ESLint with Prettier integration and Angular-specific rules in the config. When recreating this setup, install the detected ESLint packages and also install Angular/TypeScript ESLint packages if the chosen ESLint config references them.

The detected `eslint.config.js` references these packages even though they are not listed in `package.json`:

- `@angular-eslint/eslint-plugin`
- `@angular-eslint/eslint-plugin-template`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`

Install them when using Angular ESLint rules:

```bash
pnpm add -D @angular-eslint/eslint-plugin @angular-eslint/eslint-plugin-template @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

Keep these linting choices if matching the source architecture:

- Integrate Prettier.
- Ignore `dist`.
- Enforce blank lines around returns and blocks.
- Use Angular component selector prefix `app` for new generic projects unless the new project explicitly chooses another prefix.
- Allow `any` only if migration speed or legacy compatibility matters.
- Prefer stricter defaults for greenfield projects when possible.

Generic selector rules:

```js
{
  '@angular-eslint/component-selector': [
    'error',
    {
      type: 'element',
      prefix: 'app',
      style: 'kebab-case'
    }
  ],
  '@angular-eslint/directive-selector': [
    'error',
    {
      type: 'attribute',
      prefix: 'app',
      style: 'camelCase'
    }
  ]
}
```

## Prettier Configuration

Use Prettier with TypeScript, HTML, and Angular template parsing.

Create `.prettierrc.json`:

```json
{
  "useTabs": false,
  "tabWidth": 4,
  "trailingComma": "none",
  "semi": true,
  "singleQuote": true,
  "printWidth": 250,
  "bracketSameLine": false,
  "overrides": [
    {
      "files": ["*.ts", "*.mts", "*.d.ts"],
      "options": {
        "parser": "typescript"
      }
    },
    {
      "files": ["*.html"],
      "options": {
        "parser": "html"
      }
    },
    {
      "files": ["*.component.html"],
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

If a more conventional greenfield format is preferred, reduce `printWidth` to `100`. To match the detected project exactly, use `250`.

## Package Scripts

Use these scripts in `package.json`:

```json
{
  "scripts": {
    "ng": "ng",
    "start": "cross-env WATCHPACK_POLLING=true ng serve --poll 2000",
    "build": "ng build",
    "watch": "cross-env WATCHPACK_POLLING=true ng build --watch --poll 2000 --configuration development",
    "test": "ng test"
  }
}
```

Use `WATCHPACK_POLLING=true` when the project runs in Docker, WSL, mounted volumes, or environments where file watching is unreliable.

## Environment Files

Create placeholder environment files only. Do not copy real URLs, secrets, customer names, tenant identifiers, or business-specific settings.

```text
src/environments/environment.ts
src/environments/environment.staging.ts
src/environments/environment.prod.ts
```

Generic shape:

```ts
export const environment = {
  production: false,
  apiUrl: '',
  debug: true
};
```

Use `production: true` in staging and production files only if that matches the deployment behavior desired by the new project.

## Application Configuration

Use standalone providers and keep them infrastructure-focused:

- `provideRouter(routes)`
- `provideHttpClient(withFetch())`
- `provideZonelessChangeDetection()`
- `providePrimeNG(...)`
- `provideTranslateService(...)` when translation is required
- HTTP interceptors only when the new project defines generic auth/error/header behavior

Do not copy existing interceptors, encryption logic, auth flows, route guards, business services, app pages, layout components, or custom routes.
