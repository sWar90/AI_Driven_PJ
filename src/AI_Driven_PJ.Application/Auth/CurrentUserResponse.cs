namespace AI_Driven_PJ.Application.Auth;

public sealed class CurrentUserResponse
{
    public string UserId { get; init; } = string.Empty;

    public string? UserName { get; init; }

    public string? Email { get; init; }

    public string? Role { get; init; }
}
