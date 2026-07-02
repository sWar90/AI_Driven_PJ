using System.Text;
using AI_Driven_PJ.Application.Common.Interfaces;

namespace AI_Driven_PJ.Infrastructure.Services;

public class IdGenerationService(
    IRandomizer randomizer) : IIdGenerationService
{
    public string GetJournalVo(long companyId)
    {
        StringBuilder stringBuilder = new();
        _ = stringBuilder.Append(randomizer.RandomAlphanumeric(6, $"JMV{companyId}-", "ddMMyy"));
        return stringBuilder.ToString();
    }
}
