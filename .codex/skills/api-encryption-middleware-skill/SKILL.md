---
name: api-encryption-middleware-skill
description: Add or modify AES request decryption support for the RixsFinTrack ASP.NET Core API. Use when Codex needs to create encryption or cryptography interfaces, infrastructure services, API middleware, options binding, endpoint exclusions, DI registration, or middleware ordering while preserving the project's Hybrid Clean Architecture boundaries.
---

# API Encryption Middleware

## Workflow

1. Keep contracts in `RixsFinTrack.Server.Application/Common/Interfaces`.
2. Keep concrete AES services in `RixsFinTrack.Server.Infrastructure/Services`.
3. Keep ASP.NET Core middleware in `RixsFinTrack.Server.Api/Middlewares`.
4. Register options and services through existing dependency injection extension patterns.
5. Add middleware in `Program.cs` after CORS and before authentication/authorization when request bodies or query strings must be decrypted before controllers bind models.
6. Keep controllers unchanged and thin.
7. When porting from `ES_Payment_GateWay.Server.Infrastructure.Middlewares.EncryptionMiddleware`, preserve the same bypass behavior but replace `GLOBAL.GetEncryptionExcludeURLs()` with configuration-bound options.

## Architecture Rules

- Do not place cryptography implementation in Domain or Application.
- Do not add repository, unit of work, CQRS, handlers, or controllers for this feature.
- Bind keys, IVs, and exclusions from configuration; do not hard-code production secrets in services.
- Use an options class for `Encryption` configuration.
- Skip decryption for `OPTIONS`, Swagger/OpenAPI/Scalar endpoints, health endpoints, configured excluded paths, Postman requests, and mobile requests when the existing source behavior requires those bypasses.
- Support exact and prefix path exclusions so docs, health checks, and auth/token endpoints can remain usable during development.
- Use `EnableBuffering()` before reading or replacing request bodies.
- Keep middleware decryption opt-in through `Encryption:Enabled`; disabled encryption must leave request bodies and query strings untouched.
- Do not use shared/global static URL lists. Put exclusions in `Encryption:ExcludedPaths` and `Encryption:ExcludedPathPrefixes`.

## Implementation Shape

Create or update these pieces:

- `IEncryptionService`: stream and string decrypt/encrypt operations needed by middleware.
- `ICryptography`: AES helpers for Base64 and Hex text encryption/decryption when callers need direct string helpers.
- `EncryptionOptions`: key, IV, enabled flag, exact excluded paths, and excluded path prefixes.
- `EncryptionService`: AES-CBC/PKCS7 implementation using configured key and IV.
- `Cryptography`: string helper wrapper over the same configured AES settings.
- `EncryptionMiddleware`: decrypt request body and query string when the request is not excluded.

`EncryptionMiddleware` should skip decrypting when any of these are true:

- `Encryption:Enabled` is `false`.
- Request method is `OPTIONS`.
- Request path matches `ExcludedPaths` exactly.
- Request path starts with any configured `ExcludedPathPrefixes`.
- Header `Postman-Token` exists.
- Header `Mobile-Request` exists.
- Referer indicates Scalar docs, including `/scalar` or `/docs/scalar`.

## Configuration

Use this shape in API configuration:

```json
"Encryption": {
  "Enabled": false,
  "Key": "5171061885171061",
  "IV": "5171061885171061",
  "ExcludedPaths": [
    "/api/health"
  ],
  "ExcludedPathPrefixes": [
    "/swagger",
    "/openapi",
    "/scalar",
    "/docs",
    "/api/auth"
  ]
}
```

Development can keep encryption disabled by default. Enable it only when the client sends encrypted payloads.

## Validation

- Build the solution after changes.
- If encryption is disabled, normal API requests must continue to bind DTOs normally.
- If encryption is enabled, excluded paths must still work without encrypted bodies.
- Do not manually edit scaffolded DB-first entity files for this feature.
