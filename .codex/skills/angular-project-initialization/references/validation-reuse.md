# Validation And Reuse Rules

## Validation

After creating the project, run:

```bash
pnpm install
pnpm build
pnpm test
```

If lint scripts are added, also run:

```bash
pnpm lint
```

Fix package/config mismatches before adding business functionality.

## Reuse Rules

- Treat packages as setup choices, not business logic.
- Install core Angular and build packages for every project.
- Install PrimeNG, Tailwind, Prettier, ESLint, and translation packages when matching this architecture.
- Install SignalR, Excel, rich text, clipboard, cookies, IndexedDB, charting, and crypto packages only when the new project has those feature requirements.
- Do not copy existing app source files.
- Do not copy API endpoints or environment values.
- Do not assume Angular Material is used; it was not detected.
- Prefer generic prefixes and folder names for new projects.
