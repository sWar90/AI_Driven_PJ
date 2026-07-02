namespace AI_Driven_PJ.Application.Auth;

public sealed class LoginRequest
{
    public string UserNameOrEmail { get; init; } = string.Empty;

    public string Password { get; init; } = string.Empty;
}
