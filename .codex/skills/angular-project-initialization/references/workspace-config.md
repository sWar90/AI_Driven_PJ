# Workspace Configuration

## Angular Workspace Configuration

Configure `angular.json` with these patterns:

- Use `@angular/build:application` for `build`.
- Use `@angular/build:dev-server` for `serve`.
- Use `@angular/build:unit-test` for `test`.
- Set `browser` to `src/main.ts`.
- Set `tsConfig` to `tsconfig.app.json`.
- Set assets to load everything from `public`.
- Set styles to load Tailwind first, then application SCSS.
- Add `production`, `staging`, and `development` configurations.
- Use `production` as the default build configuration.
- Use `development` as the default serve configuration.
- Use file replacement for environment files.
- Use output hashing for optimized builds.
- Use bundle budgets:
  - initial warning: `2MB`
  - initial error: `3MB`
  - component style warning: `10kB`
  - component style error: `12kB`

Generic `angular.json` project excerpt:

```json
{
  "cli": {
    "packageManager": "pnpm"
  },
  "projects": {
    "my-angular-app": {
      "projectType": "application",
      "root": "",
      "sourceRoot": "src",
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [
              {
                "glob": "**/*",
                "input": "public"
              }
            ],
            "styles": [
              "src/assets/tailwind.css",
              "src/assets/styles.scss"
            ]
          },
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": {
                "scripts": true,
                "styles": true,
                "fonts": false
              },
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2MB",
                  "maximumError": "3MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "10kB",
                  "maximumError": "12kB"
                }
              ],
              "outputHashing": "all"
            },
            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ],
              "optimization": {
                "scripts": true,
                "styles": true,
                "fonts": false
              },
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2MB",
                  "maximumError": "3MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "10kB",
                  "maximumError": "12kB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "production": {
              "buildTarget": "my-angular-app:build:production"
            },
            "staging": {
              "buildTarget": "my-angular-app:build:staging"
            },
            "development": {
              "buildTarget": "my-angular-app:build:development"
            }
          },
          "defaultConfiguration": "development"
        },
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
  }
}
```

## TypeScript Configuration

Use strict TypeScript settings and Angular strict template checking.

Keep these compiler options:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

Use generic path aliases only when the new project adopts the same folder architecture. Do not copy domain-specific folder names from an existing app.

Recommended generic aliases:

```json
{
  "paths": {
    "@core/*": ["./src/app/core/*"],
    "@shared/*": ["./src/app/shared/*"],
    "@env/*": ["./src/environments/*"],
    "@/*": ["./src/*"],
    "src/*": ["./src/*"]
  }
}
```

Configure `tsconfig.app.json` to include `src/**/*.ts` and exclude `src/**/*.spec.ts`.

Configure `tsconfig.spec.json` with:

```json
{
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*.d.ts", "src/**/*.spec.ts"]
}
```

## Tailwind And PostCSS

Create `.postcssrc.json`:

```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

Create `src/assets/tailwind.css`:

```css
@import "tailwindcss";
```

Create `src/assets/styles.scss` for global SCSS imports and application-wide styles. Keep it generic.

## PrimeNG Configuration

Use PrimeNG as the main component library. In `app.config.ts`, provide PrimeNG and message services through Angular providers.

Use a generic theme preset or a project-specific theme created for the new project. Do not copy an existing application's custom theme file unless explicitly requested.

Generic provider pattern:

```ts
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    providePrimeNG({
      theme: {
        options: {
          darkModeSelector: '.app-dark'
        }
      }
    }),
    MessageService
  ]
};
```

## Translation Configuration

If the project needs runtime translation, install `@ngx-translate/core` and `@ngx-translate/http-loader`, then configure translation JSON loading from `assets/i18n`.

Generic provider pattern:

```ts
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

provideTranslateService({
  loader: provideTranslateHttpLoader({
    prefix: 'assets/i18n/',
    suffix: '.json'
  }),
  fallbackLang: 'en',
  lang: 'en'
});
```

Create generic translation files:

```text
src/assets/i18n/en.json
```
