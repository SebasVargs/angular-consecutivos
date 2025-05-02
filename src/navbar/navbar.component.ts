import { KeycloakService } from './../core/services/keycloak.service';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { SafeStorageService } from '../core/services/safe-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);
  private safeStorage = inject(SafeStorageService);

  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  userInfo: any = null;
  showLogoutModal: boolean = false;

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    const token = this.safeStorage.getItem('access_token');
    this.isLoggedIn = !!token;

    if (this.isLoggedIn) {
      this.loadUserInfo();
    }
  }

  loadUserInfo(): void {
    const email = localStorage.getItem('user_email');

    this.authService.getUserInfo().subscribe({
      next: (users) => {
        const user = users.find((u: any) => u.email === email);

        if (user) {
          this.userInfo = user.name;
          this.isAdmin = user.id_rol?.name?.includes('Administrador') || false;
        } else {
          console.warn('Usuario no encontrado con el email:', email);
          this.userInfo = 'Usuario';
          this.isAdmin = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar información del usuario:', err);
        this.handleAuthError();
      }
    });
  }


  handleAuthError(): void {
    this.safeStorage.removeItem('access_token');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.safeStorage.removeItem('access_token');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.userInfo = null;
    this.router.navigate(['/login']);
  }

  confirmLogout(): void {
    this.logout();
    this.showLogoutModal = false;
  }
}
