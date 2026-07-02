using AI_Driven_PJ.Application.Common.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;

namespace AI_Driven_PJ.Api.Extensions;

public static class JwtAuthenticationExtensions
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static IServiceCollection AddJwtAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var secret = configuration["JWT:Secret"];

        if (string.IsNullOrWhiteSpace(secret))
        {
            services.AddAuthentication();
            services.AddAuthorization(options =>
            {
                options.AddPolicy("SuperAdminOnly", policy =>
                    policy.RequireClaim(AuthConstants.IsSuperAdminClaim, "true"));
            });
            return services;
        }

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.RequireHttpsMetadata = true;
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                    ValidIssuer = configuration["JWT:ValidIssuer"],
                    ValidAudience = configuration["JWT:ValidAudience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(secret))
                };

                options.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = context =>
                    {
                        context.NoResult();
                        return Task.CompletedTask;
                    },
                    OnChallenge = async context =>
                    {
                        if (context.Response.HasStarted)
                        {
                            return;
                        }

                        context.HandleResponse();
                        await WriteAuthFailureAsync(
                            context.Response,
                            StatusCodes.Status401Unauthorized,
                            ApiMessages.Unauthorized);
                    },
                    OnForbidden = async context =>
                    {
                        await WriteAuthFailureAsync(
                            context.Response,
                            StatusCodes.Status403Forbidden,
                            ApiMessages.Forbidden);
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("SuperAdminOnly", policy =>
                policy.RequireClaim(AuthConstants.IsSuperAdminClaim, "true"));
        });

        return services;
    }

    private static async Task WriteAuthFailureAsync(
        HttpResponse response,
        int statusCode,
        string message)
    {
        if (response.HasStarted)
        {
            return;
        }

        response.StatusCode = statusCode;
        response.ContentType = "application/json";

        var payload = ApiResponse.Fail(statusCode, message);
        await response.WriteAsync(JsonSerializer.Serialize(payload, JsonOptions));
    }
}
