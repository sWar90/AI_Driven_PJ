using AI_Driven_PJ.Application.Common.Extensions;
using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Models;
using AI_Driven_PJ.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AI_Driven_PJ.Application.Masters.Companies;

public sealed class CompanyService(IApplicationDbContext context)
{
    public async Task<Result<PagedResult<CompanyDto>>> GetListAsync(
        QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var query = context.Set<Company>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
        {
            var searchTerm = queryParams.SearchTerm.Trim();
            query = query.Where(company =>
                company.CompanyName.Contains(searchTerm) ||
                (company.RegNumber != null && company.RegNumber.Contains(searchTerm)) ||
                company.Status.Contains(searchTerm));
        }

        query = queryParams.SortBy?.ToLowerInvariant() switch
        {
            "regnumber" => queryParams.SortDescending
                ? query.OrderByDescending(company => company.RegNumber)
                : query.OrderBy(company => company.RegNumber),
            "status" => queryParams.SortDescending
                ? query.OrderByDescending(company => company.Status)
                : query.OrderBy(company => company.Status),
            _ => queryParams.SortDescending
                ? query.OrderByDescending(company => company.CompanyName)
                : query.OrderBy(company => company.CompanyName)
        };

        var result = await query
            .Select(company => ToDto(company))
            .ToPagedResultAsync(queryParams, cancellationToken);

        return Result<PagedResult<CompanyDto>>.Success(result);
    }

    public async Task<Result<CompanyDto>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var dto = await context.Set<Company>()
            .AsNoTracking()
            .Where(company => company.CompanyId == id)
            .Select(company => ToDto(company))
            .FirstOrDefaultAsync(cancellationToken);

        return dto is null
            ? Result<CompanyDto>.Failure("Company not found.")
            : Result<CompanyDto>.Success(dto);
    }

    public async Task<Result<CompanyDto>> CreateAsync(CompanyRequest request, CancellationToken cancellationToken)
    {
        if (await context.Set<Company>().AnyAsync(company => company.CompanyId == request.CompanyId, cancellationToken))
        {
            return Result<CompanyDto>.Failure("Company already exists.");
        }

        var company = new Company
        {
            CompanyId = request.CompanyId,
            CompanyName = request.CompanyName,
            RegNumber = request.RegNumber,
            BaseCurrencyId = request.BaseCurrencyId,
            Status = request.Status,
            Remark = request.Remark,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        context.Set<Company>().Add(company);
        await context.SaveChangesAsync(cancellationToken);

        return Result<CompanyDto>.Success(ToDto(company));
    }

    public async Task<Result<CompanyDto>> UpdateAsync(
        int id,
        CompanyRequest request,
        CancellationToken cancellationToken)
    {
        var company = await context.Set<Company>()
            .FirstOrDefaultAsync(company => company.CompanyId == id, cancellationToken);

        if (company is null)
        {
            return Result<CompanyDto>.Failure("Company not found.");
        }

        company.CompanyName = request.CompanyName;
        company.RegNumber = request.RegNumber;
        company.BaseCurrencyId = request.BaseCurrencyId;
        company.Status = request.Status;
        company.Remark = request.Remark;
        company.UpdatedAt = DateTime.UtcNow;
        company.UpdatedBy = "system";

        await context.SaveChangesAsync(cancellationToken);

        return Result<CompanyDto>.Success(ToDto(company));
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var company = await context.Set<Company>()
            .FirstOrDefaultAsync(company => company.CompanyId == id, cancellationToken);

        if (company is null)
        {
            return Result.Failure("Company not found.");
        }

        context.Set<Company>().Remove(company);
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static CompanyDto ToDto(Company company)
    {
        return new CompanyDto
        {
            CompanyId = company.CompanyId,
            CompanyName = company.CompanyName,
            RegNumber = company.RegNumber,
            BaseCurrencyId = company.BaseCurrencyId,
            Status = company.Status,
            Remark = company.Remark,
            CreatedAt = company.CreatedAt,
            CreatedBy = company.CreatedBy,
            UpdatedAt = company.UpdatedAt,
            UpdatedBy = company.UpdatedBy
        };
    }
}
