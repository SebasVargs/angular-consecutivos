import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface TokenResponse {
  accessToken: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl: string = 'http://localhost:3000/api/users';
  private http = inject(HttpClient);

  // BehaviorSubject para gestionar el usuario actual
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser = this.currentUserSubject.asObservable();

  // Variable para verificar si estamos en el navegador
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Cargar el usuario desde localStorage solo si estamos en un navegador
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    }
  }

  // Métodos para manipular localStorage de manera segura
  private getLocalStorage(key: string): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setLocalStorage(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  private removeLocalStorage(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }

  // Función para crear opciones de solicitud con headers
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getLocalStorage('access_token');
    const headers = new HttpHeaders(
      token ? { 'Authorization': `Bearer ${token}` } : {}
    );
    return { headers };
  }

  // Métodos existentes con modificaciones para compatibilidad SSR
  requestLoginToken(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/request-token`, { email });
  }

  verifyLoginToken(token: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.apiUrl}/login/verify-token`, { token }).pipe(
      tap((response) => {
        console.log('Soy el token', response)
        if (response && response.accessToken) {
          this.setLocalStorage('access_token', response.accessToken);
          this.loadUserInfo();
        }
      })
    );
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, this.getAuthHeaders()).pipe(
      tap(user => {
        console.log('Soy usuarios', user)
        if (user) {
          this.setLocalStorage('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  loadUserInfo(): void {
    this.getUserInfo().subscribe({
      next: (user) => {
        console.log('Loaded user info:', user)
        if (user && user.rol && user.rol.id) {
          this.loadUserRole(user.rol, user);
        } else {
          console.error('User or user.rol.id is missing', user)
        }
      },
      error: (error) => console.error('Error loading user info:', error)
    });
  }

  loadUserRole(rolId: string, user: any): void {
    this.http.get<any>(`http://localhost:3000/api/roles/${rolId}`, this.getAuthHeaders()).subscribe({
      next: (role) => {
        console.log('Loaded user role:', role);
        user.rolDetails = role;
        this.setLocalStorage('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      },
      error: (error) => console.error('Error loading user role:', error)
    });
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  logout(): void {
    this.removeLocalStorage('access_token');
    this.removeLocalStorage('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getLocalStorage('access_token');
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user || !user.rolDetails) return false;
    return user.rolDetails.name === roleName;
  }

  // Verificar si el usuario tiene un rol específico por ID
  hasRoleId(roleId: string): boolean {
    const user = this.currentUserSubject.value;
    return user && user.rol === roleId;
  }

  // Verificar si el usuario tiene un permiso específico
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user &&
           user.rolDetails &&
           user.rolDetails.permissions &&
           user.rolDetails.permissions.includes(permission);
  }
}
