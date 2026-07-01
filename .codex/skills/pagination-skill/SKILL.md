---
name: pagination-skill
description: Add or enforce shared pagination for ASP.NET Core Clean Architecture list APIs. Use when Codex needs to create QueryParams, PagedResult, PaginationExtensions, or ToPagedResultAsync, convert list queries to shared pagination, remove repeated Skip/Take code from handlers, or ensure all CQRS list queries return paged results consistently.
---

# Pagination

Use this skill to add shared list pagination primitives and enforce one pagination implementation across Application-layer queries.

## Workflow

1. Inspect existing conventions before editing:
   - Find Application-layer common models/extensions folders.
   - Reuse existing response names, namespaces, nullable settings, and validation style.
   - Check whether `Result<T>` already wraps `PagedResult<T>`.
2. Add shared pagination primitives in the Application layer:
   - `QueryParams`
   - `PagedResult<T>`
   - `PaginationExtensions.ToPagedResultAsync`
3. Update list queries to accept `QueryParams` and call `ToPagedResultAsync`.
4. Remove handler-level `Skip` and `Take` logic.
5. Keep `Skip` and `Take` only inside `PaginationExtensions`.
6. Verify with `dotnet build` or the narrowest touched project build.

## QueryParams

Prefer a small model that works for every list API.

```csharp
public sealed class QueryParams
{
    private const int MaxPageSize = 100;
    private int _page = 1;
    private int _pageSize = 10;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 10,
            > MaxPageSize => MaxPageSize,
            _ => value
        };
    }

    public string? Search { get; set; }
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; }
}
```

Keep `QueryParams` generic. Add feature-specific filters to the query request, not to the shared pagination model.

## PagedResult

Use a standard response model that includes items and pagination metadata.

```csharp
public sealed class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages { get; init; }
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}
```

Use the repo's existing names if it already uses `Records`, `Data`, `Items`, `Total`, or a different metadata shape. Do not expose EF entities as `Items`; project to DTOs first.

## Pagination Extension

Place `Skip` and `Take` only in the shared extension.

```csharp
public static class PaginationExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query,
        QueryParams queryParams,
        CancellationToken cancellationToken = default)
    {
        var page = queryParams.Page;
        var pageSize = queryParams.PageSize;
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<T>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
```

Do not materialize the query before calling `ToPagedResultAsync`. Apply filtering, searching, sorting, `AsNoTracking()`, and DTO projection before the pagination call.

## List Query Pattern

Use shared pagination in CQRS query handlers.

```csharp
public sealed record GetCustomersQuery(QueryParams QueryParams)
    : IRequest<Result<PagedResult<CustomerListDto>>>;

public sealed class GetCustomersQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetCustomersQuery, Result<PagedResult<CustomerListDto>>>
{
    public async Task<Result<PagedResult<CustomerListDto>>> Handle(
        GetCustomersQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.Customers
            .AsNoTracking()
            .Select(customer => new CustomerListDto
            {
                Id = customer.Id,
                Name = customer.Name
            });

        var result = await query.ToPagedResultAsync(request.QueryParams, cancellationToken);
        return Result.Success(result);
    }
}
```

Controllers should bind `QueryParams` from query string and send the query through `ISender`.

```csharp
[HttpGet]
public async Task<IActionResult> GetCustomers([FromQuery] QueryParams queryParams)
{
    var result = await sender.Send(new GetCustomersQuery(queryParams));
    return Ok(result);
}
```

Adapt controller return helpers to the repo. Keep controllers thin.

## Rules

- Use `QueryParams` for every list API.
- Use `PagedResult<T>` for every paged list response.
- Use `ToPagedResultAsync` for pagination.
- Do not write `Skip` and `Take` in query handlers, controllers, services, or feature code.
- Keep `Skip` and `Take` inside `PaginationExtensions`.
- Use `AsNoTracking()` for read-only EF queries.
- Project to DTOs before pagination unless the repo has a measured reason to do otherwise.
- Add validated dynamic sorting helpers only once if the project needs generic sorting.

## Verification

- Search for direct `Skip(` and `Take(` after changes. They should appear only in `PaginationExtensions` unless another usage is unrelated to API pagination.
- Run `dotnet build` for touched projects or the full solution.
- Test at least one list endpoint shape when an API project exists.
