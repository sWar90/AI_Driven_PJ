namespace AI_Driven_PJ.Application.Auth;

public sealed class RefreshTokenRequest
{
    public string AccessToken { get; init; } = string.Empty;

    public string RefreshToken { get; init; } = string.Empty;
}
