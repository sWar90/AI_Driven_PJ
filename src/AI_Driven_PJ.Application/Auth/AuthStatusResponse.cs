namespace AI_Driven_PJ.Application.Auth;

public sealed class AuthStatusResponse
{
    public bool IsAuthenticated { get; init; }

    public string? UserId { get; init; }

    public DateTime? RefreshTokenExpiresAtUtc { get; init; }
}
