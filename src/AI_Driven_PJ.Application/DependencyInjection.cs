using AI_Driven_PJ.Application.Masters.Banks;
using AI_Driven_PJ.Application.Masters.Companies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AI_Driven_PJ.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        return services.AddApplicationServices();
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<BankService>();
        services.AddScoped<CompanyService>();

        return services;
    }
}
