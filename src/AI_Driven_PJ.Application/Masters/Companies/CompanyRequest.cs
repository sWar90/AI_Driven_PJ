namespace AI_Driven_PJ.Application.Masters.Companies;

public sealed class CompanyRequest
{
    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string? RegNumber { get; set; }

    public int BaseCurrencyId { get; set; }

    public string Status { get; set; } = "Active";

    public string? Remark { get; set; }
}
