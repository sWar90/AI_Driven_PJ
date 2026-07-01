using AI_Driven_PJ.Application.Common.Models;
using AI_Driven_PJ.Application.Masters.Companies;
using Microsoft.AspNetCore.Mvc;

namespace AI_Driven_PJ.Api.Controllers;

[ApiController]
[Route("api/companies")]
public sealed class CompaniesController(CompanyService companyService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList(
        [FromQuery] QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await companyService.GetListAsync(queryParams, cancellationToken);
        return Ok(ApiResponse<PagedResult<CompanyDto>>.Ok(result.Data));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await companyService.GetByIdAsync(id, cancellationToken);
        return result.Succeeded
            ? Ok(ApiResponse<CompanyDto>.Ok(result.Data))
            : NotFound(ApiResponse.NotFound(result.Message));
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        CompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await companyService.CreateAsync(request, cancellationToken);
        return result.Succeeded
            ? StatusCode(StatusCodes.Status201Created, ApiResponse<CompanyDto>.Created(result.Data))
            : BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] }));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        CompanyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await companyService.UpdateAsync(id, request, cancellationToken);
        return result.Succeeded
            ? Ok(ApiResponse<CompanyDto>.Updated(result.Data))
            : NotFound(ApiResponse.NotFound(result.Message));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await companyService.DeleteAsync(id, cancellationToken);
        return result.Succeeded
            ? Ok(ApiResponse.Deleted())
            : NotFound(ApiResponse.NotFound(result.Message));
    }
}
