namespace AI_Driven_PJ.Application.Auth;

public sealed class LoginResponse
{
    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;

    public DateTime ExpiresAtUtc { get; init; }

    public CurrentUserResponse User { get; init; } = new();
}
