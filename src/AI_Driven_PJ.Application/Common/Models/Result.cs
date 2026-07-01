namespace AI_Driven_PJ.Application.Common.Models;

public class Result
{
    protected Result(bool succeeded, string message, IReadOnlyCollection<string>? errors = null)
    {
        Succeeded = succeeded;
        Message = message;
        Errors = errors ?? Array.Empty<string>();
    }

    public bool Succeeded { get; }

    public string Message { get; }

    public IReadOnlyCollection<string> Errors { get; }

    public static Result Success(string message = "Operation completed successfully.") =>
        new(true, message);

    public static Result Failure(string message, IReadOnlyCollection<string>? errors = null) =>
        new(false, message, errors);
}

public sealed class Result<T> : Result
{
    private Result(bool succeeded, string message, T? data, IReadOnlyCollection<string>? errors = null)
        : base(succeeded, message, errors)
    {
        Data = data;
    }

    public T? Data { get; }

    public static Result<T> Success(T data, string message = "Operation completed successfully.") =>
        new(true, message, data);

    public static new Result<T> Failure(string message, IReadOnlyCollection<string>? errors = null) =>
        new(false, message, default, errors);
}
