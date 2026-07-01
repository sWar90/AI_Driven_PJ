---
name: aspnet-clean-architecture-skill
description: Build or modify ASP.NET Core backend APIs using Hybrid Clean Architecture with Domain, Application, Infrastructure, and Api projects. Use when Codex needs to scaffold backend structure, enforce Api -> Application -> Domain and Infrastructure -> Application + Domain dependency direction, use EF Core through IApplicationDbContext without Repository Pattern, choose Application Services for simple master data CRUD, or use Vertical Slice CQRS for complex business features such as Transactions, TransactionAttachments, Reports, and Dashboards.
---

# ASP.NET Hybrid Clean Architecture

Use this skill for ASP.NET Core backend API work that follows Hybrid Clean Architecture: Clean Architecture layer boundaries, EF Core direct access through `IApplicationDbContext`, Application Services for simple CRUD, and Vertical Slice CQRS for complex business features.

## Workflow

1. Inspect the existing solution before changing code:
   - Find the solution file and projects.
   - Identify current namespaces, package versions, dependency injection style, response wrappers, service naming, feature folder naming, and OpenAPI/Scalar setup.
   - Reuse existing helpers such as `Result<T>`, `PagedResult<T>`, `QueryParams`, and `ToPagedResultAsync` when present.
2. Keep the dependency direction strict:
   - `Api -> Application -> Domain`
   - `Infrastructure -> Application + Domain`
   - `Domain` does not reference other application projects.
   - `Application` does not reference `Infrastructure` or `Api`.
   - `Api` uses `Application` abstractions and registrations, not EF Core directly.
3. Use EF Core as the main data access technology:
   - Application code accesses persistence through `IApplicationDbContext`.
   - Infrastructure implements `IApplicationDbContext` with the EF Core `DbContext`.
   - Do not create Repository Pattern or unit-of-work wrappers.
4. Choose the Application pattern by feature complexity:
   - Use Application Service pattern for simple master data CRUD.
   - Use Vertical Slice CQRS only for complex business features.
5. Keep controllers thin:
   - Controllers call Application Services for simple master data CRUD.
   - Controllers call `ISender.Send()` for complex CQRS features.
   - Do not put business logic, EF queries, or mapping logic in controllers.

## Project Structure

When scaffolding a new solution, prefer this shape and adapt names to the repository:

```text
src/
  ProjectName.Domain/
    Common/
      BaseEntity.cs
      AuditableEntity.cs
      ISoftDelete.cs
      IAggregateRoot.cs
    Entities/
  ProjectName.Application/
    Common/
      Interfaces/
        IApplicationDbContext.cs
      Models/
        Result.cs
        PagedResult.cs
        QueryParams.cs
      Extensions/
        PaginationExtensions.cs
    Services/
      Banks/
      AccountTypes/
      BankAccounts/
    Features/
      Transactions/
      TransactionAttachments/
      Reports/
      Dashboards/
  ProjectName.Infrastructure/
    Persistence/
      ApplicationDbContext.cs
      Configurations/
      Interceptors/
  ProjectName.Api/
    Controllers/
```

Use the existing repo structure if it differs. Do not rename or reshuffle established folders unless the user asks.

## Layer Responsibilities

- `Domain`: entities, value objects, domain enums, domain events, base entity types, aggregate markers, and domain behavior.
- `Application`: `IApplicationDbContext`, DTOs, validators, Application Services, CQRS commands/queries/handlers, projections, and app-level interfaces.
- `Infrastructure`: EF Core `DbContext`, entity configurations, migrations, interceptors, identity/current-user implementations, external service implementations, and dependency injection wiring.
- `Api`: controllers, middleware, auth setup, OpenAPI/Scalar setup, request binding, and response transport concerns.

## API Documentation

Use OpenAPI with Scalar for API documentation in the `Api` project.

When scaffolding or updating API documentation:

- Add `Microsoft.AspNetCore.OpenApi` and `Scalar.AspNetCore` to the `Api` project when they are missing.
- Register OpenAPI in `Program.cs` with `builder.Services.AddOpenApi();`.
- In development, map both the OpenAPI document and Scalar UI:

```csharp
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
```

- Keep documentation setup in `Api/Program.cs`; do not put documentation wiring in `Application`, `Domain`, or `Infrastructure`.
- Prefer Scalar over Swagger UI for new work in this repository unless the existing project already uses Swagger and the user asks to keep it.

## Application Service Pattern

Use Application Services for simple master data CRUD where the workflow is straightforward and does not need command/query slicing.

Simple master data examples:

- `Banks`
- `AccountTypes`
- `BankAccounts`

Prefer one service interface and implementation per master-data area:

```text
Application/
  Services/
    Banks/
      IBankService.cs
      BankService.cs
      BankDto.cs
      CreateBankRequest.cs
      UpdateBankRequest.cs
```

Service implementations depend on `IApplicationDbContext`, use EF Core directly, and return `Result<T>` or `PagedResult<T>`.

```csharp
public sealed class BankService(IApplicationDbContext context) : IBankService
{
    public async Task<Result<PagedResult<BankDto>>> GetListAsync(
        QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var query = context.Banks
            .AsNoTracking()
            .Select(bank => new BankDto
            {
                Id = bank.Id,
                Name = bank.Name
            });

        var result = await query.ToPagedResultAsync(queryParams, cancellationToken);
        return Result.Success(result);
    }
}
```

Controllers for Application Services should stay thin:

```csharp
[ApiController]
[Route("api/banks")]
public sealed class BanksController(IBankService bankService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] QueryParams queryParams, CancellationToken cancellationToken)
    {
        var result = await bankService.GetListAsync(queryParams, cancellationToken);
        return Ok(result);
    }
}
```

## Vertical Slice CQRS Pattern

Use Vertical Slice CQRS for complex business features with meaningful workflows, rules, reports, orchestration, or separate command/query models.

Complex business feature examples:

- `Transactions`
- `TransactionAttachments`
- `Reports`
- `Dashboards`

Prefer feature folders in `Application/Features`:

```text
Application/
  Features/
    Transactions/
      Commands/
        CreateTransaction/
        ApproveTransaction/
      Queries/
        GetTransactionDetail/
        GetTransactionList/
    Reports/
      Queries/
        GetTransactionSummaryReport/
    Dashboards/
      Queries/
        GetFinanceDashboard/
```

CQRS handlers depend on `IApplicationDbContext`, use EF Core directly for normal queries/commands, and may use Dapper/raw SQL/views/stored procedures for heavy reports.

```csharp
public sealed record GetTransactionsQuery(QueryParams QueryParams)
    : IRequest<Result<PagedResult<TransactionListDto>>>;

public sealed class GetTransactionsQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetTransactionsQuery, Result<PagedResult<TransactionListDto>>>
{
    public async Task<Result<PagedResult<TransactionListDto>>> Handle(
        GetTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.Transactions
            .AsNoTracking()
            .Select(transaction => new TransactionListDto
            {
                Id = transaction.Id,
                TransactionNo = transaction.TransactionNo,
                Amount = transaction.Amount
            });

        var result = await query.ToPagedResultAsync(request.QueryParams, cancellationToken);
        return Result.Success(result);
    }
}
```

Controllers for CQRS features should call `ISender.Send()` only:

```csharp
[ApiController]
[Route("api/transactions")]
public sealed class TransactionsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList([FromQuery] QueryParams queryParams, CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetTransactionsQuery(queryParams), cancellationToken);
        return Ok(result);
    }
}
```

## Implementation Rules

- Use EF Core directly through `IApplicationDbContext`.
- Do not create Repository Pattern.
- Do not expose EF entities directly from API responses.
- Use projection DTOs for lists and reports.
- Use `AsNoTracking()` for read-only queries.
- All list APIs must accept `QueryParams` and use `ToPagedResultAsync`.
- Do not hand-write `Skip` and `Take` in handlers or services; keep pagination inside the shared pagination extension.
- Use `Result<T>` for standard single-item/action responses.
- Use `PagedResult<T>` for paged list responses.
- Use `AuditableEntity` for `CreatedAt`, `CreatedBy`, `UpdatedAt`, and `UpdatedBy`.
- Handle audit fields in an EF Core `SaveChangesInterceptor`.
- Use global query filters for soft delete.
- Heavy reports may use Dapper, raw SQL, SQL views, or stored procedures when EF projection would be inefficient.

## Pattern Selection

Choose Application Service when:

- The feature is simple master data CRUD.
- The operations are mostly create, update, delete, detail, and paged list.
- The workflow has little business branching.
- A single service keeps the code easier to scan than many small slices.

Choose Vertical Slice CQRS when:

- The feature has complex business rules or state transitions.
- Commands and queries have meaningfully different models.
- The feature includes reporting, dashboard aggregation, attachments, approvals, posting, reversal, import/export, or workflow orchestration.
- Handlers make the behavior easier to isolate and test.

## Verification

After changes, run the narrowest relevant verification available:

- `dotnet build` for solution or touched projects.
- Targeted tests when test projects exist.
- API compile checks after controller, service, or MediatR signature changes.
- Migration commands only when schema changes require them and the repo already uses EF migrations.

In the final response, summarize modified files and why each change was made.
