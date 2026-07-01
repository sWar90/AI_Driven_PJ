namespace AI_Driven_PJ.Application.Common.Interfaces;

public interface IEncryptionService
{
    string Encrypt(string plainText);

    string Decrypt(string encryptedText);

    Task<Stream> DecryptAsync(Stream encryptedStream, CancellationToken cancellationToken = default);
}
