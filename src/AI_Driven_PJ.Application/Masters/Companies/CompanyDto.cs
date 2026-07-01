namespace AI_Driven_PJ.Application.Masters.Companies;

public sealed class CompanyDto
{
    public int CompanyId { get; init; }

    public string CompanyName { get; init; } = string.Empty;

    public string? RegNumber { get; init; }

    public int BaseCurrencyId { get; init; }

    public string Status { get; init; } = string.Empty;

    public string? Remark { get; init; }

    public DateTime CreatedAt { get; init; }

    public string CreatedBy { get; init; } = string.Empty;

    public DateTime? UpdatedAt { get; init; }

    public string? UpdatedBy { get; init; }
}
