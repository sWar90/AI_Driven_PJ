namespace AI_Driven_PJ.Application.Masters.Banks;

public sealed class BankDto
{
    public int BankId { get; init; }

    public string BankName { get; init; } = string.Empty;

    public string BankCode { get; init; } = string.Empty;

    public string Status { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }

    public string CreatedBy { get; init; } = string.Empty;

    public DateTime? UpdatedAt { get; init; }

    public string? UpdatedBy { get; init; }
}
