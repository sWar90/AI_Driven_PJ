---
name: aspnet-cors-configuration-skill
description: Create or update secure environment-based CORS configuration for ASP.NET Core APIs. Use when Codex needs to configure Program.cs, appsettings, deployment settings, or middleware order for a named DefaultCorsPolicy that reads Cors:AllowedOrigins, allows localhost only in Development, avoids AllowAnyOrigin in UAT/Staging/Production, and places UseCors between UseRouting and authentication/authorization.
---

# ASP.NET CORS Configuration

## Overview

Configure CORS for the API layer with a named policy, environment-specific origins, and restrictive production defaults. Keep controllers and business layers untouched unless the request also requires related API cleanup.

## Implementation Rules

- Use the named policy `DefaultCorsPolicy`.
- Read configured origins from `Cors:AllowedOrigins`.
- In Development, allow only `http://localhost:4200` and `https://localhost:4200`.
- In UAT, Staging, and Production, allow only origins configured in `Cors:AllowedOrigins`.
- Do not allow localhost outside Development.
- Do not use `AllowAnyOrigin`.
- Use `WithOrigins(...)`, `AllowAnyHeader()`, and `AllowAnyMethod()`.
- Use `AllowCredentials()` only when the app uses cookie-based authentication.
- Never combine `AllowCredentials()` with `AllowAnyOrigin()`.
- If no origins are configured outside Development, keep the policy restrictive by passing an empty origin list to `WithOrigins`.
- Do not hardcode production domains in `Program.cs`; use `appsettings`, environment variables, or deployment secrets.

## Program.cs Pattern

Prefer this shape in the Api project `Program.cs`, adapting only to existing local style:

```csharp
const string defaultCorsPolicy = "DefaultCorsPolicy";

var configuredOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

var allowedOrigins = builder.Environment.IsDevelopment()
    ? ["http://localhost:4200", "https://localhost:4200"]
    : configuredOrigins
        .Where(origin => !string.IsNullOrWhiteSpace(origin))
        .Where(origin => !origin.Contains("localhost", StringComparison.OrdinalIgnoreCase))
        .ToArray();

builder.Services.AddCors(options =>
{
    options.AddPolicy(defaultCorsPolicy, policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();

        // Add AllowCredentials() only for cookie-based authentication.
    });
});
```

If the project does not use C# collection expressions, use `Array.Empty<string>()` and `new[] { ... }` to match the target language version.

## Middleware Order

Place middleware in this order:

```csharp
app.UseRouting();

app.UseCors(defaultCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
```

If the existing minimal API pipeline omits `UseRouting()`, add it when configuring this policy so the required order is explicit.

## Configuration

Use this appsettings shape where environment-specific origins are needed:

```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://example.com"
    ]
  }
}
```

For production, prefer environment-specific configuration files, environment variables, or deployment secrets. In ASP.NET Core environment variables, configure array entries as `Cors__AllowedOrigins__0`, `Cors__AllowedOrigins__1`, and so on.

## Verification Checklist

- Confirm `AddCors` uses `DefaultCorsPolicy`.
- Confirm all non-development origins come from `Cors:AllowedOrigins`.
- Confirm localhost is Development-only.
- Confirm there is no `AllowAnyOrigin`.
- Confirm `AllowCredentials` is absent unless cookie authentication is actually used.
- Confirm `UseCors(defaultCorsPolicy)` is after `UseRouting()` and before `UseAuthentication()` and `UseAuthorization()`.
- Build or run the API tests when practical.
