import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  private readonly EMAIL_KEY = 'user_email';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getUserEmail(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.EMAIL_KEY);
    }
    return null;
  }

  setUserEmail(email: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.EMAIL_KEY, email);
    }
  }

  clearUserEmail(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.EMAIL_KEY);
    }
  }

  isLoggedIn(): boolean {
    return this.getUserEmail() !== null;
  }

}
