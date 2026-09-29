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
            @if (currentPanel() === 'hotel') {
              <span class="brand-badge badge-hotel">🏨 Sistema Hotelero Oficial</span>
              <span class="brand-name">Hospedaje & Albergues</span>
              <span class="brand-sub">Casa Grande · Punto Clave</span>
            } @else {
              <span class="brand-badge">⛰️ Operador Turístico Oficial</span>
              <span class="brand-name">Valle del Sondondo</span>
              <span class="brand-sub">Panel de Expediciones & Circuitos</span>
            }
          </a>
        </div>

        <!-- MODULE SELECTOR (PANEL SWITCHER) -->
        <div class="panel-selector-wrap">
          <div class="selector-label">MÓDULO DE GESTIÓN ACTIVO:</div>
          <div class="selector-tabs">
            <button 
              type="button" 
              class="selector-tab-btn" 
              [class.active]="currentPanel() === 'tours'"
              (click)="switchPanel('tours')"
              title="Panel de Expediciones y Circuitos Turísticos"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Panel Tours</span>
            </button>

            <button 
              type="button" 
              class="selector-tab-btn btn-hotel-tab" 
              [class.active]="currentPanel() === 'hotel'"
              (click)="switchPanel('hotel')"
              title="Panel de Gestión de Hospedaje y Habitaciones"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 4v16"></path>
                <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                <path d="M2 17h20"></path>
                <path d="M6 8v9"></path>
              </svg>
              <span>Panel Hospedaje</span>
            </button>
          </div>
        </div>

        <!-- NAVIGATION: TOURS PANEL -->
        @if (currentPanel() === 'tours') {
          <nav class="sidebar-nav">
            <div class="nav-section-title">OPERACIONES DE EXPEDICIONES</div>

            <a 
              routerLink="/admin/dashboard" 
              routerLinkActive="active" 
              class="nav-item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Dashboard de Tours</span>
            </a>

            <a 
              routerLink="/admin/tours" 
              routerLinkActive="active" 
              class="nav-item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Gestión de Tours</span>
            </a>

            <a 
              routerLink="/admin/reservas" 
              routerLinkActive="active" 
              class="nav-item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Reservas & Cotizaciones</span>
            </a>

            <div class="nav-section-title">COMUNICACIÓN & CONTENIDO</div>

            <a 
              routerLink="/admin/mensajes" 
              routerLinkActive="active" 
              class="nav-item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Mensajes de Contacto</span>
            </a>

            <a 
              routerLink="/admin/testimonios" 
              routerLinkActive="active" 
              class="nav-item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>Testimonios & Reseñas</span>
            </a>

            <a 
              routerLink="/admin/galeria" 
              routerLinkActive="active" 
              class="nav-item"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span>Galería Multimedia</span>
            </a>

            <!-- QUICK JUMP TO HOTEL PANEL -->
            <div class="module-jump-card hotel-jump-card">
              <div class="jump-badge">Módulo Independiente</div>
              <strong class="jump-title">Panel de Hospedaje</strong>
              <p class="jump-desc">Gestiona habitaciones, tarifas por noche y reservas hoteleras.</p>
              <button type="button" class="btn-jump-action" (click)="switchPanel('hotel')">
                <span>Ir al Panel de Hospedaje</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </nav>
        }

        <!-- NAVIGATION: HOTEL PANEL -->
        @if (currentPanel() === 'hotel') {
          <nav class="sidebar-nav hotel-nav">
            <div class="nav-section-title text-gold">GESTIÓN DE ALOJAMIENTO</div>

            <a 
              routerLink="/admin/hospedaje" 
              [queryParams]="{ tab: 'rooms' }"
              class="nav-item nav-hotel-item"
              [class.active]="hotelSubTab() === 'rooms'"
              (click)="setHotelTab('rooms')"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
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
              class="nav-item nav-hotel-item"
              [class.active]="hotelSubTab() === 'bookings'"
              (click)="setHotelTab('bookings')"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
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
              class="nav-item nav-hotel-item"
              [class.active]="hotelSubTab() === 'profile'"
              (click)="setHotelTab('profile')"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>Perfil del Hotel & Políticas</span>
            </a>

            <!-- QUICK JUMP TO TOURS PANEL -->
            <div class="module-jump-card tours-jump-card">
              <div class="jump-badge badge-tours">Módulo Principal</div>
              <strong class="jump-title">Panel de Tours</strong>
              <p class="jump-desc">Administra circuitos turísticos, cotizaciones y manifiestos de viajeros.</p>
              <button type="button" class="btn-jump-action btn-jump-tours" (click)="switchPanel('tours')">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                <span>Volver a Panel Tours</span>
              </button>
            </div>
          </nav>
        }

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
            <div class="panel-indicator" [class.indicator-hotel]="currentPanel() === 'hotel'">
              <span class="pulse-dot"></span>
              <span class="indicator-title">
                {{ currentPanel() === 'hotel' ? '🏨 Panel de Hospedaje & Albergues' : '⛰️ Panel de Tours & Expediciones' }}
              </span>
            </div>

            <!-- QUICK DUAL-SWITCHER -->
            <div class="topbar-toggle-group">
              <button 
                type="button" 
                class="topbar-tab-btn" 
                [class.active]="currentPanel() === 'tours'"
                (click)="switchPanel('tours')"
                title="Cambiar al Panel de Tours">
                <span>⛰️ Tours</span>
              </button>
              <button 
                type="button" 
                class="topbar-tab-btn tab-btn-hotel" 
                [class.active]="currentPanel() === 'hotel'"
                (click)="switchPanel('hotel')"
                title="Cambiar al Panel de Hospedaje">
                <span>🏨 Hospedaje</span>
              </button>
            </div>
          </div>

          <div class="topbar-right">
            <div class="user-info">
              <div class="user-avatar" [class.avatar-hotel]="currentPanel() === 'hotel'">
                {{ currentPanel() === 'hotel' ? 'HP' : 'AD' }}
              </div>
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
      transition: background 0.3s ease;
    }

    /* SIDEBAR */
    .admin-sidebar {
      width: 275px;
      background: #0e171e;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }

    .admin-shell.hotel-mode .admin-sidebar {
      background: #0d161a;
      border-right-color: rgba(224, 159, 62, 0.2);
    }

    .sidebar-brand {
      padding: 1.35rem 1.25rem 1.1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .brand-link {
      display: flex;
      flex-direction: column;
      text-decoration: none;
    }

    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #c85a32;
      margin-bottom: 0.25rem;
    }

    .brand-badge.badge-hotel {
      color: #e09f3e;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .brand-sub {
      font-size: 0.73rem;
      color: #94a3b8;
      margin-top: 0.15rem;
    }

    /* PANEL SELECTOR (SEGMENTED SWITCHER) */
    .panel-selector-wrap {
      padding: 1rem 0.85rem 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }

    .selector-label {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 0.5rem;
      padding-left: 0.25rem;
    }

    .selector-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem;
      background: rgba(15, 23, 42, 0.7);
      padding: 0.25rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .selector-tab-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.55rem 0.45rem;
      border-radius: 6px;
      border: 1px solid transparent;
      background: transparent;
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .selector-tab-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }

    .selector-tab-btn.active {
      background: #c85a32;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(200, 90, 50, 0.35);
    }

    .selector-tab-btn.btn-hotel-tab.active {
      background: linear-gradient(135deg, #d97706, #b45309);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35);
    }

    /* SIDEBAR NAVIGATION */
    .sidebar-nav {
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
      overflow-y: auto;
    }

    .nav-section-title {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
      padding: 0.75rem 0.85rem 0.35rem;
    }

    .nav-section-title.text-gold {
      color: #e09f3e;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.7rem 0.95rem;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-item.active {
      color: #ffffff;
      background: #c85a32;
      box-shadow: 0 2px 8px rgba(200, 90, 50, 0.3);
    }

    .nav-hotel-item.active {
      background: linear-gradient(135deg, #d97706, #b45309) !important;
      color: #ffffff !important;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35);
    }

    /* JUMP CARDS (SEPARATE MODULE NOTICE) */
    .module-jump-card {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
    }

    .hotel-jump-card {
      border-color: rgba(224, 159, 62, 0.25);
      background: rgba(224, 159, 62, 0.04);
    }

    .tours-jump-card {
      border-color: rgba(200, 90, 50, 0.25);
      background: rgba(200, 90, 50, 0.04);
    }

    .jump-badge {
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #e09f3e;
    }

    .jump-badge.badge-tours {
      color: #c85a32;
    }

    .jump-title {
      font-size: 0.92rem;
      color: #f8fafc;
      font-weight: 700;
    }

    .jump-desc {
      font-size: 0.75rem;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0;
    }

    .btn-jump-action {
      margin-top: 0.4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.55rem 0.75rem;
      border-radius: 6px;
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid #e09f3e;
      color: #fcd34d;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-jump-action:hover {
      background: #e09f3e;
      color: #111827;
    }

    .btn-jump-tours {
      background: rgba(200, 90, 50, 0.15);
      border-color: #c85a32;
      color: #fdba74;
    }

    .btn-jump-tours:hover {
      background: #c85a32;
      color: #ffffff;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      transition: all 0.3s ease;
    }

    .admin-shell.hotel-mode .admin-topbar {
      border-bottom-color: rgba(224, 159, 62, 0.2);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .panel-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 0.75rem;
      background: rgba(200, 90, 50, 0.15);
      border: 1px solid rgba(200, 90, 50, 0.3);
      border-radius: 9999px;
      color: #fdba74;
      font-size: 0.82rem;
      font-weight: 700;
    }

    .panel-indicator.indicator-hotel {
      background: rgba(217, 119, 6, 0.15);
      border-color: rgba(217, 119, 6, 0.35);
      color: #fcd34d;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c85a32;
      box-shadow: 0 0 8px #c85a32;
    }

    .indicator-hotel .pulse-dot {
      background: #e09f3e;
      box-shadow: 0 0 8px #e09f3e;
    }

    .topbar-toggle-group {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: rgba(0, 0, 0, 0.35);
      padding: 0.2rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .topbar-tab-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .topbar-tab-btn:hover {
      color: #f8fafc;
    }

    .topbar-tab-btn.active {
      background: #c85a32;
      color: #ffffff;
    }

    .topbar-tab-btn.tab-btn-hotel.active {
      background: #d97706;
      color: #ffffff;
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
      background: #c85a32;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
    }

    .user-avatar.avatar-hotel {
      background: #d97706;
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
      .admin-topbar {
        padding: 0 1rem;
      }
      .topbar-left {
        gap: 0.5rem;
      }
      .admin-body {
        padding: 1rem;
      }
    }
  `]
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
