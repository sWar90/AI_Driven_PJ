using AI_Driven_PJ.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AI_Driven_PJ.Infrastructure.Persistence.Interceptors;

public sealed class AuditableEntitySaveChangesInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void UpdateEntities(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var utcNow = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>())
        {
            ApplyAuditValues(entry, utcNow);
        }
    }

    private static void ApplyAuditValues(EntityEntry<AuditableEntity> entry, DateTime utcNow)
    {
        switch (entry.State)
        {
            case EntityState.Added:
                entry.Entity.CreatedAt = utcNow;
                entry.Entity.CreatedBy ??= "system";
                break;

            case EntityState.Modified:
                entry.Entity.UpdatedAt = utcNow;
                entry.Entity.UpdatedBy ??= "system";
                break;

            case EntityState.Deleted:
                entry.State = EntityState.Modified;
                entry.Entity.IsDeleted = true;
                entry.Entity.DeletedAt = utcNow;
                entry.Entity.DeletedBy ??= "system";
                break;
        }
    }
}
