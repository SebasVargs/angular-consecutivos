import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private apiUrl: string = 'http://localhost:3000/api';
  private apiKeycloak: string = 'http://localhost:8080'
  private http = inject(HttpClient);

  loginToKeycloakAdmin(): Observable<any> {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`
    };

    return this.http.post(`${this.apiKeycloak}/admin/keycloak-login`, {}, { headers });
  }
}
