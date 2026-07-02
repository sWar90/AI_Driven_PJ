using Microsoft.AspNetCore.Http;

namespace AI_Driven_PJ.Application.Common.Interfaces;

public interface IFileService
{
    bool FileDelete(string path);

    bool FileDeleteDocker(string relativePath);

    Task<bool> WriteImageDocker(IFormFile file, string name, string folder);

    Task<bool> WriteFileDocker(IFormFile file, string name, string folder);

    Task<Stream?> OpenReadAsync(string relativePath, CancellationToken cancellationToken);
}
