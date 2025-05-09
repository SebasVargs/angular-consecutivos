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
    return this.http.get<any>(`${environment.apiUrlSql}/consecutives`)
  }

  createConsecutive(consecutivo: any[]): Observable<any>{
    return this.http.post<any>(`${environment.apiUrlSql}/consecutives`, consecutivo)
  }

  updateElement(id: string, newStatusId: string): Observable<any> {
    const body = { id_status: newStatusId };
    return this.http.patch<any>(`${environment.apiUrlSql}/consecutives/${id}`, body);
  }
}
