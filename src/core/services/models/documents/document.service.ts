import { environment } from './../../../../../environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private http = inject(HttpClient)
  private doc = environment.apiRoutes.documents.base

  constructor() { }

  getDocuments(): Observable<any>{
    return this.http.get<any>(`${environment.apiUrlSql}/${this.doc}`).pipe(
      catchError((err) => {
        console.error('Error fetching document', err)
        return throwError(() => new Error('Error fetching documents'))
      })
    )
  }

  createDocument(document: any): Observable<any>{
    return this.http.post<any>(`${environment.apiUrlSql}/${this.doc}`, document).pipe(
      catchError((err) => {
        console.error('Error create document', err)
        return throwError(() => new Error('Error create document'))
      })
    )
  }

  deleteDocumentById(id: number): Observable<any>{
    return this.http.delete<any>(`${environment.apiUrlSql}/${id}`).pipe(
      catchError((err) => {
        console.error(`Error delete document with id: ${id}`)
        return throwError(() => new Error('Error delete document by id'))
      })
    )
  }

  getDocumentFile(fileName: any): Observable<Blob> {
    console.log(`Solicitando archivo: ${fileName}`);

    // Construir URL correcta para la API
    const fileUrl = `${environment.apiUrlSql}/documents/file/${encodeURIComponent(fileName)}`;
    console.log(`URL completa: ${fileUrl}`);

    // Configurar para recibir un blob binario
    return this.http.get(fileUrl, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      catchError((err) => {
        console.error(`Error obteniendo archivo ${fileName}:`, err);
        return throwError(() => new Error(`Error obteniendo archivo: ${err.message}`));
      })
    ).pipe(
      map((response: any) => {
        console.log('Respuesta recibida:', response);
        return response.body;
      })
    );
  }
}
