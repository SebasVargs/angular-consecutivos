import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/models/documents/document.service';
import { UsersService } from '../../core/services/models/users/users.service';
import { Docs, Documents } from '../../core/models/Documents';

@Component({
  selector: 'app-public',
  imports: [CommonModule, FormsModule],
  templateUrl: './public.component.html',
  styleUrl: './public.component.css'
})
export class PublicComponent implements OnInit {

  private documentService = inject(DocumentService);
  private usersService = inject(UsersService);

  documents: Docs[] = [];
  statusVerifs: any[] = [];
  showModal: boolean = false;
  users: any[] = []

  solicitud: any = {
    date_soli: new Date().toISOString(),
    description: '',
    id_user: '68128cf3e671c3bb1a888ff7',
    id_status: '6812880fb082fd2f5db6696e'
  };

  ngOnInit(): void {
    this.getDocuments();
  }

  getUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => {
      }
    })
  }

  getDocuments(): void {
    this.documentService.getDocuments().subscribe({
      next: (data) => {
        this.documents = data.map((doc: Documents) => ({
          id: doc.id_consecutive,
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
  }

  cerrarModal(): void {
    this.showModal = false;
    this.resetSolicitud();
    //Gg my friend
  }

  enviarSolicitud(): void {
    if (this.solicitud.description) {
      console.log('Solicitud enviada:', this.solicitud);
      // Aquí deberías llamar al servicio para guardar la solicitud
      // this.documentService.createSolicitud(this.solicitud).subscribe(...);
      this.showModal = false;
      this.resetSolicitud();
    }
  }

  resetSolicitud(): void {
    this.solicitud = {
      date_soli: new Date().toISOString(),
      description: '',
      id_user: '68128cf3e671c3bb1a888ff7',
      id_status: '6812880fb082fd2f5db6696e'
    };
  }
}
