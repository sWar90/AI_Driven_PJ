import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptService {
  constructor() { }

  encryptAES_Utf8(plainText: string): string {
    return plainText;
  }

  decryptAES_Utf8(cipherText: string): string {
    return cipherText;
  }

  encryptAES_HEX(plainText: string): string {
    return plainText;
  }

  decryptAES_HEX(cipherText: string): string {
    return cipherText;
  }
}
