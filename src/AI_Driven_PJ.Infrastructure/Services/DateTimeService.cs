using AI_Driven_PJ.Application.Common.Interfaces;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class DateTimeService : IDateTimeService
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
