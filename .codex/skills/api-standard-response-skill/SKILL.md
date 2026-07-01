---
name: api-standard-response-skill
description: Create and enforce standard API response wrappers for ASP.NET Core Clean Architecture endpoints. Use when Codex needs to add ApiResponse, ApiResponse<T>, PagedResult, ErrorResponse, helper methods, controller response cleanup, validation error formatting, or global exception middleware so every response uses success, code, message, and data without anonymous response objects or mixed property names.
---

# API Standard Response

Use this skill to standardize every API endpoint response shape.

## Required Shape

Every API response must use these root property names:

```json
{
  "success": true,
  "code": 200,
  "message": "Successfully Retrieved",
  "data": []
}
```

The only root properties should be:

- `success`
- `code`
- `message`
- `data`

Do not use mixed root property names such as:

- `succeeded`
- `statusCode`
- `result`
- `errors` as the root response for normal success responses

## Required Models

Create or reuse these models in the Application layer:

```text
Application/
  Common/
    Models/
      ApiResponse.cs
      ApiResponseOfT.cs
      PagedResult.cs
      ErrorResponse.cs
```

If the repo prefers one generic file name, `ApiResponseOfT.cs` may contain `ApiResponse<T>`. Match existing namespace and file naming conventions when present.

## ApiResponse<T>

Use a generic wrapper for all typed responses.

```csharp
public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public int Code { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }

    public static ApiResponse<T> Ok(
        T data,
        string message = "Successfully Retrieved")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Code = StatusCodes.Status200OK,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Created(
        T data,
        string message = "Successfully Created")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Code = StatusCodes.Status201Created,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Fail(
        int code,
        string message,
        T? data = default)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Code = code,
            Message = message,
            Data = data
        };
    }
}
```

If keeping `StatusCodes` out of Application is required by dependency rules, use numeric constants or move status-code-specific helpers to Api. Do not make Application reference Api.

## Non-Generic ApiResponse

Use a non-generic wrapper for responses with `data: null`.

```csharp
public sealed class ApiResponse
{
    public bool Success { get; init; }
    public int Code { get; init; }
    public string Message { get; init; } = string.Empty;
    public object? Data { get; init; }

    public static ApiResponse Deleted(string message = "Successfully Deleted")
    {
        return new ApiResponse
        {
            Success = true,
            Code = StatusCodes.Status200OK,
            Message = message,
            Data = null
        };
    }

    public static ApiResponse NotFound(string message = "Data Not Found")
    {
        return new ApiResponse
        {
            Success = false,
            Code = StatusCodes.Status404NotFound,
            Message = message,
            Data = null
        };
    }

    public static ApiResponse ServerError(string message = "Internal Server Error")
    {
        return new ApiResponse
        {
            Success = false,
            Code = StatusCodes.Status500InternalServerError,
            Message = message,
            Data = null
        };
    }
}
```

Add helper methods such as `Updated`, `NoContent`, `ValidationFailed`, or typed `NotFound<T>` when the repo needs them.

## ErrorResponse

Wrap validation details inside `data`, not as root-level `errors`.

```csharp
public sealed class ErrorResponse
{
    public IReadOnlyList<string> Errors { get; init; } = [];
}
```

For field-level validation, adapt the `Errors` type to the repo's validation style, but keep it inside `data`.

## Required Response Examples

Successful GET list:

```json
{
  "success": true,
  "code": 200,
  "message": "Successfully Retrieved",
  "data": []
}
```

Successful GET detail:

```json
{
  "success": true,
  "code": 200,
  "message": "Successfully Retrieved",
  "data": {}
}
```

Successful CREATE:

```json
{
  "success": true,
  "code": 201,
  "message": "Successfully Created",
  "data": {}
}
```

Successful UPDATE:

```json
{
  "success": true,
  "code": 200,
  "message": "Successfully Updated",
  "data": {}
}
```

Successful DELETE:

```json
{
  "success": true,
  "code": 200,
  "message": "Successfully Deleted",
  "data": null
}
```

Validation error:

```json
{
  "success": false,
  "code": 400,
  "message": "Validation Failed",
  "data": {
    "errors": []
  }
}
```

Not found:

```json
{
  "success": false,
  "code": 404,
  "message": "Data Not Found",
  "data": null
}
```

Server error:

```json
{
  "success": false,
  "code": 500,
  "message": "Internal Server Error",
  "data": null
}
```

## Endpoint Return Rules

- All API endpoints must return a standard response wrapper.
- All list APIs return `ApiResponse<PagedResult<T>>` or `ApiResponse<List<T>>`.
- All detail APIs return `ApiResponse<T>`.
- All create, update, and delete APIs return `ApiResponse<T>` or `ApiResponse<object>`.
- Do not expose EF Core entities directly inside `data`.
- Use DTOs for all response data.
- Controllers must not manually create anonymous response objects.
- Use `ApiResponse` helper methods for all responses.

## Controller Pattern

Controllers should wrap service or CQRS results with `ApiResponse` helpers.

```csharp
[HttpGet]
public async Task<IActionResult> GetList([FromQuery] QueryParams queryParams, CancellationToken cancellationToken)
{
    var result = await service.GetListAsync(queryParams, cancellationToken);
    return Ok(ApiResponse<PagedResult<StateDto>>.Ok(result.Data));
}
```

```csharp
[HttpPost]
public async Task<IActionResult> Create(StateRequest request, CancellationToken cancellationToken)
{
    var result = await service.CreateAsync(request, cancellationToken);
    return StatusCode(
        StatusCodes.Status201Created,
        ApiResponse<StateDto>.Created(result.Data));
}
```

Adapt to the repo's result handling. If services already return `ApiResponse<T>`, controllers should return it directly with the matching HTTP status.

## Validation Errors

Validation errors must return the same response format.

```csharp
var errors = context.ModelState
    .Values
    .SelectMany(x => x.Errors)
    .Select(x => x.ErrorMessage)
    .ToList();

var response = ApiResponse<ErrorResponse>.Fail(
    StatusCodes.Status400BadRequest,
    "Validation Failed",
    new ErrorResponse { Errors = errors });
```

For FluentValidation pipelines, convert validation failures to the same `ApiResponse<ErrorResponse>` shape at the API boundary or exception middleware.

## Global Exception Middleware

Global exception middleware must return the same response format.

```csharp
var response = ApiResponse<object>.Fail(
    StatusCodes.Status500InternalServerError,
    "Internal Server Error",
    null);

httpContext.Response.StatusCode = response.Code;
await httpContext.Response.WriteAsJsonAsync(response);
```

Handle known exceptions such as not found and validation exceptions with their required codes and messages.

## Serialization

Ensure JSON output uses camelCase so C# properties serialize as:

- `Success` -> `success`
- `Code` -> `code`
- `Message` -> `message`
- `Data` -> `data`

Use the existing ASP.NET Core JSON options if already configured.

## Verification

- Search controllers for anonymous response objects such as `new { ... }`; replace API responses with `ApiResponse` helpers.
- Search for mixed root names: `succeeded`, `statusCode`, `result`, root `errors`.
- Confirm validation and exception responses use `success`, `code`, `message`, and `data`.
- Confirm `data` contains DTOs, not EF Core entities.
- Run `dotnet build` for touched projects or the full solution.
