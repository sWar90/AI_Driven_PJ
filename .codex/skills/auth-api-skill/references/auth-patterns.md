# Auth Patterns Reference

Use this reference after `auth-api-skill` triggers and the task needs concrete implementation guidance.

## Source Pattern From QuickFood

The user supplied these reference files:

- `C:\repos\QuickFood\src\Microservices\QuickFood.Microservices.AuthAPI\Controllers\AuthController.cs`
- `C:\repos\QuickFood\src\Shared\QuickFood.Shared.Infrastructure\Services\TokenBuilder.cs`
- `C:\repos\QuickFood\src\Shared\QuickFood.Shared.Infrastructure\Extensions\JWTAuthExtension.cs`
- `C:\repos\QuickFood\src\Microservices\QuickFood.Microservices.AuthAPI\Services\IUserService.cs`

Do not copy the files directly. Recreate the behavior in RixsFinTrack style.

## Login Flow

1. Accept a typed request DTO, usually username/email/user id plus password.
2. Look up the `IdentityUser` by username, email, then id.
3. Return `Result<T>.Failure(ApiMessages.DataNotFound, 404)` when no user exists.
4. Check active status only if the project has a reliable status source.
5. Validate password with `UserManager<IdentityUser>.CheckPasswordAsync`.
6. Return a 401 result for invalid credentials without revealing which credential failed unless the product explicitly wants detailed messages.
7. Create an access token and refresh token.
8. Store refresh token, access token, refresh date, token expiry, and user id in Redis.
9. Return a response DTO with access token, refresh token, expiration, and safe user data.

## Refresh Flow

1. Accept a typed request DTO with access token and refresh token.
2. Validate the access token with `ValidateLifetime = false` to recover the principal from an expired token.
3. Reject tokens if signature, issuer, audience, algorithm, or principal is invalid.
4. Find stored refresh token state from Redis by user id and/or token value.
5. Reject if missing, mismatched, revoked, or expired.
6. Reload user data and reject missing or inactive users.
7. If the presented access token is still valid and has more than the configured threshold remaining, returning the existing stored token is acceptable.
8. Otherwise rotate both access and refresh tokens and update Redis token state with a new TTL.

## Revoke Flow

1. Require authorization unless the product explicitly supports anonymous device revocation.
2. Identify the user by route/request id or `User.Identity.Name`.
3. Delete Redis token state for the user.
4. Return `ApiMessages.SuccessfullyDeleted` or another project-standard success message.

## Redis Token State

Do not implement QuickFood's `TokenClaim` as a SQL table in RixsFinTrack. Store token state in Redis instead.

Add an Application contract such as:

```csharp
public interface IAuthTokenCache
{
    Task SetAsync(AuthTokenCacheItem item, CancellationToken cancellationToken = default);
    Task<AuthTokenCacheItem?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
    Task RemoveAsync(string userId, CancellationToken cancellationToken = default);
}
```

Use a DTO/record like:

```csharp
public sealed record AuthTokenCacheItem(
    string UserId,
    string? AccessToken,
    string RefreshToken,
    DateTime RefreshedAtUtc,
    DateTime ExpiresAtUtc);
```

Infrastructure guidance:

- Prefer `IDistributedCache` if the project already uses Microsoft distributed caching.
- Use `StackExchange.Redis` only when direct Redis operations are already configured or specifically requested.
- Register Redis from configuration, for example `Redis:ConnectionString` or `ConnectionStrings:Redis`.
- Use deterministic keys: `auth:refresh-token:{userId}`.
- Set absolute expiration/TTL to `ExpiresAtUtc - DateTime.UtcNow`.
- Reject refresh attempts if the Redis item is missing, expired, or the stored refresh token does not match the presented token.
- Delete the Redis key during revoke/logout.
- Do not put Redis implementation details in Api controllers.

## Token Builder Guidance

Place the token contract in Application and the implementation in Infrastructure.

Required operations:

```csharp
public interface ITokenBuilder
{
    string GenerateAccessToken(IdentityUser user, string role, DateTime expiresAtUtc);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string accessToken);
    bool IsTokenExpired(string token);
    TimeSpan GetRemainingTime(string token);
}
```

Implementation details:

- Read `JWT:Secret`, `JWT:ValidIssuer`, and `JWT:ValidAudience` from configuration.
- Throw a clear configuration exception if `JWT:Secret` is missing.
- Use `SecurityAlgorithms.HmacSha256`.
- Use `ClaimTypes.Name` for `user.Id`, `ClaimTypes.GivenName` for `user.UserName`, and `ClaimTypes.Role` for role.
- Use `RandomNumberGenerator` and at least 64 random bytes for refresh tokens.
- Compare JWT `ValidTo` against `DateTime.UtcNow`.

## JWT Bearer Configuration

Place the extension in Api or Infrastructure based on the existing project convention. For RixsFinTrack, prefer Api extension methods when the code is HTTP response specific.

Essential settings:

```csharp
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateIssuerSigningKey = true,
    ValidateLifetime = true,
    ClockSkew = TimeSpan.Zero,
    ValidIssuer = configuration["JWT:ValidIssuer"],
    ValidAudience = configuration["JWT:ValidAudience"],
    IssuerSigningKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(configuration["JWT:Secret"] ?? string.Empty))
};
```

JWT events should not emit default ASP.NET responses. Write project-standard JSON:

```csharp
new ApiResponse<object>(
    false,
    StatusCodes.Status401Unauthorized,
    "Unauthorized",
    null)
```

If the project localizes messages through `ResponseHelper.Localize`, keep localization in Api.

## RixsFinTrack Placement Map

- Application:
  - `Common/Interfaces/ITokenBuilder.cs`
  - `Auth/LoginRequest.cs`, `RefreshTokenRequest.cs`, response DTOs, validators
  - `Auth/AuthService.cs` if using Application service
  - `Features/Auth/...` if the requested behavior requires CQRS
- Infrastructure:
  - `Services/TokenBuilder.cs`
  - `Services/RedisAuthTokenCache.cs` or equivalent
  - DI registration for `ITokenBuilder`
  - Redis/distributed cache registration for token state
- Api:
  - `Controllers/AuthController.cs`
  - JWT auth configuration extension if it writes `ApiResponse<T>` HTTP responses
  - `Program.cs` registration and middleware ordering

## Avoid

- Do not return `IdentityUser`, token entities, or EF entities from API responses.
- Do not create `TokenClaim`, token tables, token migrations, or EF token entities for refresh token storage.
- Do not use QuickFood's `DefaultResponseModel`, `DefaultResponseMessageModel`, or `ResponseHelper.OK_Result` names.
- Do not use anonymous objects for controller response data. Create DTOs.
- Do not place login/refresh/revoke logic inside controllers.
- Do not use local time for JWT `ValidTo` comparisons.
- Do not manually edit scaffolded DB-first entity files.
