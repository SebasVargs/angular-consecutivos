import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // Importa el Router
import { AuthService } from '../core/services/auth.service';
import { UsersService } from '../core/services/models/users/users.service';
import { RolService } from '../core/services/models/roles/rol.service';
import { Observable } from 'rxjs';
import { UserSessionService } from '../core/services/login/user-session.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit{
  private authService = inject(AuthService);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private rolService = inject(RolService);
  private userSession = inject(UserSessionService)

  email: string = '';
  token: string = '';
  message: string = '';
  error: string = '';
  requestSent: boolean = false;
  verifyingToken: boolean = false;

  ngOnInit(): void {
    this.getUsers()
  }

  getUsers(): any {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        console.log(data)
      }
    })
  }

  requestAccessCode() {
    this.error = '';
    this.message = '';
    this.requestSent = false;
    this.verifyingToken = false;
    this.authService.requestLoginToken(this.email).subscribe({
      next: (response) => {
        this.message = response.message;
        this.requestSent = true;
      },
      error: (error) => {
        this.error = error.error.message || 'Error al solicitar el código de acceso.';
        this.requestSent = false;
      },
    });
  }

  loginWithToken() {
    this.error = '';
    this.message = '';
    this.verifyingToken = true;
    console.log('Verificando token...');

    this.authService.verifyLoginToken(this.token).subscribe({
      next: (response) => {
        console.log('Token recibido:', response.accessToken);
        localStorage.setItem('access_token', response.accessToken);

        this.usersService.getUsers().subscribe({
          next: (data) => {
            console.log(data)
            const user = data.find((u: any) => u.email === this.email);
            if (user) {
              this.userSession.setUserEmail(user.email)

              if (user.id_rol?.name === 'Administrador') {
                this.router.navigate(['/admin']);
              } else {
                this.router.navigate(['/user']);
              }
            } else {
              this.error = 'Email no encontrado';
              this.verifyingToken = false;
            }
          },
          error: (err) => {
            console.error('Error al obtener los usuarios:', err);
            this.error = 'Error al obtener usuarios.';
            this.verifyingToken = false;
          }
        });
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.error = error.error.message || 'Código de acceso inválido.';
        this.verifyingToken = false;
      },
    });
  }

}
