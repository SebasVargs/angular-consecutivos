import { environment } from './../../../../../environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private http = inject(HttpClient)
  private doc = environment.apiRoutes.documents.base

  constructor() { }

  getDocuments(): Observable<any>{
    return this.http.get<any>(`${environment.apiUrl}/${this.doc}`).pipe(
      catchError((err) => {
        console.error('Error fetching document', err)
        return throwError(() => new Error('Error fetching documents'))
      })
    )
  }

  createDocument(document: any): Observable<any>{
    return this.http.post<any>(`${environment.apiUrl}/${this.doc}`, document).pipe(
      catchError((err) => {
        console.error('Error create document', err)
        return throwError(() => new Error('Error create document'))
      })
    )
  }

  deleteDocumentById(id: number): Observable<any>{
    return this.http.delete<any>(`${environment.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error(`Error delete document with id: ${id}`)
        return throwError(() => new Error('Error delete document by id'))
      })
    )
  }
}
