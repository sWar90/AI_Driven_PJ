using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace AI_Driven_PJ.Application.Common.Interfaces;

public interface ITokenBuilder
{
    string GenerateAccessToken(IdentityUser user, string role, DateTime expiresAtUtc);

    string GenerateAccessToken(
        IdentityUser user,
        string role,
        int companyId,
        int baseCurrencyId,
        bool isSuperAdmin,
        DateTime expiresAtUtc);

    string GenerateCompanySelectionToken(IdentityUser user, DateTime expiresAtUtc);

    string GenerateRefreshToken();

    ClaimsPrincipal GetPrincipalFromExpiredToken(string accessToken);
}
