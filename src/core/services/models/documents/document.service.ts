import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrlSql + '/documents';

  constructor() {}

  /**
   * Obtiene la lista de todos los documentos
   * @returns Observable con la lista de documentos
   */
  getDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un documento específico por ID
   * @param id ID del documento
   * @returns Observable con el documento
   */
  getDocumentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene un archivo de documento por nombre de archivo
   * @param filename Nombre del archivo a obtener
   * @returns Observable con el blob del archivo
   */
  getDocumentFile(filename: string): Observable<Blob> {
    return this.http.get(`http://localhost:4000/uploads/${filename}`, {
      responseType: 'blob',
      headers: new HttpHeaders({
        'Accept': 'application/pdf,application/octet-stream'
      })
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea un nuevo documento
   * @param documentData Datos del documento
   * @returns Observable con la respuesta
   */
  createDocument(documentData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, documentData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza un documento existente
   * @param id ID del documento
   * @param documentData Datos actualizados
   * @returns Observable con la respuesta
   */
  updateDocument(id: string, documentData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, documentData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina un documento
   * @param id ID del documento a eliminar
   * @returns Observable con la respuesta
   */
  deleteDocument(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Sube un archivo de documento
   * @param file Archivo a subir
   * @param consecutiveId ID del consecutivo asociado
   * @returns Observable con la respuesta
   */
  uploadDocumentFile(file: File, consecutiveId: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_consecutive', consecutiveId);

    return this.http.post<any>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Devuelve la URL base de la API para documentos
   * @returns URL de la API
   */
  getApiEndpoint(): string {
    return this.apiUrl;
  }

  /**
   * Maneja errores HTTP
   * @param error Error HTTP
   * @returns Observable con error
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en DocumentService:', error);

    let errorMessage = 'Error en el servidor';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status) {
      // Error del lado del servidor
      switch (error.status) {
        case 404:
          errorMessage = 'Recurso no encontrado';
          break;
        case 403:
          errorMessage = 'Acceso denegado';
          break;
        case 400:
          errorMessage = 'Solicitud incorrecta';
          break;
        case 500:
          errorMessage = 'Error interno del servidor';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
