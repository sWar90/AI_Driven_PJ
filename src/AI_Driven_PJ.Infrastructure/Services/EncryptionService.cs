using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using AI_Driven_PJ.Application.Common.Interfaces;
using AI_Driven_PJ.Application.Common.Options;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class EncryptionService(IOptions<EncryptionOptions> options) : IEncryptionService
{
    private readonly EncryptionOptions options = options.Value;

    public CryptoStream EncryptStream(Stream responseStream)
    {
        var aes = GetEncryptionAlgorithm();
        var base64Transform = new ToBase64Transform();
        var base64EncodedStream = new CryptoStream(responseStream, base64Transform, CryptoStreamMode.Write);
        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

        return new CryptoStream(base64EncodedStream, encryptor, CryptoStreamMode.Write);
    }

    public string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
        {
            return string.Empty;
        }

        using var aes = GetEncryptionAlgorithm();
        using var memoryStream = new MemoryStream();
        using (var cryptoStream = new CryptoStream(memoryStream, aes.CreateEncryptor(aes.Key, aes.IV), CryptoStreamMode.Write))
        using (var streamWriter = new StreamWriter(cryptoStream))
        {
            streamWriter.Write(plainText);
        }

        return Convert.ToBase64String(memoryStream.ToArray());
    }

    public CryptoStream DecryptStream(Stream cipherStream)
    {
        var aes = GetEncryptionAlgorithm();
        var base64Transform = new FromBase64Transform(FromBase64TransformMode.IgnoreWhiteSpaces);
        var base64DecodedStream = new CryptoStream(cipherStream, base64Transform, CryptoStreamMode.Read);
        var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);

        return new CryptoStream(base64DecodedStream, decryptor, CryptoStreamMode.Read);
    }

    public string Decrypt(string encryptedText)
    {
        if (string.IsNullOrWhiteSpace(encryptedText))
        {
            return string.Empty;
        }

        var buffer = Convert.FromBase64String(encryptedText);

        using var memoryStream = new MemoryStream(buffer);
        using var aes = GetEncryptionAlgorithm();
        using var cryptoStream = new CryptoStream(memoryStream, aes.CreateDecryptor(aes.Key, aes.IV), CryptoStreamMode.Read);
        using var streamReader = new StreamReader(cryptoStream);

        return streamReader.ReadToEnd();
    }

    public async Task<Stream> DecryptAsync(
        Stream encryptedStream,
        CancellationToken cancellationToken = default)
    {
        using var reader = new StreamReader(encryptedStream, Encoding.UTF8, leaveOpen: true);
        var encryptedText = await reader.ReadToEndAsync(cancellationToken);
        var decryptedText = Decrypt(encryptedText);

        return new MemoryStream(Encoding.UTF8.GetBytes(decryptedText));
    }

    private Aes GetEncryptionAlgorithm()
    {
        var key = Encoding.UTF8.GetBytes(options.Key);
        var iv = Encoding.UTF8.GetBytes(options.IV);

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
