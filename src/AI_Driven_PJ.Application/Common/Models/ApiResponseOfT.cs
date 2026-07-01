namespace AI_Driven_PJ.Application.Common.Models;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }

    public int Code { get; init; }

    public string Message { get; init; } = string.Empty;

    public T? Data { get; init; }

    public static ApiResponse<T> Ok(T? data, string message = "Successfully Retrieved")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Code = 200,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Created(T? data, string message = "Successfully Created")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Code = 201,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Updated(T? data, string message = "Successfully Updated")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Code = 200,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> Fail(int code, string message, T? data = default)
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
