---
name: auth-api-skill
description: Build or modify ASP.NET Core authentication APIs for this Clean Architecture project. Use when Codex needs to add JWT login, refresh token, revoke/logout, current user/status, token builder services, JWT bearer registration, Identity user lookup, auth request/response DTOs, or auth validation while preserving RixsFinTrack's Domain/Application/Infrastructure/Api boundaries and standard API response contract.
---

# Auth API Skill

## Core Workflow

1. Inspect the current auth surface before editing:
   - `src/RixsFinTrack.Server.Infrastructure/DependencyInjection.cs`
   - `src/RixsFinTrack.Server.Api/Program.cs`
   - `src/RixsFinTrack.Server.Application/Common/Models`
   - existing `UserManage` feature files
   - any existing JWT, token, auth, or Identity classes

2. Keep layer boundaries strict:
   - Put contracts and DTOs in Application.
   - Put token generation and external auth implementations in Infrastructure.
   - Put controllers, response shaping, auth middleware wiring, and HTTP filters in Api.
   - Keep Domain independent and do not edit scaffolded DB-first entity files directly.

3. Use the QuickFood-inspired flow only as a behavioral pattern:
   - Login validates user identity and password, generates a JWT access token and random refresh token, then stores refresh token state in Redis.
   - Refresh validates the expired access token's principal, checks the Redis-stored refresh token and expiry, and rotates both tokens when needed.
   - Revoke clears Redis token state for the user.
   - Status/current-user reads claims from the authenticated principal.

4. Adapt all code to RixsFinTrack standards:
   - Return `Result<T>` from Application services or CQRS handlers.
   - Return `ApiResponse<T>` from every controller action via `ResponseHelper`.
   - Use messages from `ApiMessages` where possible: `Successfully Retrieved`, `Successfully Created`, `Successfully Updated`, `Successfully Deleted`, `Validation Failed`, `Data Not Found`, `Internal Server Error`.
   - Do not return anonymous root responses, raw DTOs, or EF entities from controllers.
   - Keep controllers thin.

## Architecture Choice

- Use an Application service for auth flows unless the requested auth behavior has complex business rules that clearly require CQRS.
- If using CQRS, auth controllers must only call `ISender.Send()`.
- Do not introduce Repository Pattern, GenericRepository, or manual UnitOfWork.
- Use EF Core through `IApplicationDbContext` for project data, and use `UserManager<IdentityUser>` / `RoleManager<IdentityRole>` for ASP.NET Identity operations.
- Do not create a SQL `TokenClaim` table/entity for auth token state. Use Redis cache for refresh token/session state.

## Implementation Checklist

- Add request DTOs such as `LoginRequest`, `RefreshTokenRequest`, and `RevokeTokenRequest`.
- Add response DTOs such as `LoginResponse`, `TokenResponse`, and `CurrentUserResponse`; never expose `IdentityUser`.
- Add an `ITokenBuilder` or equivalent contract in Application, with Infrastructure implementation.
- Generate access token claims with:
  - `ClaimTypes.Name` as the user id.
  - `ClaimTypes.GivenName` as username/display name.
  - `ClaimTypes.Role` for the user's role.
- Use `RandomNumberGenerator` for refresh tokens.
- Configure JWT bearer auth with issuer, audience, signing key, lifetime validation, and `ClockSkew = TimeSpan.Zero`.
- Customize JWT challenge/forbidden responses so failures still return `ApiResponse<object>`.
- Register authentication services in the correct DI layer and call auth configuration from `Program.cs` before `UseAuthentication()`.
- Add a Redis token/session cache contract in Application, with Infrastructure implementation using `IDistributedCache` or `StackExchange.Redis`.
- Store refresh token state in Redis with a key such as `auth:refresh-token:{userId}` and TTL matching refresh token expiry.
- Include enough Redis value data to validate refresh token, access token, user id, issued/refreshed time, and expiry; serialize a DTO rather than storing ad hoc strings.
- Use `DateTime.UtcNow` consistently for token expiry and comparisons unless the project already standardizes on another clock abstraction.
- Add FluentValidation validators for auth requests where needed.
- Add focused tests or at minimum build the solution after implementation.

## Reference

Read `references/auth-patterns.md` when implementing or reviewing auth code. It summarizes the QuickFood source files supplied by the user and maps them to this project's required structure.
