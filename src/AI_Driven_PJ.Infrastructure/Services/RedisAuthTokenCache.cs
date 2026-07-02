using System.Text.Json;
using AI_Driven_PJ.Application.Auth;
using AI_Driven_PJ.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class RedisAuthTokenCache(IDistributedCache cache, IDateTimeService dateTimeService) : IAuthTokenCache
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task SetAsync(AuthTokenCacheItem item, CancellationToken cancellationToken = default)
    {
        var ttl = item.ExpiresAtUtc - dateTimeService.UtcNow.UtcDateTime;
        if (ttl <= TimeSpan.Zero)
        {
            await RemoveAsync(item.UserId, cancellationToken);
            return;
        }

        var json = JsonSerializer.Serialize(item, JsonOptions);
        await cache.SetStringAsync(
            BuildKey(item.UserId),
            json,
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            },
            cancellationToken);
    }

    public async Task<AuthTokenCacheItem?> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        var json = await cache.GetStringAsync(BuildKey(userId), cancellationToken);
        return string.IsNullOrWhiteSpace(json)
            ? null
            : JsonSerializer.Deserialize<AuthTokenCacheItem>(json, JsonOptions);
    }

    public Task RemoveAsync(string userId, CancellationToken cancellationToken = default)
        => cache.RemoveAsync(BuildKey(userId), cancellationToken);

    private static string BuildKey(string userId)
        => $"auth:refresh-token:{userId}";
}
