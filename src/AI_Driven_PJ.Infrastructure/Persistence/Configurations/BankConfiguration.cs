using AI_Driven_PJ.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AI_Driven_PJ.Infrastructure.Persistence.Configurations;

public sealed class BankConfiguration : IEntityTypeConfiguration<Bank>
{
    public void Configure(EntityTypeBuilder<Bank> builder)
    {
        builder.HasKey(bank => bank.BankId);

        builder.Property(bank => bank.BankId)
            .ValueGeneratedNever();

        builder.Property(bank => bank.BankCode)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(bank => bank.BankName)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(bank => bank.CreatedAt)
            .HasColumnType("datetime");

        builder.Property(bank => bank.CreatedBy)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(bank => bank.Status)
            .HasMaxLength(50)
            .IsUnicode(false);

        builder.Property(bank => bank.UpdatedAt)
            .HasColumnType("datetime");

        builder.Property(bank => bank.UpdatedBy)
            .HasMaxLength(50)
            .IsUnicode(false);
    }
}
