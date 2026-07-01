---
name: efcore-audit-ddd-skill
description: Add EF Core DDD foundation types and persistence behavior for ASP.NET Core Clean Architecture projects. Use when Codex needs to create BaseEntity, AuditableEntity, ISoftDelete, IAggregateRoot, audit SaveChangesInterceptor logic for CreatedAt/CreatedBy/UpdatedAt/UpdatedBy, soft-delete fields DeletedAt/DeletedBy/IsDeleted, soft-delete SaveChangesInterceptor logic, or global query filters for soft delete without introducing Repository Pattern.
---

# EF Core Audit DDD

Use this skill to add DDD-style domain base types and EF Core persistence hooks for audit fields and soft delete in Clean Architecture projects.

## Workflow

1. Inspect existing structure before editing:
   - Find Domain, Application, Infrastructure, and Api projects.
   - Reuse existing namespaces, base classes, current-user abstractions, clock abstractions, and DbContext registration style.
   - Do not create repositories or unit-of-work wrappers.
2. Put DDD foundation types in Domain:
   - `Domain/Common/BaseEntity.cs`
   - `Domain/Common/AuditableEntity.cs`
   - `Domain/Common/IAuditableEntity.cs`
   - `Domain/Common/ISoftDelete.cs`
   - `Domain/Common/IAggregateRoot.cs`
3. Put user/time abstractions where the repo expects them:
   - Use `ICurrentUserService` to get the current user.
   - Use `IDateTimeService` to get the current date/time.
   - If equivalent abstractions already exist, adapt to them only after confirming the local convention.
   - If none exist, create the smallest application-layer abstractions needed by the interceptors.
4. Put EF Core interceptors in Infrastructure:
   - `AuditableEntitySaveChangesInterceptor`
   - `SoftDeleteInterceptor`
5. Register interceptors with the EF Core `DbContextOptionsBuilder`.
6. Add global query filters for soft delete in `ApplicationDbContext.OnModelCreating`.
7. Verify with `dotnet build` or the narrowest touched project build.

## Audit Ownership

Audit fields must be assigned centrally by EF Core interceptors.

- Do not manually assign audit fields in controllers.
- Do not manually repeat audit assignment in every service or handler.
- Do not require commands or request DTOs to accept audit fields from clients.
- Do not expose setters to API callers just to populate audit data.
- Let `AuditableEntitySaveChangesInterceptor` set create/update fields.
- Let `SoftDeleteInterceptor` set delete fields when soft delete is used.

## Domain Types

Prefer this shape unless the repo already uses different names or key types:

```csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
}

public abstract class AuditableEntity : BaseEntity, IAuditableEntity
{
    public DateTimeOffset? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    public bool IsDeleted { get; set; }
}

public interface IAuditableEntity
{
    DateTimeOffset? CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTimeOffset? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
}

public interface ISoftDelete
{
    bool IsDeleted { get; set; }
    DateTimeOffset? DeletedAt { get; set; }
    string? DeletedBy { get; set; }
}

public interface IAggregateRoot
{
}
```

Required audit and soft-delete fields:

- `CreatedAt`
- `CreatedBy`
- `UpdatedAt`
- `UpdatedBy`
- `DeletedAt`
- `DeletedBy`
- `IsDeleted`

If the project uses `DateTime` instead of `DateTimeOffset`, match the existing project. If the project has int/long keys, make `BaseEntity<TKey>` only when the repo already favors generic entity keys.

If soft delete is optional per entity, keep the delete fields on `ISoftDelete` and implement `ISoftDelete` only on soft-deletable entities. If the project standard is that every auditable entity is soft-deletable, keep `DeletedAt`, `DeletedBy`, and `IsDeleted` on `AuditableEntity` and make `AuditableEntity` implement `ISoftDelete`.

## DB-First Scaffold Audit Rule

If the project uses database-first EF Core scaffolded entities, do not force scaffolded entity files to inherit from `AuditableEntity`.

- Do not manually edit scaffold-generated entity files to add base-class inheritance.
- Use `IAuditableEntity` for scaffolded entities instead of `AuditableEntity` inheritance.
- Only entities that already have audit columns should implement `IAuditableEntity`.
- Do not manually add `CreatedAt`, `CreatedBy`, `UpdatedAt`, or `UpdatedBy` properties when they already exist in the scaffolded entity.
- Match the nullable shape and timestamp type of the database columns. If the scaffolded columns are nullable `DateTime`, then `IAuditableEntity` must use nullable `DateTime` properties.

For a scaffolded entity such as `Entities/UserInformation.cs`, leave the generated file unchanged and create a separate partial file:

```csharp
// Entities/Partials/UserInformation.Partial.cs
public partial class UserInformation : IAuditableEntity
{
}
```

For DB-first projects with nullable `DateTime` audit columns, use this interface shape:

```csharp
public interface IAuditableEntity
{
    DateTime? CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
}
```

For code-first projects, `AuditableEntity` inheritance is still acceptable when it matches the local domain model. For mixed projects, code-first entities may inherit `AuditableEntity`, while scaffolded entities should use partial classes plus `IAuditableEntity`.

## Audit Interceptor

Create a `SaveChangesInterceptor` that sets audit fields for added and modified auditable entries. In DB-first projects, check `IAuditableEntity` instead of scanning `AuditableEntity` inheritance.

```csharp
public sealed class AuditableEntitySaveChangesInterceptor(
    ICurrentUserService currentUserService,
    IDateTimeService dateTimeService) : SaveChangesInterceptor
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

    private void UpdateEntities(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var now = dateTimeService.UtcNow;
        var userId = currentUserService.UserId;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is not IAuditableEntity auditableEntity)
            {
                continue;
            }

            if (entry.State == EntityState.Added)
            {
                auditableEntity.CreatedAt = now;
                auditableEntity.CreatedBy = userId;
            }

            if (entry.State == EntityState.Modified)
            {
                auditableEntity.UpdatedAt = now;
                auditableEntity.UpdatedBy = userId;
            }
        }
    }
}
```

Do not use `ChangeTracker.Entries<AuditableEntity>()` in database-first projects because scaffolded entities should not be forced to inherit from `AuditableEntity`. Use `ChangeTracker.Entries()` and check `entry.Entity is IAuditableEntity`.

Adapt property names and timestamp types to the repo. `CreatedAt` and `CreatedBy` must be set when an entity is added. `UpdatedAt` and `UpdatedBy` must be set when an entity is modified. Do not overwrite `CreatedAt` or `CreatedBy` on update.

## Soft Delete Interceptor

Convert deletes into updates for entities implementing `ISoftDelete`.

```csharp
public sealed class SoftDeleteInterceptor(
    ICurrentUserService currentUserService,
    IDateTimeService dateTimeService) : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        SoftDeleteEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        SoftDeleteEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void SoftDeleteEntities(DbContext? context)
    {
        if (context is null)
        {
            return;
        }

        var now = dateTimeService.UtcNow;
        var userId = currentUserService.UserId;

        foreach (var entry in context.ChangeTracker.Entries<ISoftDelete>()
                     .Where(x => x.State == EntityState.Deleted))
        {
            entry.State = EntityState.Modified;
            entry.Entity.IsDeleted = true;
            entry.Entity.DeletedAt = now;
            entry.Entity.DeletedBy = userId;
        }
    }
}
```

`DeletedAt` and `DeletedBy` must be set when an entity is soft deleted. When an entity inherits `AuditableEntity` and implements `ISoftDelete`, both interceptors may run. Register the soft-delete interceptor before audit if the audit interceptor should also set `UpdatedAt` for soft deletes.

## Global Query Filters

Apply soft-delete filters centrally in `OnModelCreating`. Prefer a reusable extension when multiple entities implement `ISoftDelete`.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    modelBuilder.ApplySoftDeleteQueryFilters();
}
```

```csharp
public static class ModelBuilderExtensions
{
    public static void ApplySoftDeleteQueryFilters(this ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
                     .Where(t => typeof(ISoftDelete).IsAssignableFrom(t.ClrType)))
        {
            var parameter = Expression.Parameter(entityType.ClrType, "e");
            var property = Expression.Property(parameter, nameof(ISoftDelete.IsDeleted));
            var condition = Expression.Equal(property, Expression.Constant(false));
            var lambda = Expression.Lambda(condition, parameter);

            modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
        }
    }
}
```

If an entity already has a query filter, combine expressions instead of replacing it.

## Registration

Register interceptors in Infrastructure DI and add them to `DbContextOptionsBuilder`.

```csharp
services.AddScoped<AuditableEntitySaveChangesInterceptor>();
services.AddScoped<SoftDeleteInterceptor>();

services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    options
        .UseSqlServer(connectionString)
        .AddInterceptors(
            sp.GetRequiredService<SoftDeleteInterceptor>(),
            sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>());
});
```

Use the existing database provider and registration pattern.

## Verification

- Run `dotnet build` for the solution or touched projects.
- If migrations exist and persistence shape changed, add a migration only when the user asked or the repo workflow requires it.
- Confirm code-first entities inherit `AuditableEntity` only when it matches the repo pattern.
- Confirm DB-first scaffolded entities are not manually edited and use partial classes implementing `IAuditableEntity` only when they already have audit columns.
- Confirm read queries can use `IgnoreQueryFilters()` only for explicit admin/report scenarios.
