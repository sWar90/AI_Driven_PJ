using System.Text;
using AI_Driven_PJ.Application.Common.Interfaces;

namespace AI_Driven_PJ.Infrastructure.Services;

public sealed class Cryptography(IEncryptionService encryptionService) : ICryptography
{
    public string EncryptToBase64(string plainText)
    {
        return encryptionService.Encrypt(plainText);
    }

    public string DecryptFromBase64(string encryptedText)
    {
        return encryptionService.Decrypt(encryptedText);
    }

    public string EncryptToHex(string plainText)
    {
        var base64Text = encryptionService.Encrypt(plainText);
        return Convert.ToHexString(Convert.FromBase64String(base64Text));
    }

    public string DecryptFromHex(string encryptedText)
    {
        var base64Text = Convert.ToBase64String(Convert.FromHexString(encryptedText));
        return encryptionService.Decrypt(base64Text);
    }
}
