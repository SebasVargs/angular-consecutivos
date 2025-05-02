import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Verificar si el usuario está autenticado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Obtener los roles o permisos requeridos de los datos de la ruta
    const requiredRole = route.data['requiredRole'];
    const requiredPermission = route.data['requiredPermission'];
    const requiredRoleId = route.data['requiredRoleId'];

    // Si se especificó un rol requerido por nombre
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      this.router.navigate(['/acceso-denegado']);
      return false;
    }

    // Si se especificó un rol requerido por ID
    if (requiredRoleId && !this.authService.hasRoleId(requiredRoleId)) {
      this.router.navigate(['/acceso-denegado']);
      return false;
    }

    // Si se especificó un permiso requerido
    if (requiredPermission && !this.authService.hasPermission(requiredPermission)) {
      this.router.navigate(['/acceso-denegado']);
      return false;
    }

    return true;
  }
}
