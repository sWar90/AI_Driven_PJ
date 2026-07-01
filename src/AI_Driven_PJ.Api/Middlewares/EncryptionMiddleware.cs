using System.Text;
using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Models;
using AI_Driven_PJ.Application.Common.Options;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;

namespace AI_Driven_PJ.Api.Middlewares;

public sealed class EncryptionMiddleware(
    RequestDelegate next,
    IEncryptionService encryptionService,
    IOptions<EncryptionOptions> options)
{
    private readonly EncryptionOptions _options = options.Value;

    public async Task InvokeAsync(HttpContext context)
    {
        if (ShouldBypass(context.Request))
        {
            await next(context);
            return;
        }

        try
        {
            await DecryptQueryStringAsync(context);
            await DecryptRequestBodyAsync(context);
        }
        catch (Exception)
        {
            var response = ApiResponse.BadRequest(
                "Invalid encrypted request.",
                new ErrorResponse { Errors = ["Request body or query string could not be decrypted."] });

            context.Response.StatusCode = response.Code;
            await context.Response.WriteAsJsonAsync(response);
            return;
        }

        await next(context);
    }

    private bool ShouldBypass(HttpRequest request)
    {
        if (!_options.Enabled ||
            HttpMethods.IsOptions(request.Method) ||
            request.Headers.ContainsKey("Postman-Token") ||
            request.Headers.ContainsKey("Mobile-Request") ||
            IsScalarReferer(request))
        {
            return true;
        }

        var path = request.Path.Value ?? string.Empty;

        return _options.ExcludedPaths.Any(excludedPath =>
                string.Equals(path, excludedPath, StringComparison.OrdinalIgnoreCase)) ||
            _options.ExcludedPathPrefixes.Any(prefix =>
                path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsScalarReferer(HttpRequest request)
    {
        if (!request.Headers.TryGetValue(HeaderNames.Referer, out var referer))
        {
            return false;
        }

        var refererText = referer.ToString();
        return refererText.Contains("/scalar", StringComparison.OrdinalIgnoreCase) ||
            refererText.Contains("/docs/scalar", StringComparison.OrdinalIgnoreCase);
    }

    private Task DecryptQueryStringAsync(HttpContext context)
    {
        if (!context.Request.QueryString.HasValue)
        {
            return Task.CompletedTask;
        }

        var encryptedQuery = Uri.UnescapeDataString(context.Request.QueryString.Value!.TrimStart('?'));
        var decryptedQuery = encryptionService.Decrypt(encryptedQuery);
        context.Request.QueryString = new QueryString(decryptedQuery.StartsWith('?')
            ? decryptedQuery
            : $"?{decryptedQuery}");

        return Task.CompletedTask;
    }

    private async Task DecryptRequestBodyAsync(HttpContext context)
    {
        if (context.Request.ContentLength is null or 0 || !CanHaveBody(context.Request.Method))
        {
            return;
        }

        context.Request.EnableBuffering();
        context.Request.Body.Position = 0;

        using var reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
        var encryptedBody = await reader.ReadToEndAsync(context.RequestAborted);

        if (string.IsNullOrWhiteSpace(encryptedBody))
        {
            context.Request.Body.Position = 0;
            return;
        }

        var decryptedBody = encryptionService.Decrypt(encryptedBody);
        var bodyBytes = Encoding.UTF8.GetBytes(decryptedBody);
        context.Request.Body = new MemoryStream(bodyBytes);
        context.Request.ContentLength = bodyBytes.Length;
    }

    private static bool CanHaveBody(string method)
    {
        return HttpMethods.IsPost(method) ||
            HttpMethods.IsPut(method) ||
            HttpMethods.IsPatch(method);
    }
}
