using AI_Driven_PJ.Application.Auth;

namespace AI_Driven_PJ.Application.Common.Interfaces;

public interface IAuthTokenCache
{
    Task SetAsync(AuthTokenCacheItem item, CancellationToken cancellationToken = default);

    Task<AuthTokenCacheItem?> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);

    Task RemoveAsync(string userId, CancellationToken cancellationToken = default);
}
