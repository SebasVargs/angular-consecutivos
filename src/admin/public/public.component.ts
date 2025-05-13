import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/models/documents/document.service';
import { UsersService } from '../../core/services/models/users/users.service';
import { Docs, Documents } from '../../core/models/Documents';
import { UserSessionService } from '../../core/services/login/user-session.service';
import { StatusService } from '../../core/services/models/status/status.service';
import { ConsecutiveService } from '../../core/services/models/consecutives/consecutive.service';

@Component({
  selector: 'app-public',
  imports: [CommonModule, FormsModule],
  templateUrl: './public.component.html',
  styleUrl: './public.component.css'
})
export class PublicComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  private documentService = inject(DocumentService);
  private statusService = inject(StatusService)
  private usersService = inject(UsersService);
  private userSessionService = inject(UserSessionService)
  private consecutiveService = inject(ConsecutiveService)

  documents: any[] = [];
  consecutives: any[] = []
  statusVerifs: any[] = [];
  showModal: boolean = false;
  showUploadModal: boolean = false;
  users: any[] = []
  userActivo: any = null
  estadoPendiente: any = null
  estadoProceso: any = null
  idUser: string = ''
  filterConsecutives: any
  selectedConsecutive: any = null;
  selectedFile: File | null = null;
  updateStatus: string = ''

  solicitud: any = {
    date_soli: new Date().toISOString(),
    description: '',
    id_user: '',
    id_status: ''
  };

  ngOnInit(): void {
    this.getUsers();
    this.getStatuses();
    this.getConsecutives()
  }

  getUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        const email = localStorage.getItem('user_email')
        this.userActivo = this.users.find(u => u.email === email);
        if (this.userActivo) {
          this.idUser = this.userActivo._id || this.userActivo.id;

          this.consecutiveService.getConsecutives().subscribe({
            next: (data) => {
              this.filterConsecutives = data.filter((con: any) => con.id_user.id === this.idUser)
              console.log(this.filterConsecutives)
            }
          })

          console.log('Usuario activo encontrado:', this.userActivo);
          console.log('ID del usuario:', this.idUser);

          this.solicitud.id_user = this.idUser;
        } else {
          console.warn('No se encontró usuario con email:', email);
        }
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
      }
    });
  }

  getStatuses(): void {
    this.statusService.getStatusList().subscribe({
      next: (data) => {
        this.statusVerifs = data;
        this.estadoPendiente = this.statusVerifs.find(s => s.name === 'Pendiente');
        console.log('Despues del find', this.estadoPendiente)
        if (this.estadoPendiente) {
          this.solicitud.id_status = this.estadoPendiente.id;
        }
      }
    });
  }

  getConsecutives(): void {
    this.consecutiveService.getConsecutives().subscribe({
      next: (data) => {
        const email = this.userSessionService.getUserEmail();
        this.userActivo = this.users.find(u => u.email === email);

        if (this.userActivo) {
          const idUsuario = this.userActivo.id;
          const consecutivosUsuario = data.filter((con: any) => con.id_user === idUsuario);

          this.documents = consecutivosUsuario.map((con: any) => ({
            id: con.id,
            fecha: con.date_soli,
            name: con.description,
            status: con.status.name
          }));
        }
      }
    });
  }

  getDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data.map((doc: Documents) => ({
          id: doc.id,
          fecha: new Date(doc.date_charge),
          name: doc.source_file,
          load: this.isFileAvailable(doc.id_consecutive),
          status: this.getVerificationStatus(doc.id_status_verif)
        }));
        console.log(this.documents);
      },
      error: (err) => {
        console.error('Error al obtener los documentos:', err);
      }
    });
  }

  getVerificationStatus(idStatus: string): string {
    const status = this.statusVerifs.find(status => status.id === idStatus);
    return status ? status.name : 'Estado desconocido';
  }

  isFileAvailable(id_consecutive: number): boolean {
    return id_consecutive % 2 === 0;
  }

  // Botones
  descargarDocumento(id: number): void {
    console.log('Descargando documento con ID:', id);
  }

  solicitarConsecutivo(): void {
    this.showModal = true;
    this.solicitud.date_soli = new Date().toISOString(); // Actualiza la fecha al abrir

    // Aseguramos que los IDs estén actualizados al abrir el modal
    if (this.userActivo) {
      this.solicitud.id_user = this.userActivo._id || this.userActivo.id;
    }

    if (this.estadoPendiente) {
      this.solicitud.id_status = this.estadoPendiente.id;
    }
  }

  cerrarModal(): void {
    this.showModal = false;
    this.resetSolicitud();
  }

  enviarSolicitud(): void {
    // Asegurarnos que tenemos el ID del usuario
    if (!this.solicitud.id_user && this.userActivo) {
      // Verificamos qué propiedad contiene el ID
      this.solicitud.id_user = this.userActivo._id || this.userActivo.id;

      // Si aún no tenemos ID y tenemos el valor en idUser, usamos ese
      if (!this.solicitud.id_user && this.idUser) {
        this.solicitud.id_user = this.idUser;
      }
    }

    if (!this.solicitud.id_status && this.estadoPendiente) {
      this.solicitud.id_status = this.estadoPendiente.id;
    }

    console.log('Datos de solicitud antes de enviar:', {
      userActivo: this.userActivo,
      idUser: this.idUser,
      solicitudIdUser: this.solicitud.id_user
    });

    if (this.solicitud.description && this.solicitud.id_user && this.solicitud.id_status) {
      console.log('Solicitud enviada:', this.solicitud);
      this.consecutiveService.createConsecutive(this.solicitud).subscribe({
        next: (response) => {
          console.log('Solicitud creada exitosamente', response);
          this.getConsecutives(); // Actualizar la lista de documentos
        },
        error: (err) => {
          console.error('Error al crear la solicitud', err);
        }
      });
      this.showModal = false;
      this.resetSolicitud();
    } else {
      console.error('Faltan datos en la solicitud', this.solicitud);
      // Opcionalmente puedes mostrar un mensaje de error al usuario
    }
  }

  resetSolicitud(): void {
    // Determinamos el ID del usuario de las fuentes disponibles
    let userId = '';
    if (this.userActivo) {
      userId = this.userActivo._id || this.userActivo.id;
    }
    if (!userId && this.idUser) {
      userId = this.idUser;
    }

    this.solicitud = {
      date_soli: new Date().toISOString(),
      description: '',
      id_user: userId,
      id_status: this.estadoPendiente ? this.estadoPendiente.id : ''
    };
  }

  // Métodos para el modal de carga de archivos
  abrirModalCargar(consecutive: any): void {
    this.selectedConsecutive = consecutive;
    this.selectedFile = null;
    this.showUploadModal = true;
    console.log('Consecutivo seleccionado:', this.selectedConsecutive);

    // Si no tenemos el ObjectId del consecutivo, mostramos un error
    if (!this.selectedConsecutive.id) {
      console.error('El consecutivo no tiene un ObjectId válido');
    }
  }

  cerrarModalCargar(): void {
    this.showUploadModal = false;
    this.selectedConsecutive = null;
    this.selectedFile = null;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Aquí puedes agregar clases CSS para indicar que se puede soltar un archivo
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      console.log('Archivo seleccionado (drop):', this.selectedFile.name);
    }
  }

  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.selectedFile = element.files[0];
      console.log('Archivo seleccionado (input):', this.selectedFile.name);
    }
  }

  subirArchivo(): void {
    if (!this.selectedFile || !this.selectedConsecutive) {
      console.error('Falta archivo o consecutivo seleccionado');
      return;
    }

    console.log("Archivo", this.selectedFile)

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('id_consecutive', this.selectedConsecutive.id);
    formData.append('source_file', this.selectedFile.name);
    formData.append('date_charge', new Date().toISOString());

    console.log("FORM DATA contenido:");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    this.documentService.createDocument(formData).subscribe({
      next: (response) => {
        this.getConsecutives();
        this.getDocuments();
      },
      error: (err) => {
        console.error('Error al subir el documento', err);
      },
      complete: () => {
        this.cerrarModalCargar();
      }
    });

    this.statusService.getStatusList().subscribe({
      next: (data) => {
        this.statusVerifs = data;
        const estadoProceso = this.statusVerifs.find(s => s.name === 'En proceso');

        console.log("STATUS VERIFS", this.statusVerifs)
        console.log("ESTADO PROCESO", estadoProceso)

        if (estadoProceso) {
          const statusId = estadoProceso.id;
          const consecutiveId = this.selectedConsecutive.id;

          console.log("STATUS ID", statusId)
          console.log("CONSECUTIVE ID", consecutiveId)

          this.consecutiveService.updateElement(consecutiveId, statusId).subscribe({
            next: (response) => {
              console.log('Consecutivo actualizado:', response);
              this.getConsecutives();
            },
            error: (err) => {
              console.error('Error al actualizar consecutivo:', err);
            }
          });
        } else {
          console.warn('No se encontró el estado "En proceso"');
        }
      },
      error: (err) => {
        console.error('Error al obtener lista de estados:', err);
      }
    });
  }
}
