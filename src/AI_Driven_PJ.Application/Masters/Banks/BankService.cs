using AI_Driven_PJ.Application.Common.Extensions;
using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Models;
using AI_Driven_PJ.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AI_Driven_PJ.Application.Masters.Banks;

public sealed class BankService(IApplicationDbContext context)
{
    public async Task<Result<PagedResult<BankDto>>> GetListAsync(
        QueryParams queryParams,
        CancellationToken cancellationToken)
    {
        var query = context.Set<Bank>().AsNoTracking();

        if (!string.IsNullOrWhiteSpace(queryParams.SearchTerm))
        {
            var searchTerm = queryParams.SearchTerm.Trim();
            query = query.Where(bank =>
                bank.BankName.Contains(searchTerm) ||
                bank.BankCode.Contains(searchTerm) ||
                bank.Status.Contains(searchTerm));
        }

        query = queryParams.SortBy?.ToLowerInvariant() switch
        {
            "bankcode" => queryParams.SortDescending
                ? query.OrderByDescending(bank => bank.BankCode)
                : query.OrderBy(bank => bank.BankCode),
            "status" => queryParams.SortDescending
                ? query.OrderByDescending(bank => bank.Status)
                : query.OrderBy(bank => bank.Status),
            _ => queryParams.SortDescending
                ? query.OrderByDescending(bank => bank.BankName)
                : query.OrderBy(bank => bank.BankName)
        };

        var result = await query
            .Select(bank => ToDto(bank))
            .ToPagedResultAsync(queryParams, cancellationToken);

        return Result<PagedResult<BankDto>>.Success(result);
    }

    public async Task<Result<BankDto>> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        var dto = await context.Set<Bank>()
            .AsNoTracking()
            .Where(bank => bank.BankId == id)
            .Select(bank => ToDto(bank))
            .FirstOrDefaultAsync(cancellationToken);

        return dto is null
            ? Result<BankDto>.Failure("Bank not found.")
            : Result<BankDto>.Success(dto);
    }

    public async Task<Result<BankDto>> CreateAsync(BankRequest request, CancellationToken cancellationToken)
    {
        if (await context.Set<Bank>().AnyAsync(bank => bank.BankId == request.BankId, cancellationToken))
        {
            return Result<BankDto>.Failure("Bank already exists.");
        }

        var bank = new Bank
        {
            BankId = request.BankId,
            BankName = request.BankName,
            BankCode = request.BankCode,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        context.Set<Bank>().Add(bank);
        await context.SaveChangesAsync(cancellationToken);

        return Result<BankDto>.Success(ToDto(bank));
    }

    public async Task<Result<BankDto>> UpdateAsync(
        int id,
        BankRequest request,
        CancellationToken cancellationToken)
    {
        var bank = await context.Set<Bank>()
            .FirstOrDefaultAsync(bank => bank.BankId == id, cancellationToken);

        if (bank is null)
        {
            return Result<BankDto>.Failure("Bank not found.");
        }

        bank.BankName = request.BankName;
        bank.BankCode = request.BankCode;
        bank.Status = request.Status;
        bank.UpdatedAt = DateTime.UtcNow;
        bank.UpdatedBy = "system";

        await context.SaveChangesAsync(cancellationToken);

        return Result<BankDto>.Success(ToDto(bank));
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken)
    {
        var bank = await context.Set<Bank>()
            .FirstOrDefaultAsync(bank => bank.BankId == id, cancellationToken);

        if (bank is null)
        {
            return Result.Failure("Bank not found.");
        }

        context.Set<Bank>().Remove(bank);
        await context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    private static BankDto ToDto(Bank bank)
    {
        return new BankDto
        {
            BankId = bank.BankId,
            BankName = bank.BankName,
            BankCode = bank.BankCode,
            Status = bank.Status,
            CreatedAt = bank.CreatedAt,
            CreatedBy = bank.CreatedBy,
            UpdatedAt = bank.UpdatedAt,
            UpdatedBy = bank.UpdatedBy
        };
    }
}
