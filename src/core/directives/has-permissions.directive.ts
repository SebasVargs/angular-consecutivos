import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  @Input('appHasPermission') permission!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Verificar permisos inicialmente
    this.updateView();

    // Escuchar cambios en el usuario actual
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (this.authService.hasPermission(this.permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit, OnDestroy {
  @Input('appHasRole') role!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Verificar rol inicialmente
    this.updateView();

    // Escuchar cambios en el usuario actual
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateView());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (this.authService.hasRole(this.role)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
