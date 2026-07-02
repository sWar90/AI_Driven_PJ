using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class TokenBuilder(IConfiguration configuration) : ITokenBuilder
{
    public string GenerateAccessToken(IdentityUser user, string role, DateTime expiresAtUtc)
    {
        return GenerateToken(BuildUserClaims(user, role), expiresAtUtc);
    }

    public string GenerateAccessToken(
        IdentityUser user,
        string role,
        int companyId,
        int baseCurrencyId,
        bool isSuperAdmin,
        DateTime expiresAtUtc)
    {
        var claims = BuildUserClaims(user, role);
        claims.AddRange(
        [
            new Claim(AuthConstants.CompanyIdClaim, companyId.ToString()),
            new Claim(AuthConstants.BaseCurrencyIdClaim, baseCurrencyId.ToString()),
            new Claim(AuthConstants.IsSuperAdminClaim, isSuperAdmin.ToString().ToLowerInvariant())
        ]);

        return GenerateToken(claims, expiresAtUtc);
    }

    public string GenerateCompanySelectionToken(IdentityUser user, DateTime expiresAtUtc)
    {
        var claims = BuildUserClaims(user, role: string.Empty);
        claims.AddRange(
        [
            new Claim(AuthConstants.IsSuperAdminClaim, bool.TrueString.ToLowerInvariant()),
            new Claim(AuthConstants.TokenPurposeClaim, AuthConstants.CompanySelectionPurpose)
        ]);

        return GenerateToken(claims, expiresAtUtc);
    }

    public string GenerateRefreshToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes);
    }

    public ClaimsPrincipal GetPrincipalFromExpiredToken(string accessToken)
    {
        var secret = GetRequiredSecret();
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = false,
            ClockSkew = TimeSpan.Zero,
            ValidIssuer = configuration["JWT:ValidIssuer"],
            ValidAudience = configuration["JWT:ValidAudience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(
            accessToken,
            tokenValidationParameters,
            out var securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(
                SecurityAlgorithms.HmacSha256,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token.");
        }

        return principal;
    }

    private string GenerateToken(IEnumerable<Claim> claims, DateTime expiresAtUtc)
    {
        var secret = GetRequiredSecret();
        var issuer = configuration["JWT:ValidIssuer"];
        var audience = configuration["JWT:ValidAudience"];
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static List<Claim> BuildUserClaims(IdentityUser user, string role)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, user.Id),
            new(ClaimTypes.GivenName, user.UserName ?? user.Email ?? user.Id),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            claims.Add(new Claim(ClaimTypes.Email, user.Email));
        }

        if (!string.IsNullOrWhiteSpace(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        return claims;
    }

    private string GetRequiredSecret()
    {
        var secret = configuration["JWT:Secret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("JWT:Secret is required for authentication.");
        }

        if (Encoding.UTF8.GetByteCount(secret) < 32)
        {
            throw new InvalidOperationException("JWT:Secret must be at least 32 bytes.");
        }

        return secret;
    }
}
