import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../../core/services/models/users/users.service';
import { Rol } from '../../../core/models/Rol';
import { User } from '../../../core/models/User';
import { RolService } from '../../../core/services/models/roles/rol.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  roles: Rol[] = [];
  users: User[] = []
  showModal: boolean = false

  newUser: any = {
    name: '',
    email: '',
    id_rol: ''
  };

  private usersService = inject(UsersService);
  private rolService = inject(RolService);

  ngOnInit(): void {
    this.loadRoles();
    this.getUsers();
  }

  loadRoles() {
    this.rolService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
      }
    });
  }

  getUsers() {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      }
    });
  }

  crearUsuario(): void {
    this.showModal = true;
  }

  submitUser(): void {
    if (this.newUser.name && this.newUser.email && this.newUser.id_rol) {
      console.log(this.newUser)
      this.usersService.createUser(this.newUser).subscribe({
        next: () => {
          this.getUsers(); // Recargar usuarios
          this.showModal = false;
          this.newUser = { name: '', email: '', id_rol: '' }; // Limpiar formulario
        }
      });
    }
  }

  cerrarModal(): void {
    this.showModal = false;
  }
}
