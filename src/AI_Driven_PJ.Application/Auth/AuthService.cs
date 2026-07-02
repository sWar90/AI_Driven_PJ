using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;

namespace AI_Driven_PJ.Application.Auth;

public sealed class AuthService(
    UserManager<IdentityUser> userManager,
    ITokenBuilder tokenBuilder,
    IAuthTokenCache tokenCache,
    IConfiguration configuration)
{
    public async Task<Result<LoginResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.UserNameOrEmail) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return Result<LoginResponse>.Failure(
                "Validation Failed",
                ["Username/email and password are required."]);
        }

        var user = await userManager.FindByNameAsync(request.UserNameOrEmail)
            ?? await userManager.FindByEmailAsync(request.UserNameOrEmail);

        if (user is null)
        {
            return Result<LoginResponse>.Failure("Invalid username/email or password.");
        }

        var passwordValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            return Result<LoginResponse>.Failure("Invalid username/email or password.");
        }

        return await CreateLoginResponseAsync(user, cancellationToken);
    }

    public async Task<Result<LoginResponse>> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.AccessToken) ||
            string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Result<LoginResponse>.Failure(
                "Validation Failed",
                ["Access token and refresh token are required."]);
        }

        ClaimsPrincipal principal;
        try
        {
            principal = tokenBuilder.GetPrincipalFromExpiredToken(request.AccessToken);
        }
        catch
        {
            return Result<LoginResponse>.Failure("Invalid access token.");
        }

        var userId = principal.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<LoginResponse>.Failure("Invalid access token.");
        }

        var cachedToken = await tokenCache.GetByUserIdAsync(userId, cancellationToken);
        if (cachedToken is null ||
            cachedToken.ExpiresAtUtc <= DateTime.UtcNow ||
            cachedToken.RefreshToken != request.RefreshToken)
        {
            return Result<LoginResponse>.Failure("Invalid refresh token.");
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Result<LoginResponse>.Failure("Data Not Found");
        }

        return await CreateLoginResponseAsync(user, cancellationToken);
    }

    public async Task<Result> RevokeAsync(string userId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result.Failure("Validation Failed", ["User id is required."]);
        }

        await tokenCache.RemoveAsync(userId, cancellationToken);
        return Result.Success("Successfully Deleted");
    }

    public async Task<Result> ChangePasswordAsync(
        ClaimsPrincipal principal,
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = principal.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result.Failure("Unauthorized");
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return Result.Failure(
                "Validation Failed",
                ["Current password and new password are required."]);
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Result.Failure("Data Not Found");
        }

        var result = await userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        return result.Succeeded
            ? Result.Success("Successfully Updated")
            : Result.Failure(
                "Validation Failed",
                result.Errors.Select(error => error.Description).ToArray());
    }

    public async Task<Result<CurrentUserResponse>> GetCurrentUserAsync(ClaimsPrincipal principal)
    {
        var userId = principal.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<CurrentUserResponse>.Failure("Unauthorized");
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return Result<CurrentUserResponse>.Failure("Data Not Found");
        }

        var role = await GetPrimaryRoleAsync(user);
        return Result<CurrentUserResponse>.Success(ToCurrentUserResponse(user, role));
    }

    public async Task<Result<AuthStatusResponse>> GetStatusAsync(
        ClaimsPrincipal principal,
        CancellationToken cancellationToken = default)
    {
        var userId = principal.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Result<AuthStatusResponse>.Success(new AuthStatusResponse
            {
                IsAuthenticated = false
            });
        }

        var cachedToken = await tokenCache.GetByUserIdAsync(userId, cancellationToken);
        return Result<AuthStatusResponse>.Success(new AuthStatusResponse
        {
            IsAuthenticated = principal.Identity?.IsAuthenticated == true,
            UserId = userId,
            RefreshTokenExpiresAtUtc = cachedToken?.ExpiresAtUtc
        });
    }

    public Task<Result<LoginResponse>> SelectCompanyAsync(
        ClaimsPrincipal principal,
        SelectCompanyRequest request,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Result<LoginResponse>.Failure(
            "Select company token flow is not configured yet.",
            ["Company-scoped claims are not available in the current data model."]));
    }

    private async Task<Result<LoginResponse>> CreateLoginResponseAsync(
        IdentityUser user,
        CancellationToken cancellationToken)
    {
        var role = await GetPrimaryRoleAsync(user);
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(GetAccessTokenMinutes());
        var refreshExpiresAtUtc = DateTime.UtcNow.AddDays(GetRefreshTokenDays());
        var accessToken = tokenBuilder.GenerateAccessToken(user, role, expiresAtUtc);
        var refreshToken = tokenBuilder.GenerateRefreshToken();

        await tokenCache.SetAsync(
            new AuthTokenCacheItem(
                user.Id,
                accessToken,
                refreshToken,
                DateTime.UtcNow,
                refreshExpiresAtUtc),
            cancellationToken);

        return Result<LoginResponse>.Success(new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAtUtc = expiresAtUtc,
            User = ToCurrentUserResponse(user, role)
        });
    }

    private async Task<string> GetPrimaryRoleAsync(IdentityUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        return roles.FirstOrDefault() ?? string.Empty;
    }

    private static CurrentUserResponse ToCurrentUserResponse(IdentityUser user, string role)
    {
        return new CurrentUserResponse
        {
            UserId = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            Role = role
        };
    }

    private int GetAccessTokenMinutes()
    {
        return int.TryParse(configuration["JWT:AccessTokenMinutes"], out var minutes) && minutes > 0
            ? minutes
            : 60;
    }

    private int GetRefreshTokenDays()
    {
        return int.TryParse(configuration["JWT:RefreshTokenDays"], out var days) && days > 0
            ? days
            : 7;
    }
}
