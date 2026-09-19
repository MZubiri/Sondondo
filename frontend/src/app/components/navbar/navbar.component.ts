import { Component, Input, HostListener, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <header class="navbar-wrapper" [class.scrolled]="isScrolled()">
      <div class="container navbar-container">
        <!-- Brand -->
        <a routerLink="/" class="brand-link">
          <span class="brand-name">{{ ts.t('nav.brandTitle') }}</span>
          <span class="brand-tag">{{ ts.t('nav.brandTag') }}</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="desktop-nav">
          <a routerLink="/" fragment="tours" class="nav-link">{{ ts.t('nav.tours') }}</a>
          <a routerLink="/" fragment="experiencia" class="nav-link">{{ ts.t('nav.destination') }}</a>
          <a routerLink="/" fragment="habitaciones" class="nav-link">{{ ts.t('nav.rooms') }}</a>
          <a routerLink="/" fragment="conectividad" class="nav-link">{{ ts.t('nav.connectivity') }}</a>
          <a routerLink="/" fragment="nosotros" class="nav-link">{{ ts.t('nav.whyUs') }}</a>
          <a routerLink="/" fragment="contacto" class="nav-link">{{ ts.t('nav.contact') }}</a>
        </nav>

        <!-- CTA, Language Switcher & Mobile Toggle -->
        <div class="navbar-actions">
          <!-- Interactive Language Switcher (ES | EN) -->
          <button 
            type="button" 
            class="lang-toggle-btn" 
            (click)="ts.toggleLang()"
            [title]="ts.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'"
            [attr.aria-label]="ts.currentLang() === 'es' ? 'Switch to English' : 'Cambiar a Español'">
            <span class="lang-flag">{{ ts.currentLang() === 'es' ? '🇵🇪' : '🇺🇸' }}</span>
            <span class="lang-options">
              <span [class.active-lang]="ts.currentLang() === 'es'">ES</span>
              <span class="lang-sep">/</span>
              <span [class.active-lang]="ts.currentLang() === 'en'">EN</span>
            </span>
          </button>

          <a 
            [href]="whatsAppUrl" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-whatsapp btn-sm navbar-cta">
            <app-icon name="whatsapp" [size]="17" stroke="#FFFFFF"></app-icon>
            <span>{{ ts.t('nav.whatsapp') }}</span>
          </a>

          <button 
            type="button" 
            class="mobile-toggle" 
            (click)="toggleMenu()" 
            [attr.aria-label]="ts.t('nav.menuOpen')">
            <app-icon [name]="isMenuOpen() ? 'x' : 'menu'" [size]="22" stroke="var(--earth-900)"></app-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Dropdown -->
      @if (isMenuOpen()) {
        <div class="mobile-drawer">
          <nav class="mobile-nav">
            <!-- Mobile Language Switcher Row -->
            <div class="mobile-lang-row">
              <span class="mobile-lang-label">Idioma / Language:</span>
              <button 
                type="button" 
                class="lang-toggle-btn mobile-lang-btn" 
                (click)="ts.toggleLang()">
                <span class="lang-flag">{{ ts.currentLang() === 'es' ? '🇵🇪' : '🇺🇸' }}</span>
                <span class="lang-options">
                  <span [class.active-lang]="ts.currentLang() === 'es'">Español</span>
                  <span class="lang-sep">|</span>
                  <span [class.active-lang]="ts.currentLang() === 'en'">English</span>
                </span>
              </button>
            </div>

            <a routerLink="/" fragment="tours" (click)="closeMenu()" class="mobile-link">
              {{ ts.t('nav.tours') }}
            </a>
            <a routerLink="/" fragment="experiencia" (click)="closeMenu()" class="mobile-link">
              {{ ts.t('nav.destination') }}
            </a>
            <a routerLink="/" fragment="habitaciones" (click)="closeMenu()" class="mobile-link">
              {{ ts.t('nav.rooms') }}
            </a>
            <a routerLink="/" fragment="conectividad" (click)="closeMenu()" class="mobile-link">
              {{ ts.t('nav.connectivity') }}
            </a>
            <a routerLink="/" fragment="nosotros" (click)="closeMenu()" class="mobile-link">
              {{ ts.t('nav.whyUs') }}
            </a>
            <a routerLink="/" fragment="contacto" (click)="closeMenu()" class="mobile-link">
              {{ ts.t('nav.contact') }}
            </a>
            <div class="mobile-cta-wrap">
              <a 
                [href]="whatsAppUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('hero.ctaWhatsApp') }}</span>
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
      background: rgba(250, 248, 245, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-light);
      padding: 1.1rem 0;
      transition: var(--transition);
    }

    .navbar-wrapper.scrolled {
      padding: 0.75rem 0;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 2px 10px rgba(38, 31, 24, 0.05);
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-link {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: var(--font-display);
      font-size: 1.12rem;
      font-weight: 700;
      color: var(--earth-950);
      letter-spacing: -0.015em;
      line-height: 1.15;
    }

    .brand-tag {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--forest-900);
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 2.2rem;
    }

    .nav-link {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--earth-800);
      position: relative;
      padding: 0.2rem 0;
    }

    .nav-link:hover {
      color: var(--forest-900);
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Language Switcher */
    .lang-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: 999px;
      padding: 0.38rem 0.75rem;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--earth-800);
      box-shadow: 0 1px 4px rgba(38, 31, 24, 0.05);
      transition: var(--transition);
    }

    .lang-toggle-btn:hover {
      border-color: var(--forest-800);
      box-shadow: 0 2px 8px rgba(38, 31, 24, 0.1);
      transform: translateY(-1px);
    }

    .lang-flag {
      font-size: 1rem;
      line-height: 1;
    }

    .lang-options {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .lang-sep {
      color: var(--earth-400);
      font-weight: 400;
    }

    .active-lang {
      color: var(--forest-900);
      font-weight: 800;
      border-bottom: 2px solid var(--forest-900);
    }

    .btn-sm {
      padding: 0.45rem 1.15rem;
      font-size: 0.88rem;
      min-height: 40px;
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xs);
      padding: 0.5rem;
      cursor: pointer;
      color: var(--earth-900);
    }

    .mobile-drawer {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #FFFFFF;
      border-bottom: 1px solid var(--border-light);
      padding: 1.5rem;
      box-shadow: var(--shadow-card);
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .mobile-lang-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px dashed var(--border-light);
      margin-bottom: 0.4rem;
    }

    .mobile-lang-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--earth-600);
    }

    .mobile-lang-btn {
      padding: 0.45rem 0.95rem;
    }

    .mobile-link {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--earth-900);
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--border-light);
    }

    .mobile-cta-wrap {
      margin-top: 0.5rem;
    }

    .w-100 {
      width: 100%;
    }

    @media (max-width: 920px) {
      .desktop-nav {
        display: none;
      }
      .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  `]
})
export class NavbarComponent {
  public ts = inject(TranslationService);
  @Input() whatsAppNumber: string = '51966380590';
  isScrolled = signal(false);
  isMenuOpen = signal(false);

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola! Deseo consultar información sobre los recorridos guiados.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 25);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
