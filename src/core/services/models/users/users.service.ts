import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { User } from '../../../models/User';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private http = inject(HttpClient)
  private user = environment.apiRoutes.users.base

  constructor() { }

  public getUsers(): Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/${this.user}`)
  }

  public createUser(user: User): Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.user}`, user)
  }
}
