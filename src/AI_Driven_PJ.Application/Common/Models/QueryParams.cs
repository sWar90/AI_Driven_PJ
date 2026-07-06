namespace AI_Driven_PJ.Application.Common.Models;

public sealed class QueryParams
{
    private const int MaxPageSize = 100;
    private int _pageNumber = 1;
    private int _pageSize = 10;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int Page
    {
        get => PageNumber;
        set => PageNumber = value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value switch
        {
            < 1 => 10,
            > MaxPageSize => MaxPageSize,
            _ => value
        };
    }

    public int Take
    {
        get => PageSize;
        set => PageSize = value;
    }

    public string? SearchTerm { get; set; }

    public string? Search
    {
        get => SearchTerm;
        set => SearchTerm = value;
    }

    public string? SortBy { get; set; }

    public string? SortField
    {
        get => SortBy;
        set => SortBy = value;
    }

    public bool SortDescending { get; set; }

    public int? SortOrder
    {
        get => SortDescending ? -1 : 1;
        set => SortDescending = value < 0;
    }
}
