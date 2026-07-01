namespace AI_Driven_PJ.Application.Common.Models;

public sealed class ErrorResponse
{
    public IReadOnlyList<string> Errors { get; init; } = [];
}
