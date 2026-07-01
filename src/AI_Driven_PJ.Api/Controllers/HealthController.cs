using AI_Driven_PJ.Application.Common.Models;
using Microsoft.AspNetCore.Mvc;

namespace AI_Driven_PJ.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(ApiResponse<object>.Ok(new
        {
            status = "Healthy",
            application = "AI_Driven_PJ.Api",
            timestamp = DateTime.UtcNow
        }));
    }
}
