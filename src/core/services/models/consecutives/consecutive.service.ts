import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ConsecutiveService {

  private http = inject(HttpClient)

  constructor() { }

  getConsecutives(): Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/consecutives`)
  }

  createConsecutive(consecutivo: any[]): Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/consecutives`, consecutivo)
  }

  updateElement(id: string, newStatusId: string): Observable<any> {
    const body = { id_status: newStatusId };
    return this.http.patch<any>(`${environment.apiUrl}/consecutives/${id}`, body);
  }
}
