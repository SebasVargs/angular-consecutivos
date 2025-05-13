import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DocumentDownloaderService {
  private http = inject(HttpClient);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Descarga un documento y lo guarda con el nombre proporcionado
   * @param url URL del documento a descargar
   * @param filename Nombre del archivo a guardar
   * @returns Observable que completa cuando la descarga está lista
   */
  downloadDocument(url: string, filename: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      tap(blob => {
        if (isPlatformBrowser(this.platformId)) {
          this.saveFile(blob, filename);
        }
      }),
      catchError(error => {
        console.error('Error al descargar el documento:', error);
        return throwError(() => new Error(
          `Error al descargar el documento: ${error.status === 404 ?
            'Archivo no encontrado' : 'Error en el servidor'}`
        ));
      })
    );
  }

  /**
   * Guarda un blob como archivo en el navegador
   * @param blob El blob a guardar
   * @param filename Nombre del archivo
   */
  private saveFile(blob: Blob, filename: string): void {
    if (blob.size === 0) {
      throw new Error('El archivo está vacío');
    }

    // Crear URL del objeto y enlace de descarga
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Agregar temporalmente al DOM, hacer clic y limpiar
    document.body.appendChild(a);
    a.click();

    // Limpiar recursos
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}
