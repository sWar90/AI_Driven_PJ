using AI_Driven_PJ.Application.Common.Models;

namespace AI_Driven_PJ.Api.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Unhandled API exception.");

            var response = ApiResponse.ServerError();
            context.Response.StatusCode = response.Code;
            await context.Response.WriteAsJsonAsync(response);
        }
    }
}
