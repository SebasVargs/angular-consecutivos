import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../core/services/models/documents/document.service';
import { UsersService } from '../../../core/services/models/users/users.service';
import { Docs, Documents } from '../../../core/models/Documents';
import { ConsecutiveService } from '../../../core/services/models/consecutives/consecutive.service';
import { StatusService } from '../../../core/services/models/status/status.service';

interface DocsConsec {
  id_consecutive: string | number;
  date_document: string;
  source_file: string;
  id_status_name: string;
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
  documents: DocsConsec[] = [];
  statusVerifs: any[] = [];

  ngOnInit(): void {
    this.getDocuments()
    this.getConsecutives()
  }

  getConsecutives(): void {
    this.consecutiveService.getConsecutives().subscribe({
      next: (data) => {
        console.log('Consecutives', data)
      }
    })
  }

  getDocuments(): void {
    this.statusService.getStatusList().subscribe({
      next: (statusList) => {
        this.documentService.getDocuments().subscribe({
          next: (data) => {
            // Asignar IDs consecutivos a los documentos
            this.documents = data.map((doc: any) => {
              console.log('Soy el doc', doc)
              const consecutive = doc.id_consecutive.consecutivo_id || {};
              const status = consecutive.id_status || '';
              const foundStatus = statusList.find((s: any) => s.id === status);
              const name_status = foundStatus ? foundStatus.name : 'Estado desconocido';

              return {
                id_consecutive: consecutive, // Genera ID consecutivos a partir de 1
                date_document: doc.date_charge || 'N/A',
                source_file: doc.source_file || 'N/A',
                id_status_name: name_status
              } as DocsConsec;
            });

            console.log('Documentos procesados:', this.documents);
          }
        });
      }
    });
  }



}
