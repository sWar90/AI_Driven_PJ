using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Options;
using AI_Driven_PJ.Infrastructure.Persistence;
using AI_Driven_PJ.Infrastructure.Persistence.Interceptors;
using AI_Driven_PJ.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AI_Driven_PJ.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        return services.AddInfrastructureServices(configuration);
    }

    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<EncryptionOptions>(
            configuration.GetSection(EncryptionOptions.SectionName));

        services.AddSingleton<IEncryptionService, EncryptionService>();
        services.AddSingleton<ICryptography, Cryptography>();
        services.AddSingleton<IRandomizer, Randomizer>();
        services.AddSingleton<IIdGenerationService, IdGenerationService>();
        services.AddSingleton<IDateTimeService, DateTimeService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IFileService, FileService>();
        services.AddSingleton<IAuthTokenCache, InMemoryAuthTokenCache>();
        services.AddScoped<ITokenBuilder, TokenBuilder>();
        services.AddScoped<ISaveChangesInterceptor, AuditableEntitySaveChangesInterceptor>();

        services.AddDbContext<ApplicationDbContext>((serviceProvider, options) =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseSqlServer(connectionString);
            options.AddInterceptors(serviceProvider.GetServices<ISaveChangesInterceptor>());
        });

        services.AddIdentityCore<IdentityUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        return services;
    }
}
