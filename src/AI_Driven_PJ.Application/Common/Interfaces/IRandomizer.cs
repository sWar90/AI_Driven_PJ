namespace AI_Driven_PJ.Application.Common.Interfaces;

public interface IRandomizer
{
    string RandomAlphabet(int length);

    string RandomAlphabet(int length, string dateFormat);

    string RandomAlphabet(int length, string assignCode, string dateFormat);

    string RandomAlphanumeric(int length);

    string RandomAlphanumeric(int length, string dateFormat);

    string RandomAlphanumeric(int length, string assignCode, string dateFormat);
}
