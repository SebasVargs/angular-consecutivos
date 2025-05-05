import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  private http = inject(HttpClient)

  constructor() { }

  getStatusList(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/status`);
  }

  updateItem(id: string | number, statusData: any): Observable<any>{
    return this.http.patch<any>(`${environment.apiUrl}/status/${id}`, statusData)
  }

}
