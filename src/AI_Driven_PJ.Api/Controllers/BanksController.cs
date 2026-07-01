using AI_Driven_PJ.Application.Common.Models;
using AI_Driven_PJ.Application.Masters.Banks;
using Microsoft.AspNetCore.Mvc;

namespace AI_Driven_PJ.Api.Controllers;

[Route("[controller]")]
[ApiController]
public sealed class BanksController(BankService bankService) : ControllerBase
{
    [HttpGet]
    [EndpointSummary("Get All")]
    [EndpointDescription("Get paginated banks list.")]
    public async Task<IActionResult> GetList(
        [FromQuery] QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var result = await bankService.GetListAsync(queryParams, cancellationToken);
        return Ok(ApiResponse<PagedResult<BankDto>>.Ok(result.Data));
    }

    [HttpGet("{id:int}")]
    [EndpointSummary("Get By Id")]
    [EndpointDescription("Get By Bank Id")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await bankService.GetByIdAsync(id, cancellationToken);
        return result.Succeeded
            ? Ok(ApiResponse<BankDto>.Ok(result.Data))
            : NotFound(ApiResponse.NotFound(result.Message));
    }

    [HttpPost]
    [EndpointSummary("Create")]
    [EndpointDescription("Create Bank")]
    public async Task<IActionResult> Create(
        BankRequest request,
        CancellationToken cancellationToken)
    {
        var result = await bankService.CreateAsync(request, cancellationToken);
        return result.Succeeded
            ? StatusCode(StatusCodes.Status201Created, ApiResponse<BankDto>.Created(result.Data))
            : BadRequest(ApiResponse.BadRequest(result.Message, new ErrorResponse { Errors = [.. result.Errors] }));
    }

    [HttpPut("{id:int}")]
    [EndpointSummary("Update")]
    [EndpointDescription("Update By Id")]
    public async Task<IActionResult> Update(
        int id,
        BankRequest request,
        CancellationToken cancellationToken)
    {
        var result = await bankService.UpdateAsync(id, request, cancellationToken);
        return result.Succeeded
            ? Ok(ApiResponse<BankDto>.Updated(result.Data))
            : NotFound(ApiResponse.NotFound(result.Message));
    }

    [HttpDelete("{id:int}")]
    [EndpointSummary("Delete")]
    [EndpointDescription("Delete By Id")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await bankService.DeleteAsync(id, cancellationToken);
        return result.Succeeded
            ? Ok(ApiResponse.Deleted())
            : NotFound(ApiResponse.NotFound(result.Message));
    }
}
