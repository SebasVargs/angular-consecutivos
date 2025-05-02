import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl: string = 'http://localhost:3000/api/roles';
  private http = inject(HttpClient);

  constructor() { }

  public getRoles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  public getRol(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders(
      token ? { 'Authorization': `Bearer ${token}` } : {}
    );
    return { headers };
  }
}
