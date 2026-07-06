using AI_Driven_PJ.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AI_Driven_PJ.Infrastructure.Persistence.Configurations;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.HasKey(company => company.CompanyId);

        builder.Property(company => company.CompanyId)
            .ValueGeneratedNever();

        builder.Property(company => company.CompanyName)
            .HasMaxLength(200)
            .IsUnicode(false);

        builder.Property(company => company.CreatedAt)
            .HasColumnType("datetime");

        builder.Property(company => company.CreatedBy)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(company => company.RegNumber)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(company => company.Remark)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(company => company.Status)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(company => company.UpdatedAt)
            .HasColumnType("datetime");

        builder.Property(company => company.UpdatedBy)
            .HasMaxLength(50)
            .IsUnicode(false);
    }
}
