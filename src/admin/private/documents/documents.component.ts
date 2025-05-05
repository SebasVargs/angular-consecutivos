import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/models/documents/document.service';
import { UsersService } from '../../../core/services/models/users/users.service';
import { ConsecutiveService } from '../../../core/services/models/consecutives/consecutive.service';
import { StatusService } from '../../../core/services/models/status/status.service';

interface DocsConsec {
  id_consecutive: string | number;
  date_document: string;
  user_name: string;
  source_file: string;
  id_status_name: string;
  id_status: string | number;
  is_editing: boolean;
  consecutiveDbId?: string; // ID real del consecutivo
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
  id_status: any;
  createdAt: string;
  updatedAt: string;
  consecutivo_id: string;
}

@Component({
  selector: 'app-documents',
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent {
  private documentService = inject(DocumentService);
  private usersService = inject(UsersService)
  private statusService = inject(StatusService)
  private consecutiveService = inject(ConsecutiveService)
  documents: any[] = [];
  statusVerifs: any[] = [];
  consecutives: any[] = [];
  status: any[] = []
  users: any[] = []
  showModal: boolean = false;

  selectedConsecutiveId: string | number | null = null;
  selectedUser: UserDetail | null = null;
  selectedDocument: DocumentDetail | null = null;
  selectedConsecutive: ConsecutiveDetail | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  // Variables para edición en el modal
  isEditingModalStatus: boolean = false;
  tempStatusId: string | number | null = null;

  ngOnInit(): void {
    this.getDocuments();
    this.getConsecutives();
    this.getUsers();
    this.getStatus();
  }

  docsConsecList: DocsConsec[] = [];
  documentToView: string | null = null;

  getUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.consecutiveService.getConsecutives().subscribe({
          next: (consecutives) => {
            this.documentService.getDocuments().subscribe({
              next: (documents) => {
                this.docsConsecList = consecutives.map((con: any) => {
                  const user = users.find((u: any) => u.id === con.id_user.id);
                  const doc = documents.find((d: any) => d.id_consecutive.id === con.id);
                  return {
                    id_consecutive: con.consecutivo_id,
                    date_document: con.date_soli,
                    user_name: user ? user.name : 'Desconocido',
                    source_file: doc ? doc.source_file : 'Sin archivo',
                    id_status_name: con.id_status.name,
                    id_status: con.id_status.id,
                    is_editing: false,
                    consecutiveDbId: con.id // Guardamos el ID de la base de datos para la actualización
                  } as DocsConsec;
                });
              }
            });
          }
        });
      }
    });
  }

  getConsecutives(): void {
    this.consecutiveService.getConsecutives().subscribe({
      next: (data) => {
        console.log('CONSECUTIVES', data);
        this.consecutives = data.map((con: any) => ({
          id: con.id, // ID real en la base de datos
          consecutivo_id: con.consecutivo_id, // Número o código visible
          fecha: con.date_soli,
          description: con.description,
          id_status: con.id_status.id,
          id_user: con.id_user.id,
          status_name: con.id_status.name
        }));
      }
    });
  }

  getStatus(): void {
    this.statusService.getStatusList().subscribe({
      next: (data) => {
        this.status = data.map((s: any) => ({
          id: s.id,
          name: s.name
        }));
        console.log('Status cargados', this.status);
      }
    });
  }

  getDocuments(): void {
    this.statusService.getStatusList().subscribe({
      next: (statusList) => {
        this.documentService.getDocuments().subscribe({
          next: (data) => {
            this.documents = data;
          }
        });
      }
    });
  }

  verDocumento(doc: DocsConsec): void {
    if (doc.source_file !== 'Sin archivo') {
      this.documentToView = doc.source_file;
      this.selectedConsecutiveId = doc.id_consecutive;
      this.openModal();
    }
  }

  openModal(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.showModal = true;
    this.isEditingModalStatus = false; // Reseteamos el estado de edición al abrir el modal

    // Buscar información detallada para el modal
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
  }

  loadDetailedInformation(): void {
    console.log('Obteniendo consecutivos', this.consecutives);
    const consecutiveFound = this.consecutives.find((c: any) =>
      c.consecutivo_id === this.selectedConsecutiveId ||
      c.id === this.selectedConsecutiveId
    );

    if (consecutiveFound) {
      // Convertir a ConsecutiveDetail
      this.selectedConsecutive = {
        _id: consecutiveFound.id,
        consecutivo_id: consecutiveFound.consecutivo_id || '',
        date_soli: consecutiveFound.fecha || '',
        description: consecutiveFound.description || '',
        id_user: consecutiveFound.id_user || null,
        id_status: consecutiveFound.status_name || null,
        createdAt: consecutiveFound.createdAt || '',
        updatedAt: consecutiveFound.updatedAt || ''
      } as ConsecutiveDetail;

      // Guardamos el ID de estado actual para la edición
      this.tempStatusId = consecutiveFound.id_status;

      // Obtener detalles del usuario asociado
      if (consecutiveFound.id_user) {
        console.log('USUARIO ASOCIADO', consecutiveFound.id_user);
        const userId = typeof consecutiveFound.id_user === 'object' ?
          consecutiveFound.id_user.id || consecutiveFound.id_user._id :
          consecutiveFound.id_user;

        const userFound = this.users.find((u: any) =>
          u._id === userId || u.id === userId
        );

        if (userFound) {
          // Convertir a UserDetail
          this.selectedUser = {
            _id: userFound._id || userFound.id || '',
            name: userFound.name || '',
            email: userFound.email || '',
            id_rol: userFound.id_rol || null,
            metadata: userFound.metadata || null,
            createdAt: userFound.createdAt || '',
            updatedAt: userFound.updatedAt || '',
            keycloakId: userFound.keycloakId || ''
          } as UserDetail;
        }
      }

      console.log('DOCUMENTS', this.documents);
      console.log('CONSECUTIVE FILTER', consecutiveFound);
      const docFound = this.documents.find((d: any) =>
      (d.id_consecutive._id && (
        d.id_consecutive._id === consecutiveFound.id ||
        d.id_consecutive.id === consecutiveFound.id ||
        d.id_consecutive === consecutiveFound.id ||
        (typeof d.id_consecutive === 'object' &&
          (d.id_consecutive.id === consecutiveFound.id ||
            d.id_consecutive._id === consecutiveFound.id))
      ))
      );

      if (docFound) {
        // Convertir a DocumentDetail
        this.selectedDocument = {
          _id: docFound._id || docFound.id || '',
          source_file: docFound.source_file || '',
          date_charge: docFound.date_charge || '',
          id_consecutive: typeof docFound.id_consecutive === 'object' ?
            docFound.id_consecutive.id || docFound.id_consecutive._id :
            docFound.id_consecutive || '',
          createdAt: docFound.createdAt || '',
          updatedAt: docFound.updatedAt || ''
        } as DocumentDetail;
      }
    }

    this.isLoading = false;
  }

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

  downloadDocument() { }

  // Métodos para edición en el modal
  startEditingModalStatus(): void {
    this.isEditingModalStatus = true;

    // Buscar el consecutivo actual para obtener su ID de estado
    const consecutive = this.consecutives.find((c: any) =>
      c.consecutivo_id === this.selectedConsecutiveId ||
      c.id === this.selectedConsecutive?._id
    );

    if (consecutive) {
      this.tempStatusId = consecutive.id_status;
    }

    console.log('Iniciando edición en modal para estado:', this.tempStatusId);
  }

  cancelEditingModalStatus(): void {
    this.isEditingModalStatus = false;
    this.tempStatusId = null;
  }

  saveModalStatus(): void {
    if (this.tempStatusId === null || !this.selectedConsecutive) {
      console.error('No se ha seleccionado un nuevo estado o no hay consecutivo seleccionado');
      return;
    }

    const consecutiveId = this.selectedConsecutive._id;

    console.log(`Actualizando consecutivo ID: ${consecutiveId} con nuevo estado: ${this.tempStatusId}`);

    // Llamar al servicio con el ID correcto y el nuevo estado
    this.consecutiveService.updateElement(consecutiveId, this.tempStatusId.toString()).subscribe({
      next: (response) => {
        console.log('Estado actualizado con éxito:', response);

        // Actualizar la interfaz del modal
        const selectedStatus = this.status.find(s => s.id === this.tempStatusId);
        if (selectedStatus && this.selectedConsecutive) {
          this.selectedConsecutive.id_status = selectedStatus.name;
        }

        // Actualizar también la fila correspondiente en la tabla
        const updatedDoc = this.docsConsecList.find(doc =>
          doc.id_consecutive === this.selectedConsecutiveId);

        if (updatedDoc && selectedStatus) {
          updatedDoc.id_status_name = selectedStatus.name;
          updatedDoc.id_status = this.tempStatusId as string | number;
        }

        this.isEditingModalStatus = false;

        // Refrescar datos
        this.getConsecutives();
      },
      error: (error: any) => {
        console.error('Error al actualizar el estado:', error);
        this.errorMessage = 'Error al actualizar el estado. Intente nuevamente.';
      }
    });
  }
}
