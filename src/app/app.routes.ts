import { Routes } from '@angular/router';
import { PublicComponent } from '../admin/public/public.component';
import { PrivateComponent } from '../admin/private/private.component';
import { LoginComponent } from '../login/login.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/rol.guard';
import { UsersComponent } from '../admin/private/users/users.component';
import { DocumentsComponent } from '../admin/private/documents/documents.component';
import { AccesoDenegadoComponent } from '../shared/acceso-denegado/acceso-denegado.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'user',
    component: PublicComponent,
    canActivate: []
  },
  {
    path: 'admin',
    component: PrivateComponent,
    canActivate: [],
    data: { requiredRole: 'Administrador' },
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'documents', component: DocumentsComponent }
    ]
  },
  { path: 'acceso-denegado', component: AccesoDenegadoComponent },
  { path: '**', redirectTo: '/login' }
];

