using System;
using System.Collections.Generic;

namespace AI_Driven_PJ.Domain.Entities;

public partial class Bank
{
    public int BankId { get; set; }

    public string BankName { get; set; } = null!;

    public string BankCode { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string CreatedBy { get; set; } = null!;

    public DateTime? UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }
}
