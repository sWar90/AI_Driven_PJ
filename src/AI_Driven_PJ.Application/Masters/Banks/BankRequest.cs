namespace AI_Driven_PJ.Application.Masters.Banks;

public sealed class BankRequest
{
    public int BankId { get; set; }

    public string BankName { get; set; } = string.Empty;

    public string BankCode { get; set; } = string.Empty;

    public string Status { get; set; } = "Active";
}
