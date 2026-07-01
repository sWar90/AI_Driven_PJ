using AI_Driven_PJ.Application;
using AI_Driven_PJ.Application.Common.Models;
using AI_Driven_PJ.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace AI_Driven_PJ.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public const string DefaultCorsPolicy = "DefaultCorsPolicy";

    public static IServiceCollection AddCorsConfiguration(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var configuredOrigins = configuration
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>() ?? [];

        var allowedOrigins = environment.IsDevelopment()
            ? ["http://localhost:4200", "https://localhost:4200"]
            : configuredOrigins
                .Where(origin => !string.IsNullOrWhiteSpace(origin))
                .Where(origin => !origin.Contains("localhost", StringComparison.OrdinalIgnoreCase))
                .ToArray();

        services.AddCors(options =>
        {
            options.AddPolicy(DefaultCorsPolicy, policy =>
            {
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        return services;
    }

    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Values
                        .SelectMany(value => value.Errors)
                        .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                            ? "Invalid request value."
                            : error.ErrorMessage)
                        .ToList();

                    var response = ApiResponse<ErrorResponse>.Fail(
                        StatusCodes.Status400BadRequest,
                        "Validation Failed",
                        new ErrorResponse { Errors = errors });

                    return new BadRequestObjectResult(response);
                };
            });

        services.AddOpenApiDocumentation();
        services.AddJwtAuthentication(configuration);
        services.AddApplicationServices();
        services.AddInfrastructureServices(configuration);

        return services;
    }
}
