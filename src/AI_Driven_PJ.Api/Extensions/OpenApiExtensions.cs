using AI_Driven_PJ.Application.Common.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;

namespace AI_Driven_PJ.Api.Extensions;

public static class OpenApiExtensions
{
    public static IServiceCollection AddOpenApiDocumentation(this IServiceCollection services)
    {
        services.AddOpenApi(options => options.UseJwtBearerAuthentication());
        return services;
    }

    public static OpenApiOptions UseJwtBearerAuthentication(this OpenApiOptions options)
    {
        var jwtScheme = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Name = "Authorization",
            In = ParameterLocation.Header
        };

        options.AddDocumentTransformer((document, _, _) =>
        {
            document.Components ??= new OpenApiComponents();
            document.Components.SecuritySchemes ??= new Dictionary<string, OpenApiSecurityScheme>();
            document.Components.SecuritySchemes[JwtBearerDefaults.AuthenticationScheme] = jwtScheme;

            return Task.CompletedTask;
        });

        options.AddOperationTransformer((operation, context, _) =>
        {
            operation.Parameters ??= [];

            if (!operation.Parameters.Any(parameter =>
                    string.Equals(parameter.Name, AuthConstants.CompanyHeader, StringComparison.OrdinalIgnoreCase) &&
                    parameter.In == ParameterLocation.Header))
            {
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = AuthConstants.CompanyHeader,
                    In = ParameterLocation.Header,
                    Required = false,
                    Description = "Company identifier",
                    Schema = new OpenApiSchema
                    {
                        Type = "string"
                    }
                });
            }

            if (context.Description.ActionDescriptor.EndpointMetadata.OfType<IAuthorizeData>().Any())
            {
                operation.Security =
                [
                    new OpenApiSecurityRequirement
                    {
                        [
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = JwtBearerDefaults.AuthenticationScheme
                                }
                            }
                        ] = []
                    }
                ];
            }

            return Task.CompletedTask;
        });

        return options;
    }

    public static WebApplication MapOpenApiDocumentation(this WebApplication app)
    {
        if (!app.Environment.IsDevelopment())
        {
            return app;
        }

        app.MapOpenApi();
        app.MapScalarApiReference();

        return app;
    }
}
