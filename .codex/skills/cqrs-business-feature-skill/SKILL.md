---
name: cqrs-business-feature-skill
description: Build complex ASP.NET Core business features with Vertical Slice CQRS in Clean Architecture. Use when Codex needs to add commands, queries, handlers, validators, DTOs, reports, dashboards, transactions, workflows, voucher creation, payment confirmation, wallet transactions, customer credit approval, status changes, or any write operation with important business rules. Do not use for simple master data CRUD.
---

# CQRS Business Feature

Use this skill only for complex business features, big business logic, workflows, transactions, reports, dashboards, and important write operations.

## Workflow

1. Inspect existing conventions before changing code:
   - Find the Application, Domain, Infrastructure, and Api projects.
   - Reuse existing MediatR, FluentValidation, `IApplicationDbContext`, `Result<T>`, `PagedResult<T>`, `QueryParams`, and `ToPagedResultAsync` patterns.
   - Check existing feature folder naming before creating new folders.
2. Confirm the feature is complex enough for CQRS:
   - Use this skill for complex business behavior, not simple master data CRUD.
   - Simple master data belongs in Application service classes, not commands/queries/handlers.
3. Create feature folders under `Application/Features/{FeatureName}`.
4. Put write operations under `Commands/{OperationName}`.
5. Put read/report/dashboard operations under `Queries/{OperationName}`.
6. Put shared feature DTOs under `Dtos`.
7. Keep controllers thin and only call `ISender.Send()`.
8. Verify with `dotnet build` or the narrowest touched project build.

## Required Structure

Use this structure for CQRS business features:

```text
Application/
  Features/
    Orders/
      Commands/
        CreateOrder/
          CreateOrderCommand.cs
          CreateOrderCommandHandler.cs
          CreateOrderCommandValidator.cs
          CreateOrderResponse.cs
        CreateVoucher/
          CreateVoucherCommand.cs
          CreateVoucherCommandHandler.cs
          CreateVoucherCommandValidator.cs
          CreateVoucherResponse.cs
      Queries/
        GetOrderList/
        GetOrderById/
        Reports/
      Dtos/
```

Adapt `Orders` to the real feature name, such as `Transactions`, `TransactionAttachments`, `Reports`, or `Dashboards`.

## Use Command For

Use a command for write operations and any operation with important business rules:

- Create
- Update
- Delete
- Status change
- Voucher creation
- Payment confirmation
- Wallet transaction
- Customer credit approval
- Any write operation with important business rules

Commands should:

- Implement the repo's MediatR request style.
- Use request data needed by the business operation.
- Return `Result<TResponse>` or the repo's standard result type.
- Put business rules in the handler, domain methods, or application services used by the handler.
- Use EF Core through `IApplicationDbContext`.
- Call `SaveChangesAsync` after state changes.

## Use Query For

Use a query for read models and analytical outputs:

- Detail read
- Complex list
- Report
- Dashboard
- Aggregated data

Queries should:

- Use `AsNoTracking()` for read-only EF Core queries.
- Project to DTOs or response models.
- Return `PagedResult<T>` for paged lists.
- Use `QueryParams` and `ToPagedResultAsync` for all list APIs.
- Use Dapper, raw SQL, SQL views, or stored procedures for heavy reports when appropriate.

## Command Pattern

Create one folder per command operation.

```csharp
public sealed record CreateOrderCommand(
    Guid CustomerId,
    DateTimeOffset OrderDate,
    IReadOnlyList<CreateOrderLineRequest> Lines)
    : IRequest<Result<CreateOrderResponse>>;
```

```csharp
public sealed class CreateOrderCommandHandler(IApplicationDbContext context)
    : IRequestHandler<CreateOrderCommand, Result<CreateOrderResponse>>
{
    public async Task<Result<CreateOrderResponse>> Handle(
        CreateOrderCommand request,
        CancellationToken cancellationToken)
    {
        var order = new Order
        {
            CustomerId = request.CustomerId,
            OrderDate = request.OrderDate
        };

        foreach (var line in request.Lines)
        {
            order.AddLine(line.ItemId, line.Quantity, line.Price);
        }

        context.Orders.Add(order);
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success(new CreateOrderResponse
        {
            Id = order.Id
        });
    }
}
```

```csharp
public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Lines).NotEmpty();
    }
}
```

Adapt validation style to the repo. Keep validation in Application, not in controllers.

## Query Pattern

Create one folder per query operation.

```csharp
public sealed record GetOrderListQuery(QueryParams QueryParams)
    : IRequest<Result<PagedResult<OrderListDto>>>;
```

```csharp
public sealed class GetOrderListQueryHandler(IApplicationDbContext context)
    : IRequestHandler<GetOrderListQuery, Result<PagedResult<OrderListDto>>>
{
    public async Task<Result<PagedResult<OrderListDto>>> Handle(
        GetOrderListQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.Orders
            .AsNoTracking()
            .Select(order => new OrderListDto
            {
                Id = order.Id,
                OrderNo = order.OrderNo,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount
            });

        var result = await query.ToPagedResultAsync(request.QueryParams, cancellationToken);
        return Result.Success(result);
    }
}
```

Do not expose EF Core entities directly from API. Use DTOs and response models.

## Reports And Dashboards

Put report and dashboard queries under the feature's `Queries` folder:

```text
Application/
  Features/
    Orders/
      Queries/
        Reports/
          GetOrderSummaryReport/
            GetOrderSummaryReportQuery.cs
            GetOrderSummaryReportQueryHandler.cs
            OrderSummaryReportDto.cs
    Dashboards/
      Queries/
        GetFinanceDashboard/
          GetFinanceDashboardQuery.cs
          GetFinanceDashboardQueryHandler.cs
          FinanceDashboardDto.cs
```

Reports and dashboards should:

- Use query objects, not commands.
- Use read-only projections.
- Use `AsNoTracking()` for EF Core reads.
- Use DTOs tailored to the report/dashboard.
- Use Dapper, raw SQL, SQL views, or stored procedures for heavy aggregation when EF Core would be inefficient.

## Controller Pattern

Controllers for CQRS features must be thin and only call `ISender.Send()`.

```csharp
[ApiController]
[Route("api/orders")]
public sealed class OrdersController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetOrderListQuery(queryParams), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CreateOrderCommand command,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
```

Do not put business logic, EF Core queries, mapping logic, validation rules, or transaction workflows inside controllers.

## Rules

- Use CQRS only for complex business features, big business logic, workflows, transactions, reports, and dashboards.
- Do not use CQRS for simple master data CRUD.
- Use Command for write operations with important business rules.
- Use Query for detail reads, complex lists, reports, dashboards, and aggregated data.
- Controllers for CQRS features call `ISender.Send()` only.
- Do not put business logic inside controllers.
- Do not expose EF Core entities directly from API.
- Use EF Core through `IApplicationDbContext`.
- Do not create Repository Pattern.
- Use `AsNoTracking()` for read-only queries.
- Use `QueryParams` and `PagedResult<T>` for list queries.

## Verification

- Confirm each command folder contains command, handler, validator when validation is used, and response when the command returns data.
- Confirm each query folder contains query, handler, and DTO/response model.
- Search controllers for direct EF Core access or business logic; none should exist.
- Run `dotnet build` for touched projects or the full solution.
