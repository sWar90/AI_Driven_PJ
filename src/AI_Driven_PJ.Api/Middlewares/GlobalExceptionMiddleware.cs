namespace AI_Driven_PJ.Api.Middlewares;

public sealed class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
    : ExceptionHandlingMiddleware(next, logger)
{
}
