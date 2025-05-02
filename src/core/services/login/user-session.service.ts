import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  private readonly EMAIL_KEY = 'user_email';

  // Obtener el email actual desde localStorage
  getUserEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  // Guardar el email (opcional si quieres centralizarlo también aquí)
  setUserEmail(email: string): void {
    localStorage.setItem(this.EMAIL_KEY, email);
  }

  // Eliminar el email (por ejemplo, al cerrar sesión)
  clearUserEmail(): void {
    localStorage.removeItem(this.EMAIL_KEY);
  }

  // Verificar si hay sesión activa
  isLoggedIn(): boolean {
    return this.getUserEmail() !== null;
  }

}
