using Microsoft.AspNetCore.Http;
using AI_Driven_PJ.Application.Common.Interfaces;
using System.Security.Claims;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private const string SystemUser = "System";

    public string UserId
        => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? httpContextAccessor.HttpContext?.User.Identity?.Name
            ?? SystemUser;

    public string UserName
        => httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Name)
            ?? httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.GivenName)
            ?? SystemUser;
}
