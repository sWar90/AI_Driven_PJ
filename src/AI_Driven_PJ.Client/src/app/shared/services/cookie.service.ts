import { Injectable } from '@angular/core';

type SameSite = 'Lax' | 'Strict' | 'None';

interface CookieOptions {
  path?: string;
  secure?: boolean;
  sameSite?: SameSite;
}

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  get(name: string): string {
    const encodedName = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(encodedName));

    return cookie ? decodeURIComponent(cookie.substring(encodedName.length)) : '';
  }

  set(name: string, value: string, options: CookieOptions = {}): void {
    const cookieParts = [
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
      `path=${options.path ?? '/'}`,
      `SameSite=${options.sameSite ?? 'Lax'}`,
    ];

    if (options.secure) {
      cookieParts.push('Secure');
    }

    document.cookie = cookieParts.join('; ');
  }

  delete(name: string, path = '/'): void {
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}
