import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-shell">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
        <div class="sidebar-brand">
          <a routerLink="/" class="brand-link" title="Ir a la web pública">
            <span class="brand-badge">Ayacucho, Perú</span>
            <span class="brand-name">Valle del Sondondo</span>
            <span class="brand-sub">Panel de Administración</span>
          </a>
        </div>

        <nav class="sidebar-nav">
          <a 
            routerLink="/admin/dashboard" 
            routerLinkActive="active" 
            class="nav-item"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Dashboard</span>
          </a>

          <a 
            routerLink="/admin/reservas" 
            routerLinkActive="active" 
            class="nav-item"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Reservas & Cotizaciones</span>
          </a>

          <a 
            routerLink="/admin/tours" 
            routerLinkActive="active" 
            class="nav-item"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Gestión de Tours</span>
          </a>

          <a 
            routerLink="/admin/mensajes" 
            routerLinkActive="active" 
            class="nav-item"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Mensajes de Contacto</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" target="_blank" class="footer-btn view-web">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            <span>Ver Web Pública</span>
          </a>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="admin-main">
        <!-- TOPBAR -->
        <header class="admin-topbar">
          <div class="topbar-left">
            <span class="portal-tag">Sistema Administrativo Oficial</span>
          </div>

          <div class="topbar-right">
            <div class="user-info">
              <div class="user-avatar">AD</div>
              <div class="user-details">
                <span class="user-name">{{ currentUser()?.fullName || 'Administrador' }}</span>
                <span class="user-role">{{ currentUser()?.username || 'admin@valledelsondondo.com' }}</span>
              </div>
            </div>

            <button class="btn-logout" (click)="onLogout()" title="Cerrar Sesión">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
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
  `,
  styles: [`
    .admin-shell {
      display: flex;
      min-height: 100vh;
      background: #090f13;
      color: #f1f5f9;
      font-family: inherit;
    }

    /* SIDEBAR */
    .admin-sidebar {
      width: 260px;
      background: #0e171e;
      border-right: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .sidebar-brand {
      padding: 1.5rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .brand-link {
      display: flex;
      flex-direction: column;
      text-decoration: none;
    }

    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #e09f3e;
      margin-bottom: 0.25rem;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .brand-sub {
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.15rem;
    }

    .sidebar-nav {
      padding: 1.25rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.04);
    }

    .nav-item.active {
      color: #ffffff;
      background: #c85a32;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.07);
    }

    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.65rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .footer-btn:hover {
      background: rgba(224, 159, 62, 0.15);
      border-color: #e09f3e;
      color: #e09f3e;
    }

    /* MAIN CONTAINER */
    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-topbar {
      height: 64px;
      background: #0e171e;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
    }

    .portal-tag {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 500;
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #e09f3e;
      color: #0b1216;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .user-role {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #f87171;
      border-radius: 6px;
      padding: 0.45rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .admin-body {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    @media (max-width: 900px) {
      .admin-shell {
        flex-direction: column;
      }
      .admin-sidebar {
        width: 100%;
      }
      .admin-body {
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  onLogout(): void {
    if (confirm('¿Deseas cerrar sesión en el panel de administración?')) {
      this.authService.logout();
    }
  }
}
