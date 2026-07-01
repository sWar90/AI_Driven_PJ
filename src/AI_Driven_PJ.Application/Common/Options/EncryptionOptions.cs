namespace AI_Driven_PJ.Application.Common.Options;

public sealed class EncryptionOptions
{
    public const string SectionName = "Encryption";

    public bool Enabled { get; init; }

    public string Key { get; init; } = string.Empty;

    public string IV { get; init; } = string.Empty;

    public IReadOnlyCollection<string> ExcludedPaths { get; init; } = Array.Empty<string>();

    public IReadOnlyCollection<string> ExcludedPathPrefixes { get; init; } = Array.Empty<string>();
}
