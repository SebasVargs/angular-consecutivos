// documents.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DocumentService } from '../../../core/services/models/documents/document.service';
import { UsersService } from '../../../core/services/models/users/users.service';
import { ConsecutiveService } from '../../../core/services/models/consecutives/consecutive.service';
import { StatusService } from '../../../core/services/models/status/status.service';
import { forkJoin } from 'rxjs';

// Interfaces definidas fuera del componente para mejor legibilidad
interface DocsConsec {
  id_consecutive: string | number;
  date_document: string;
  user_name: string;
  source_file: string;
  id_status_name: string;
  id_status: string | number;
  is_editing: boolean;
  consecutiveDbId?: string;
}

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  id_rol: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  keycloakId: string;
}

interface DocumentDetail {
  _id: string;
  source_file: string;
  date_charge: string;
  id_consecutive: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsecutiveDetail {
  _id: string;
  date_soli: string;
  description: string;
  id_user: any;
  status_name: any;
  createdAt: string;
  updatedAt: string;
  consecutivo_id?: string;
}

interface StatusItem {
  id: string | number;
  name: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxExtendedPdfViewerModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit {
  // Servicios inyectados
  private documentService = inject(DocumentService);
  private usersService = inject(UsersService);
  private statusService = inject(StatusService);
  private consecutiveService = inject(ConsecutiveService);

  // Datos principales
  docsConsecList: DocsConsec[] = [];
  users: any[] = [];
  documents: any[] = [];
  consecutives: any[] = [];
  status: StatusItem[] = [];

  // Estado del modal
  showModal = false;
  isLoading = false;
  errorMessage: string | null = null;
  isEditingModalStatus = false;
  tempStatusId: string | number | null = null;

  // PDF Viewer
  pdfSrc: string | null = null;
  isPdfLoading = false;
  showPdfViewer = false;
  pdfErrorMessage: string | null = null;

  // Selecciones actuales
  selectedConsecutiveId: string | number | null = null;
  selectedUser: UserDetail | null = null;
  selectedDocument: DocumentDetail | null = null;
  selectedConsecutive: ConsecutiveDetail | null = null;
  documentToView: string | null = null;

  ngOnInit(): void {
    this.loadAllData();
  }

  // Método principal para cargar todos los datos
  loadAllData(): void {
    this.isLoading = true;

    forkJoin({
      users: this.usersService.getUsers(),
      documents: this.documentService.getDocuments(),
      consecutives: this.consecutiveService.getConsecutives(),
      status: this.statusService.getStatusList()
    }).subscribe({
      next: (results) => {
        // Procesar los datos obtenidos
        this.users = results.users;
        this.documents = results.documents;
        this.consecutives = this.processConsecutives(results.consecutives);
        this.status = this.processStatus(results.status);

        // Construir la lista principal
        this.docsConsecList = this.buildDocsConsecList(
          results.consecutives,
          results.users,
          results.documents
        );

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando datos:', error);
        this.errorMessage = 'Error cargando los datos. Intente nuevamente.';
        this.isLoading = false;
      }
    });
  }

  // Procesar los consecutivos crudos desde la API
  private processConsecutives(data: any[]): any[] {
    return data.map(con => ({
      id: con.id,
      fecha: con.date_soli,
      description: con.description,
      id_status: con.status.id,
      id_user: con.id_user,
      status_name: con.status.name
    }));
  }

  // Procesar los estados crudos desde la API
  private processStatus(data: any[]): StatusItem[] {
    return data.map(s => ({
      id: s.id,
      name: s.name
    }));
  }

  // Construir la lista principal para la tabla
  private buildDocsConsecList(consecutives: any[], users: any[], documents: any[]): DocsConsec[] {
    return consecutives.map(con => {
      const user = users.find(u => u.id === con.id_user);
      const doc = documents.find(d => d.id_consecutive === con.id);

      return {
        id_consecutive: con.id,
        date_document: con.date_soli,
        user_name: user ? user.name : 'Desconocido',
        source_file: doc ? doc.source_file : 'Sin archivo',
        id_status_name: con.status.name,
        id_status: con.status.id,
        is_editing: false,
        consecutiveDbId: con.id
      };
    });
  }

  // ======= GESTIÓN DE VISTA DE DOCUMENTOS =======

  verDocumento(doc: DocsConsec): void {
    if (doc.source_file !== 'Sin archivo') {
      this.documentToView = doc.source_file;
      this.selectedConsecutiveId = doc.id_consecutive;
      this.openModal();
    }
  }

  visualizarDocumento(): void {
    if (!this.selectedDocument?.source_file) {
      this.pdfErrorMessage = 'No hay documento disponible para visualizar';
      return;
    }

    this.isPdfLoading = true;
    this.pdfErrorMessage = null;
    this.showPdfViewer = true;

    const filename = this.selectedDocument.source_file.split('/').pop() || '';

    this.documentService.getDocumentFile(filename).subscribe({
      next: (pdfData: Blob) => {
        if (pdfData.size === 0) {
          this.pdfErrorMessage = 'El archivo PDF está vacío';
          this.isPdfLoading = false;
          return;
        }

        if (!pdfData.type.includes('pdf')) {
          console.warn('El tipo de archivo no es PDF:', pdfData.type);
        }

        // Limpiar URL anterior si existe
        if (this.pdfSrc) {
          URL.revokeObjectURL(this.pdfSrc);
        }

        this.pdfSrc = URL.createObjectURL(pdfData);
        this.isPdfLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar el PDF:', err);
        this.pdfErrorMessage = `Error al cargar el PDF: ${err.status === 404 ? 'Archivo no encontrado' : 'Error en el servidor'}`;
        this.isPdfLoading = false;
      }
    });
  }

  downloadDocument(): void {
    if (!this.selectedDocument?.source_file) {
      this.errorMessage = 'No hay documento disponible para descargar';
      return;
    }

    const filename = this.selectedDocument.source_file.split('/').pop() || 'documento.pdf';

    this.documentService.getDocumentFile(filename).subscribe({
      next: (pdfData: Blob) => {
        if (pdfData.size === 0) {
          this.errorMessage = 'El archivo PDF está vacío';
          return;
        }

        const url = window.URL.createObjectURL(pdfData);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Limpiar recursos
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: any) => {
        this.errorMessage = `Error al descargar el documento: ${err.status === 404 ? 'Archivo no encontrado' : 'Error en el servidor'}`;
      }
    });
  }

  closePdfViewer(): void {
    if (this.pdfSrc) {
      URL.revokeObjectURL(this.pdfSrc);
      this.pdfSrc = null;
    }
    this.showPdfViewer = false;
    this.pdfErrorMessage = null;
  }

  // ======= GESTIÓN DEL MODAL =======

  openModal(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.showModal = true;
    this.isEditingModalStatus = false;
    this.showPdfViewer = false;
    this.loadDetailedInformation();
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedConsecutiveId = null;
    this.selectedUser = null;
    this.selectedDocument = null;
    this.selectedConsecutive = null;
    this.isEditingModalStatus = false;
    this.tempStatusId = null;
    this.closePdfViewer();
  }

  loadDetailedInformation(): void {
    if (!this.selectedConsecutiveId) {
      this.isLoading = false;
      return;
    }

    const consecutiveFound = this.findConsecutive(this.selectedConsecutiveId);

    if (consecutiveFound) {
      this.selectedConsecutive = this.mapToConsecutiveDetail(consecutiveFound);
      this.tempStatusId = consecutiveFound.id_status;

      // Cargar usuario relacionado
      if (consecutiveFound.id_user) {
        this.selectedUser = this.findAndMapUser(consecutiveFound.id_user);
      }

      // Cargar documento relacionado
      this.selectedDocument = this.findAndMapDocument(consecutiveFound.id);
    }

    this.isLoading = false;
  }

  private findConsecutive(id: string | number): any {
    return this.consecutives.find(c =>
      c.consecutivo_id === id || c.id === id);
  }

  private mapToConsecutiveDetail(consecutive: any): ConsecutiveDetail {
    return {
      _id: consecutive.id,
      date_soli: consecutive.fecha || '',
      description: consecutive.description || '',
      id_user: consecutive.id_user || null,
      status_name: consecutive.status_name || null,
      createdAt: consecutive.createdAt || '',
      updatedAt: consecutive.updatedAt || ''
    };
  }

  private findAndMapUser(userId: any): UserDetail | null {
    const id = typeof userId === 'object' ? userId.id || userId._id : userId;

    const userFound = this.users.find(u => u._id === id || u.id === id);

    if (!userFound) return null;

    return {
      _id: userFound._id || userFound.id || '',
      name: userFound.name || '',
      email: userFound.email || '',
      id_rol: userFound.id_rol || null,
      metadata: userFound.metadata || null,
      createdAt: userFound.createdAt || '',
      updatedAt: userFound.updatedAt || '',
      keycloakId: userFound.keycloakId || ''
    };
  }

  private findAndMapDocument(consecutiveId: string | number): DocumentDetail | null {
    const docFound = this.documents.find(d =>
      (d.id && this.isDocumentRelatedToConsecutive(d, consecutiveId))
    );

    if (!docFound) return null;

    return {
      _id: docFound._id || docFound.id || '',
      source_file: docFound.source_file || '',
      date_charge: docFound.date_charge || '',
      id_consecutive: this.extractConsecutiveId(docFound.id_consecutive),
      createdAt: docFound.createdAt || '',
      updatedAt: docFound.updatedAt || ''
    };
  }

  private isDocumentRelatedToConsecutive(doc: any, consecutiveId: string | number): boolean {
    const docConsecutiveId = typeof doc.id_consecutive === 'object'
      ? doc.id_consecutive.id || doc.id_consecutive._id
      : doc.id_consecutive;

    return docConsecutiveId === consecutiveId;
  }

  private extractConsecutiveId(idConsecutive: any): string {
    return typeof idConsecutive === 'object'
      ? idConsecutive.id || idConsecutive._id || ''
      : idConsecutive || '';
  }

  // ======= EDICIÓN DE ESTADO =======

  startEditingModalStatus(): void {
    this.isEditingModalStatus = true;

    if (this.selectedConsecutive) {
      const consecutive = this.findConsecutive(this.selectedConsecutive._id);
      if (consecutive) {
        this.tempStatusId = consecutive.id_status;
      }
    }
  }

  cancelEditingModalStatus(): void {
    this.isEditingModalStatus = false;
    this.tempStatusId = null;
  }

  saveModalStatus(): void {
    if (this.tempStatusId === null || !this.selectedConsecutive) {
      this.errorMessage = 'No se ha seleccionado un nuevo estado o no hay consecutivo seleccionado';
      return;
    }

    const consecutiveId = this.selectedConsecutive._id;

    this.consecutiveService.updateElement(consecutiveId, this.tempStatusId.toString()).subscribe({
      next: () => {
        // Actualizar el estado en el modal
        const selectedStatus = this.status.find(s => s.id === this.tempStatusId);
        if (selectedStatus && this.selectedConsecutive) {
          this.selectedConsecutive.status_name = selectedStatus.name;
        }

        // Actualizar en la tabla
        const updatedDoc = this.docsConsecList.find(doc =>
          doc.id_consecutive === this.selectedConsecutiveId);

        if (updatedDoc && selectedStatus) {
          updatedDoc.id_status_name = selectedStatus.name;
          updatedDoc.id_status = this.tempStatusId as string | number;
        }

        this.isEditingModalStatus = false;

        // Refrescar los datos
        this.loadAllData();
      },
      error: (error) => {
        console.error('Error al actualizar el estado:', error);
        this.errorMessage = 'Error al actualizar el estado. Intente nuevamente.';
      }
    });
  }

  // ======= UTILIDADES =======

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
