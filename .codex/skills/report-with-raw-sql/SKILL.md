---
name: report-with-raw-sql
description: Build ASP.NET Core report APIs in RixsFinTrack using IQueryService.GetRawAsync, Dapper raw SQL, SQL Server raw query reports, paged searchable sortable report grids, or heavy reports that should not be written as EF LINQ. Use when Codex needs to add or modify report endpoints backed by parameterized raw SQL while preserving Hybrid Clean Architecture, paged Result responses, QueryParams, company scoping, and standard API responses.
---

# Report With Raw SQL

## Workflow

1. Inspect the existing report, response, pagination, and MediatR conventions before editing.
2. Put report logic in `Application/Features/Reports/{ReportName}`. Do not place SQL, mapping, filtering, or sorting logic in controllers.
3. Model the report as a CQRS query when it is exposed through an API controller.
4. Inject `IQueryService` for raw SQL reads and `ICompanyContext` for company scoping.
5. Return `Result<PagedResult<TDto>>` for paged reports.
6. Keep controllers thin: bind the request, call `ISender.Send()`, and return `ResponseHelper.FromResult(result, HttpContext)`.
7. Run `dotnet build` after implementation.

## Request And Response Shape

- Extend the repo's `QueryParams` for report requests.
- Use existing paging and grid names: `Page`, `Take`, `Search`, `SortField`, `SortOrder`.
- Add feature-specific filters such as date range, status, currency, account, or department on the report request type.
- Project rows into DTOs. Do not expose EF Core entities or Dapper dynamic objects from API responses.
- For raw SQL paging, use an internal row model with `TotalCount` when using `COUNT(1) OVER()`, then map it to the public DTO.

## Raw SQL Rules

- Use parameterized SQL only. Never concatenate request values into SQL.
- Use `ICompanyContext.CompanyId`; do not trust client-supplied company ids for company-scoped reports.
- Add explicit soft-delete filters because EF Core global query filters do not apply to raw SQL.
- Use SQL Server syntax such as `CAST(value AS date)` and `OFFSET @Offset ROWS FETCH NEXT @Take ROWS ONLY`.
- Prefer exclusive end dates for full-day filters: `column < @EDateExclusive`.
- Whitelist sort fields before injecting `ORDER BY`; the only SQL text assembled from request data should be selected from a fixed dictionary.
- Default to a deterministic sort that includes a stable id column.

## Pagination Pattern

Calculate `Offset = (request.Page - 1) * request.Take`.

Use `COUNT(1) OVER() AS TotalCount` in the paged query when practical:

```sql
WITH ReportRows AS (
    SELECT ...
    FROM ...
    WHERE CompanyId = @CompanyId
)
SELECT
    COUNT(1) OVER() AS TotalCount,
    ...
FROM ReportRows
ORDER BY {whitelisted_order_by}
OFFSET @Offset ROWS FETCH NEXT @Take ROWS ONLY;
```

If no rows are returned, set `TotalCount = 0`, `TotalPages = 0`, and `Items = []`.

## Verification

- Validate sort fields are whitelisted and cannot inject SQL.
- Verify search, date filters, status filters, paging, empty results, and default sorting.
- Confirm response root properties remain `success`, `code`, `message`, and `data`.
