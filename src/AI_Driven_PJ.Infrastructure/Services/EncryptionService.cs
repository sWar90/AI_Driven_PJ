using System.Security.Cryptography;
using System.Text;
using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Options;
using Microsoft.Extensions.Options;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class EncryptionService(IOptions<EncryptionOptions> options) : IEncryptionService
{
    private readonly EncryptionOptions _options = options.Value;

    public string Encrypt(string plainText)
    {
        ArgumentNullException.ThrowIfNull(plainText);

        using var aes = CreateAes();
        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        return Convert.ToBase64String(encryptedBytes);
    }

    public string Decrypt(string encryptedText)
    {
        ArgumentNullException.ThrowIfNull(encryptedText);

        using var aes = CreateAes();
        using var decryptor = aes.CreateDecryptor();
        var encryptedBytes = Convert.FromBase64String(encryptedText);
        var plainBytes = decryptor.TransformFinalBlock(encryptedBytes, 0, encryptedBytes.Length);

        return Encoding.UTF8.GetString(plainBytes);
    }

    public async Task<Stream> DecryptAsync(Stream encryptedStream, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(encryptedStream);

        using var reader = new StreamReader(encryptedStream, Encoding.UTF8, leaveOpen: true);
        var encryptedText = await reader.ReadToEndAsync(cancellationToken);
        var plainText = Decrypt(encryptedText);

        return new MemoryStream(Encoding.UTF8.GetBytes(plainText));
    }

    private Aes CreateAes()
    {
        var key = Encoding.UTF8.GetBytes(_options.Key);
        var iv = Encoding.UTF8.GetBytes(_options.IV);

        if (key.Length is not (16 or 24 or 32))
        {
            throw new InvalidOperationException("Encryption key must be 16, 24, or 32 bytes.");
        }

        if (iv.Length != 16)
        {
            throw new InvalidOperationException("Encryption IV must be 16 bytes.");
        }

        var aes = Aes.Create();
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.Key = key;
        aes.IV = iv;

        return aes;
    }
}
