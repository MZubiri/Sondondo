import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell" [class.hotel-mode]="currentPanel() === 'hotel'">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <!-- BRAND HEADER -->
        <div class="sidebar-brand">
          <a routerLink="/" class="brand-link" title="Ir a la web pública">
            <div class="brand-emblem">VS</div>
            <div class="brand-info">
              <span class="brand-name">Valle del Sondondo</span>
              <span class="brand-sub">
                {{ currentPanel() === 'hotel' ? 'Sistema Hotelero Oficial' : 'Operaciones & Expediciones' }}
              </span>
            </div>
          </a>
        </div>

        <!-- WORKSPACE MODULE SELECTOR -->
        <div class="workspace-switcher">
          <div class="switcher-eyebrow">Espacio Activo</div>
          <div class="switcher-segmented">
            <button 
              type="button" 
              class="switcher-tab" 
              [class.active]="currentPanel() === 'tours'"
              (click)="switchPanel('tours')"
              title="Panel de Expediciones y Circuitos"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Expediciones</span>
            </button>

            <button 
              type="button" 
              class="switcher-tab tab-hotel" 
              [class.active]="currentPanel() === 'hotel'"
              (click)="switchPanel('hotel')"
              title="Panel de Gestión de Hospedaje"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 4v16"></path>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                <path d="M2 17h20"></path>
                <path d="M6 8v9"></path>
              </svg>
              <span>Hospedaje</span>
            </button>
          </div>
        </div>

        <!-- NAVIGATION: TOURS -->
        @if (currentPanel() === 'tours') {
          <nav class="sidebar-nav">
            <div class="nav-section-title">Expediciones</div>

            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-item">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
              </svg>
              <span>Dashboard General</span>
            </a>

            <a routerLink="/admin/tours" routerLinkActive="active" class="nav-item">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Circuitos & Tours</span>
            </a>

            <a routerLink="/admin/reservas" routerLinkActive="active" class="nav-item">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span>Reservas & Cotizaciones</span>
            </a>

            <div class="nav-section-title">Comunicación & Marca</div>

            <a routerLink="/admin/mensajes" routerLinkActive="active" class="nav-item">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Bandeja de Contacto</span>
            </a>

            <a routerLink="/admin/testimonios" routerLinkActive="active" class="nav-item">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Reseñas de Clientes</span>
            </a>

            <a routerLink="/admin/galeria" routerLinkActive="active" class="nav-item">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Banco Multimedia</span>
            </a>
          </nav>
        }

        <!-- NAVIGATION: HOTEL -->
        @if (currentPanel() === 'hotel') {
          <nav class="sidebar-nav hotel-nav">
            <div class="nav-section-title">Hospedaje & Albergue</div>

            <a 
              routerLink="/admin/hospedaje" 
              [queryParams]="{ tab: 'rooms' }"
              class="nav-item"
              [class.active]="hotelSubTab() === 'rooms'"
              (click)="setHotelTab('rooms')"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 4v16"></path>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                <path d="M2 17h20"></path>
                <path d="M6 8v9"></path>
              </svg>
              <span>Habitaciones & Tarifas</span>
            </a>

            <a 
              routerLink="/admin/hospedaje" 
              [queryParams]="{ tab: 'bookings' }"
              class="nav-item"
              [class.active]="hotelSubTab() === 'bookings'"
              (click)="setHotelTab('bookings')"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Reservas de Huéspedes</span>
            </a>

            <a 
              routerLink="/admin/hospedaje" 
              [queryParams]="{ tab: 'profile' }"
              class="nav-item"
              [class.active]="hotelSubTab() === 'profile'"
              (click)="setHotelTab('profile')"
            >
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Perfil & Políticas</span>
            </a>
          </nav>
        }

        <!-- SIDEBAR FOOTER -->
        <div class="sidebar-footer">
          <div class="footer-user-row">
            <div class="footer-user-avatar">
              {{ currentPanel() === 'hotel' ? 'HP' : 'VS' }}
            </div>
            <div class="footer-user-meta">
              <span class="footer-user-name">{{ currentUser()?.fullName || 'Administrador' }}</span>
              <span class="footer-user-role">{{ currentUser()?.username || 'admin@valledelsondondo.com' }}</span>
            </div>
          </div>

          <a routerLink="/" target="_blank" class="btn-sidebar-view-web" title="Ver web pública en pestaña nueva">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Ver Sitio Web</span>
          </a>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="admin-main">
        <!-- TOPBAR -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <div class="topbar-breadcrumb">
              <span class="breadcrumb-root">Valle del Sondondo</span>
              <span class="breadcrumb-sep">/</span>
              <span class="breadcrumb-current">
                {{ currentPanel() === 'hotel' ? 'Hospedaje & Albergues' : 'Expediciones & Circuitos' }}
              </span>
            </div>

            <div class="topbar-status-chip" [class.chip-hotel]="currentPanel() === 'hotel'">
              <span class="status-dot-pulse"></span>
              <span>En Línea</span>
            </div>
          </div>

          <div class="topbar-right">
            <!-- QUICK SWITCHER BUTTON -->
            @if (currentPanel() === 'tours') {
              <button 
                type="button" 
                class="btn-topbar-quick-switch" 
                (click)="switchPanel('hotel')"
                title="Cambiar al Panel de Hospedaje"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
                <span>Módulo Hospedaje</span>
              </button>
            } @else {
              <button 
                type="button" 
                class="btn-topbar-quick-switch" 
                (click)="switchPanel('tours')"
                title="Cambiar al Panel de Tours"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
                <span>Módulo Expediciones</span>
              </button>
            }

            <button class="btn-logout" (click)="onLogout()" title="Cerrar Sesión">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </header>

        <!-- CONTENT OUTLET -->
        <main class="admin-body">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  currentUrl = signal<string>(this.router.url);

  constructor() {
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      this.currentUrl.set(e.urlAfterRedirects || e.url);
    });
  }

  currentPanel = computed<'tours' | 'hotel'>(() => {
    return this.currentUrl().includes('/admin/hospedaje') ? 'hotel' : 'tours';
  });

  hotelSubTab = computed<'rooms' | 'bookings' | 'profile'>(() => {
    const url = this.currentUrl();
    if (url.includes('tab=bookings')) return 'bookings';
    if (url.includes('tab=profile')) return 'profile';
    return 'rooms';
  });

  switchPanel(panel: 'tours' | 'hotel'): void {
    if (panel === 'hotel') {
      this.router.navigate(['/admin/hospedaje'], { queryParams: { tab: 'rooms' } });
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  setHotelTab(tab: 'rooms' | 'bookings' | 'profile'): void {
    this.router.navigate(['/admin/hospedaje'], { queryParams: { tab } });
  }

  onLogout(): void {
    if (confirm('¿Deseas cerrar sesión en el panel de administración?')) {
      this.authService.logout();
    }
  }
}
