using System;
using System.Collections.Generic;

namespace AI_Driven_PJ.Domain.Entities;

public partial class Company
{
    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = null!;

    public string? RegNumber { get; set; }

    public int BaseCurrencyId { get; set; }

    public string Status { get; set; } = null!;

    public string? Remark { get; set; }

    public DateTime CreatedAt { get; set; }

    public string CreatedBy { get; set; } = null!;

    public DateTime? UpdatedAt { get; set; }

    public string? UpdatedBy { get; set; }
}
