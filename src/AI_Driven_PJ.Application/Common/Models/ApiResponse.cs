namespace AI_Driven_PJ.Application.Common.Models;

public sealed class ApiResponse
{
    public bool Success { get; init; }

    public int Code { get; init; }

    public string Message { get; init; } = string.Empty;

    public object? Data { get; init; }

    public static ApiResponse Deleted(string message = "Successfully Deleted")
    {
        return Ok(message);
    }

    public static ApiResponse Ok(string message = "Successfully Retrieved")
    {
        return new ApiResponse
        {
            Success = true,
            Code = 200,
            Message = message,
            Data = null
        };
    }

    public static ApiResponse NotFound(string message = "Data Not Found")
    {
        return Fail(404, message);
    }

    public static ApiResponse BadRequest(string message = "Bad Request", object? data = null)
    {
        return Fail(400, message, data);
    }

    public static ApiResponse ServerError(string message = "Internal Server Error")
    {
        return Fail(500, message);
    }

    public static ApiResponse Fail(int code, string message, object? data = null)
    {
        return new ApiResponse
        {
            Success = false,
            Code = code,
            Message = message,
            Data = data
        };
    }
}
