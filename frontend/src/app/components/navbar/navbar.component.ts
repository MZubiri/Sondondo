import { Component, Input, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="navbar-wrapper" [class.scrolled]="isScrolled()">
      <div class="container navbar-container">
        <!-- Brand Logo -->
        <a routerLink="/" class="brand-logo">
          <div class="logo-badge">
            <app-icon name="feather" [size]="22" stroke="#FFFFFF"></app-icon>
          </div>
          <div class="brand-text">
            <span class="brand-title">VALLE DEL SONDONDO</span>
            <span class="brand-subtitle">EXPEDITIONS • AYACUCHO</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <a routerLink="/" fragment="tours" class="nav-link">Circuitos</a>
          <a routerLink="/" fragment="experiencia" class="nav-link">El Valle</a>
          <a routerLink="/" fragment="nosotros" class="nav-link">Por Qué Elegirnos</a>
          <a routerLink="/" fragment="testimonios" class="nav-link">Opiniones</a>
          <a routerLink="/" fragment="contacto" class="nav-link">Contacto</a>
        </nav>

        <!-- Action Buttons -->
        <div class="navbar-actions">
          <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
            <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
            <span class="btn-text">WhatsApp</span>
          </a>

          <!-- Mobile Hamburger Toggle -->
          <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Abrir Menú">
            <app-icon [name]="isMenuOpen() ? 'x' : 'menu'" [size]="24" stroke="var(--night-900)"></app-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown Menu -->
      @if (isMenuOpen()) {
        <div class="mobile-menu glass-card">
          <nav class="mobile-nav">
            <a routerLink="/" fragment="tours" (click)="closeMenu()" class="mobile-link">
              <app-icon name="compass" [size]="20"></app-icon> Circuitos & Tours
            </a>
            <a routerLink="/" fragment="experiencia" (click)="closeMenu()" class="mobile-link">
              <app-icon name="feather" [size]="20"></app-icon> El Valle Sagrado
            </a>
            <a routerLink="/" fragment="nosotros" (click)="closeMenu()" class="mobile-link">
              <app-icon name="shield-check" [size]="20"></app-icon> Safe Travels & Quiénes Somos
            </a>
            <a routerLink="/" fragment="testimonios" (click)="closeMenu()" class="mobile-link">
              <app-icon name="star" [size]="20"></app-icon> Testimonios de Viajeros
            </a>
            <a routerLink="/" fragment="contacto" (click)="closeMenu()" class="mobile-link">
              <app-icon name="mail" [size]="20"></app-icon> Contacto & Reservas
            </a>
            <div class="mobile-menu-cta">
              <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon> Consultar por WhatsApp
              </a>
            </div>
          </nav>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      transition: var(--transition-smooth);
      padding: 1rem 0;
      background: rgba(250, 248, 245, 0.7);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .navbar-wrapper.scrolled {
      padding: 0.65rem 0;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 4px 20px rgba(11, 19, 43, 0.08);
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-badge {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(192, 57, 43, 0.3);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--night-900);
      line-height: 1.1;
    }

    .brand-subtitle {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: var(--primary);
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-link {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: 0.92rem;
      color: var(--earth-900);
      position: relative;
      padding: 0.25rem 0;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0%;
      height: 2px;
      background: var(--primary);
      transition: var(--transition-smooth);
      border-radius: 2px;
    }

    .nav-link:hover {
      color: var(--primary);
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-sm {
      padding: 0.5rem 1.1rem;
      font-size: 0.88rem;
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 8px;
    }

    .mobile-menu {
      position: absolute;
      top: 100%;
      left: 1.5rem;
      right: 1.5rem;
      margin-top: 0.5rem;
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mobile-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--night-900);
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--border-light);
    }

    .mobile-menu-cta {
      margin-top: 0.5rem;
    }

    .w-100 {
      width: 100%;
    }

    @media (max-width: 992px) {
      .desktop-nav {
        display: none;
      }
      .mobile-toggle {
        display: block;
      }
      .btn-text {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  @Input() whatsAppNumber: string = '51966380590';
  isScrolled = signal(false);
  isMenuOpen = signal(false);

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola Valle del Sondondo Expeditions! Quisiera consultar sobre los tours disponibles.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 30);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
