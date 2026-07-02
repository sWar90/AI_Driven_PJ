namespace AI_Driven_PJ.Application.Auth;

public sealed record AuthTokenCacheItem(
    string UserId,
    string AccessToken,
    string RefreshToken,
    DateTime RefreshedAtUtc,
    DateTime ExpiresAtUtc);
