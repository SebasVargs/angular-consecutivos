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
  user_name: string;
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
  consecutives: any[] = []
  users: any[] = []

  ngOnInit(): void {
    this.getDocuments()
    this.getConsecutives()
    this.getUsers()
  }

  docsConsecList: DocsConsec[] = [];

  getUsers(): void {
    this.usersService.getUsers().subscribe({
      next: (users) => {
        console.log('USERS', users)
        this.consecutiveService.getConsecutives().subscribe({
          next: (consecutives) => {
            console.log('CONSECUTIVES', consecutives)
            this.documentService.getDocuments().subscribe({
              next: (documents) => {
                console.log('DOCUMENTS', documents)
                this.docsConsecList = consecutives.map((con: any) => {
                  const user = users.find((u: any) => u.id === con.id_user.id);
                  const doc = documents.find((d: any) => d.id_consecutive.id === con.id);
                  console.log('DOC', doc)

                  return {
                    id_consecutive: con.consecutivo_id,
                    date_document: con.date_soli,
                    user_name: user ? user.name : 'Desconocido',
                    source_file: doc ? doc.source_file : 'Sin archivo',
                    id_status_name: con.id_status.name
                  } as DocsConsec;
                });
                console.log("FINAL", this.docsConsecList)
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
        console.log('Consecutives', data)
        this.consecutives = data.map((con: any) => ({
          id: con.consecutivo_id,
          fecha: con.date_soli,
          name: null,
          status: null
        }));
      }
    });
  }

  getDocuments(): void {
    this.statusService.getStatusList().subscribe({
      next: (statusList) => {
        this.documentService.getDocuments().subscribe({
          next: (data) => {
            console.log('DOCUMENTOS', data)
          }
        });
      }
    });
  }
}
