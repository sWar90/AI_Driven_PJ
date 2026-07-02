using AI_Driven_PJ.Application.Auth;
using AI_Driven_PJ.Application.Common.Interfaces;
using System.Collections.Concurrent;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class InMemoryAuthTokenCache(IDateTimeService dateTimeService) : IAuthTokenCache
{
    private readonly ConcurrentDictionary<string, AuthTokenCacheItem> _tokens = new();

    public Task SetAsync(AuthTokenCacheItem item, CancellationToken cancellationToken = default)
    {
        if (item.ExpiresAtUtc <= dateTimeService.UtcNow.UtcDateTime)
        {
            _tokens.TryRemove(item.UserId, out _);
            return Task.CompletedTask;
        }

        _tokens[item.UserId] = item;
        return Task.CompletedTask;
    }

    public Task<AuthTokenCacheItem?> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        if (!_tokens.TryGetValue(userId, out var item))
        {
            return Task.FromResult<AuthTokenCacheItem?>(null);
        }

        if (item.ExpiresAtUtc <= dateTimeService.UtcNow.UtcDateTime)
        {
            _tokens.TryRemove(userId, out _);
            return Task.FromResult<AuthTokenCacheItem?>(null);
        }

        return Task.FromResult<AuthTokenCacheItem?>(item);
    }

    public Task RemoveAsync(string userId, CancellationToken cancellationToken = default)
    {
        _tokens.TryRemove(userId, out _);
        return Task.CompletedTask;
    }
}
