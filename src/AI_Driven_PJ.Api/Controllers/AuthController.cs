using AI_Driven_PJ.Application.Auth;
using AI_Driven_PJ.Application.Common.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AI_Driven_PJ.Api.Controllers;

[ApiController]
//[Authorize]
[Route("[controller]")]
public sealed class AuthController(AuthService authService) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("access-token")]
    [EndpointSummary("Access Token")]
    [EndpointDescription("Generate access token and refresh token.")]
    public async Task<IActionResult> AccessToken(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request, cancellationToken);
        return FromAuthResult(result);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    [EndpointSummary("Login")]
    [EndpointDescription("Generate access token and refresh token.")]
    public Task<IActionResult> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        return AccessToken(request, cancellationToken);
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    [EndpointSummary("Refresh Token")]
    [EndpointDescription("Refresh access token with refresh token.")]
    public async Task<IActionResult> RefreshToken(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.RefreshAsync(request, cancellationToken);
        return FromAuthResult(result);
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    [EndpointSummary("Refresh Token")]
    [EndpointDescription("Refresh access token with refresh token.")]
    public Task<IActionResult> Refresh(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        return RefreshToken(request, cancellationToken);
    }

    [AllowAnonymous]
    [HttpPost("select-company")]
    [EndpointSummary("Select Company")]
    [EndpointDescription("Issue company-bound tokens for the super administrator.")]
    public async Task<IActionResult> SelectCompany(
        SelectCompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.SelectCompanyAsync(User, request, cancellationToken);
        return FromAuthResult(result);
    }

    [HttpPost("revoke-token/{userId}")]
    [Authorize]
    [EndpointSummary("Revoke Token")]
    [EndpointDescription("Revoke token for the requested user.")]
    public async Task<IActionResult> RevokeToken(
        string userId,
        CancellationToken cancellationToken)
    {
        var result = await authService.RevokeAsync(userId, cancellationToken);
        return FromResult(result);
    }

    [Authorize]
    [HttpPost("revoke")]
    [EndpointSummary("Revoke Token")]
    [EndpointDescription("Revoke token for the current or requested user.")]
    public async Task<IActionResult> Revoke(
        RevokeTokenRequest request,
        CancellationToken cancellationToken)
    {
        var userId = string.IsNullOrWhiteSpace(request.UserId)
            ? User.FindFirstValue(ClaimTypes.Name)
            : request.UserId;

        var result = await authService.RevokeAsync(userId ?? string.Empty, cancellationToken);
        return FromResult(result);
    }

    [Authorize]
    [HttpPost("change-password")]
    [EndpointSummary("Change Password")]
    [EndpointDescription("Change password for the current authenticated user.")]
    public async Task<IActionResult> ChangePassword(
        ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authService.ChangePasswordAsync(User, request, cancellationToken);
        return FromResult(result);
    }

    [Authorize]
    [HttpGet("profile")]
    [EndpointSummary("Profile")]
    [EndpointDescription("Get personal information for the current authenticated user.")]
    public async Task<IActionResult> Profile()
    {
        var result = await authService.GetCurrentUserAsync(User);
        return FromResult(result);
    }

    [Authorize]
    [HttpGet("me")]
    [EndpointSummary("Current User")]
    [EndpointDescription("Get personal information for the current authenticated user.")]
    public Task<IActionResult> Me()
    {
        return Profile();
    }

    [Authorize]
    [HttpGet("status")]
    [EndpointSummary("Status")]
    [EndpointDescription("Get current login status and refresh token expiry.")]
    public async Task<IActionResult> Status(CancellationToken cancellationToken)
    {
        var result = await authService.GetStatusAsync(User, cancellationToken);
        return FromResult(result);
    }

    private IActionResult FromAuthResult(Result<LoginResponse> result)
    {
        if (result.Succeeded)
        {
            return Ok(ApiResponse<LoginResponse>.Ok(result.Data));
        }

        if (result.Message == "Validation Failed")
        {
            return BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] }));
        }

        return Unauthorized(ApiResponse.Fail(StatusCodes.Status401Unauthorized, result.Message));
    }

    private IActionResult FromResult(Result result)
    {
        if (result.Succeeded)
        {
            return Ok(ApiResponse.Ok(result.Message));
        }

        return result.Message switch
        {
            "Unauthorized" => Unauthorized(ApiResponse.Fail(StatusCodes.Status401Unauthorized, result.Message)),
            "Data Not Found" => NotFound(ApiResponse.NotFound(result.Message)),
            "Validation Failed" => BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] })),
            _ => BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] }))
        };
    }

    private IActionResult FromResult<T>(Result<T> result)
    {
        if (result.Succeeded)
        {
            return Ok(ApiResponse<T>.Ok(result.Data));
        }

        return result.Message switch
        {
            "Unauthorized" => Unauthorized(ApiResponse.Fail(StatusCodes.Status401Unauthorized, result.Message)),
            "Data Not Found" => NotFound(ApiResponse.NotFound(result.Message)),
            "Validation Failed" => BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] })),
            _ => BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] }))
        };
    }
}
