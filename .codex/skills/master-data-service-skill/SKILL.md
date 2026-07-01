---
name: master-data-service-skill
description: Build simple master data CRUD APIs in ASP.NET Core Clean Architecture using Application service classes instead of CQRS. Use when Codex needs to add or modify master data such as States, Townships, Streets, Banks, AccountTypes, or BankAccounts with Application/Masters folders, direct service-backed controllers, Request DTOs, Response DTOs, QueryParams, PagedResult, AsNoTracking reads, and no Command, Query, or Handler files.
---

# Master Data Service

Use this skill for simple master data CRUD. Do not use CQRS for these features.

## Workflow

1. Inspect existing project conventions before changing code:
   - Find the Domain, Application, Infrastructure, and Api projects.
   - Reuse existing namespaces, `IApplicationDbContext`, `Result<T>`, `PagedResult<T>`, `QueryParams`, and `ToPagedResultAsync`.
   - Reuse existing DI registration style for Application services.
2. Put master data services under `Application/Masters/{Name}`.
3. Put controllers under `Api/Controllers`.
4. Make controllers call the related Application service directly.
5. Do not create Command, Query, or Handler files for simple master data.
6. Use EF Core through `IApplicationDbContext`; do not create repositories.
7. Verify with `dotnet build` or the narrowest touched project build.

## Required Structure

Use this structure for simple master data:

```text
Application/
  Masters/
    States/
      StateService.cs
      StateRequest.cs
      StateDto.cs
    Townships/
      TownshipService.cs
      TownshipRequest.cs
      TownshipDto.cs
    Streets/
      StreetService.cs
      StreetRequest.cs
      StreetDto.cs

Api/
  Controllers/
    StatesController.cs
    TownshipsController.cs
    StreetsController.cs
```

Adapt entity names, namespaces, and route names to the project. Keep this same folder shape for other simple master data.

## Service Responsibilities

Each service may include:

- `GetListAsync`
- `GetByIdAsync`
- `CreateAsync`
- `UpdateAsync`
- `DeleteAsync` or `ChangeStatusAsync`

Services should:

- Depend on `IApplicationDbContext`.
- Use EF Core directly through `IApplicationDbContext`.
- Return standard project responses such as `Result<T>` and `PagedResult<T>`.
- Use request DTOs for create/update inputs.
- Use response DTOs for API output.
- Keep business rules and data access out of controllers.

## DTO Rules

Use one request DTO and one response DTO per simple master data area unless the repo already splits create/update requests.

```csharp
public sealed class StateRequest
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public sealed class StateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTimeOffset? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
```

Do not expose EF Core entities directly from API responses.
If the entity has audit columns (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`), include them in the response DTO and in every list/detail/create/update response mapping. Do not add audit fields to request DTOs, and do not manually assign audit fields in the service; EF Core SaveChanges interceptors own those values.

## List Method Pattern

All list methods must use `QueryParams` and `PagedResult<T>`.

```csharp
public sealed class StateService(IApplicationDbContext context)
{
    public async Task<Result<PagedResult<StateDto>>> GetListAsync(
        QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var query = context.States
            .AsNoTracking()
            .Select(state => new StateDto
            {
                Id = state.Id,
                Name = state.Name,
                IsActive = state.IsActive,
                CreatedAt = state.CreatedAt,
                CreatedBy = state.CreatedBy,
                UpdatedAt = state.UpdatedAt,
                UpdatedBy = state.UpdatedBy
            });

        var result = await query.ToPagedResultAsync(queryParams, cancellationToken);
        return Result.Success(result);
    }
}
```

Apply search and sorting before `ToPagedResultAsync`. Do not write `Skip` or `Take` manually in services; pagination belongs in the shared pagination extension.

## Read Method Pattern

All read queries must use `AsNoTracking()`.

```csharp
public async Task<Result<StateDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
{
    var dto = await context.States
        .AsNoTracking()
        .Where(state => state.Id == id)
        .Select(state => new StateDto
        {
            Id = state.Id,
            Name = state.Name,
            IsActive = state.IsActive,
            CreatedAt = state.CreatedAt,
            CreatedBy = state.CreatedBy,
            UpdatedAt = state.UpdatedAt,
            UpdatedBy = state.UpdatedBy
        })
        .FirstOrDefaultAsync(cancellationToken);

    return dto is null
        ? Result.NotFound<StateDto>("State not found.")
        : Result.Success(dto);
}
```

Adapt `Result.NotFound` and error handling to the project's existing `Result<T>` API.

## Create And Update Pattern

Use request DTOs for writes and map explicitly to entities.

```csharp
public async Task<Result<StateDto>> CreateAsync(StateRequest request, CancellationToken cancellationToken)
{
    var state = new State
    {
        Name = request.Name,
        IsActive = request.IsActive
    };

    context.States.Add(state);
    await context.SaveChangesAsync(cancellationToken);

    return Result.Success(new StateDto
    {
        Id = state.Id,
        Name = state.Name,
        IsActive = state.IsActive,
        CreatedAt = state.CreatedAt,
        CreatedBy = state.CreatedBy,
        UpdatedAt = state.UpdatedAt,
        UpdatedBy = state.UpdatedBy
    });
}
```

```csharp
public async Task<Result<StateDto>> UpdateAsync(Guid id, StateRequest request, CancellationToken cancellationToken)
{
    var state = await context.States.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    if (state is null)
    {
        return Result.NotFound<StateDto>("State not found.");
    }

    state.Name = request.Name;
    state.IsActive = request.IsActive;

    await context.SaveChangesAsync(cancellationToken);

    return Result.Success(new StateDto
    {
        Id = state.Id,
        Name = state.Name,
        IsActive = state.IsActive,
        CreatedAt = state.CreatedAt,
        CreatedBy = state.CreatedBy,
        UpdatedAt = state.UpdatedAt,
        UpdatedBy = state.UpdatedBy
    });
}
```

Use validation if the project already uses validators. Keep validation in Application, not in controllers.

## Delete Or Change Status Pattern

Use `DeleteAsync` for real delete or soft delete when that is the project convention. Use `ChangeStatusAsync` when master data should be disabled instead of deleted.

```csharp
public async Task<Result> ChangeStatusAsync(Guid id, bool isActive, CancellationToken cancellationToken)
{
    var state = await context.States.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    if (state is null)
    {
        return Result.NotFound("State not found.");
    }

    state.IsActive = isActive;
    await context.SaveChangesAsync(cancellationToken);

    return Result.Success();
}
```

Use the repo's existing soft-delete pattern when deleting entities that implement soft delete.

## Controller Pattern

Controllers must call the related Application service directly. Do not send MediatR commands or queries for simple master data.

```csharp
[ApiController]
[Route("api/states")]
public sealed class StatesController(StateService stateService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await stateService.GetListAsync(queryParams, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await stateService.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(StateRequest request, CancellationToken cancellationToken)
    {
        var result = await stateService.CreateAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, StateRequest request, CancellationToken cancellationToken)
    {
        var result = await stateService.UpdateAsync(id, request, cancellationToken);
        return Ok(result);
    }
}
```

Adapt response helpers, route casing, and constructor injection style to the repo.

## Registration

Register services in the Application layer or wherever the repo registers Application services.

```csharp
services.AddScoped<StateService>();
services.AddScoped<TownshipService>();
services.AddScoped<StreetService>();
```

If the repo uses interfaces for Application services, follow that existing pattern. Do not add interfaces automatically if the repo uses concrete services for simple masters.

## Rules

- Do not use CQRS for simple master data CRUD.
- Do not create `Command`, `Query`, or `Handler` files for simple master data.
- Use `Application/Masters/{Name}` for service, request DTO, and response DTO files.
- Controllers call the related Application service directly.
- All list methods use `QueryParams` and `PagedResult<T>`.
- All read queries use `AsNoTracking()`.
- Do not expose EF Core entities directly from API.
- Use request DTOs and response DTOs.
- Use EF Core through `IApplicationDbContext`.
- Do not create Repository Pattern.

## Verification

- Search the new master folder for `Command`, `Query`, and `Handler`; none should exist for simple master data.
- Search for `Skip(` and `Take(`; list methods should rely on `ToPagedResultAsync`.
- Run `dotnet build` for touched projects or the full solution.
