namespace AI_Driven_PJ.Application.Common.Interfaces;

public interface ICryptography
{
    string EncryptToBase64(string plainText);

    string DecryptFromBase64(string encryptedText);

    string EncryptToHex(string plainText);

    string DecryptFromHex(string encryptedText);
}
