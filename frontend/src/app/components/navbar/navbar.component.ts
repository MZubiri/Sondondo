import { Component, Input, HostListener, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { ThemeService, ThemeId } from '../../services/theme.service';
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

        <!-- CTA, Theme Switcher, Language Switcher & Mobile Toggle -->
        <div class="navbar-actions">
          <!-- Interactive Theme Selector (4 Palettes) -->
          <div class="theme-dropdown-container">
            <button 
              type="button" 
              class="theme-toggle-btn" 
              (click)="toggleThemeMenu($event)"
              [title]="ts.t('theme.title')"
              [attr.aria-label]="ts.t('theme.title')">
              <app-icon name="palette" [size]="17" stroke="var(--earth-900)"></app-icon>
              <div class="active-palette-preview">
                @for (c of currentThemeColors(); track c) {
                  <span class="swatch-dot-mini" [style.background-color]="c"></span>
                }
              </div>
            </button>

            <!-- Floating Theme Dropdown -->
            @if (isThemeMenuOpen()) {
              <div class="theme-dropdown-menu" (click)="$event.stopPropagation()">
                <div class="theme-dropdown-header">
                  <span>{{ ts.t('theme.title') }}</span>
                </div>
                <div class="theme-options-list">
                  @for (t of themeService.themes; track t.id) {
                    <button 
                      type="button" 
                      class="theme-option-item" 
                      [class.active]="themeService.currentTheme() === t.id"
                      (click)="selectTheme(t.id)">
                      <div class="theme-swatch-row">
                        @for (c of t.colors; track c) {
                          <span class="swatch-circle" [style.background-color]="c"></span>
                        }
                      </div>
                      <div class="theme-info-col">
                        <span class="theme-name">
                          {{ ts.currentLang() === 'es' ? t.nameEs : t.nameEn }}
                        </span>
                        <small class="theme-desc">
                          {{ ts.currentLang() === 'es' ? t.descriptionEs : t.descriptionEn }}
                        </small>
                      </div>
                      @if (themeService.currentTheme() === t.id) {
                        <span class="theme-check">
                          <app-icon name="check" [size]="16" stroke="var(--accent-clay)"></app-icon>
                        </span>
                      }
                    </button>
                  }
                </div>
              </div>
            }
          </div>

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

            <!-- Mobile Theme Switcher Row -->
            <div class="mobile-theme-section">
              <span class="mobile-theme-label">{{ ts.t('theme.title') }}:</span>
              <div class="mobile-theme-grid">
                @for (t of themeService.themes; track t.id) {
                  <button 
                    type="button" 
                    class="mobile-theme-chip" 
                    [class.active]="themeService.currentTheme() === t.id"
                    (click)="selectTheme(t.id)">
                    <div class="mini-swatch-cluster">
                      @for (c of t.colors; track c) {
                        <span class="chip-swatch" [style.background-color]="c"></span>
                      }
                    </div>
                    <span class="chip-name">
                      {{ ts.currentLang() === 'es' ? t.nameEs.replace(' (Actual)', '') : t.nameEn.replace(' (Default)', '') }}
                    </span>
                  </button>
                }
              </div>
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
      background: var(--nav-bg, rgba(250, 248, 245, 0.95));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-light);
      padding: 0.85rem 0;
      transition: all 0.3s ease;
    }

    .navbar-wrapper.scrolled {
      padding: 0.65rem 0;
      box-shadow: 0 4px 20px rgba(38, 31, 24, 0.08);
      border-bottom-color: transparent;
    }

    .navbar-container {
      width: 100%;
      max-width: 1440px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1.75rem;
      padding-right: 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.25rem;
    }

    .brand-link {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      text-decoration: none;
      flex-shrink: 0;
    }

    .brand-name {
      font-family: var(--font-display);
      font-size: 1.24rem;
      font-weight: 800;
      color: var(--forest-900);
      letter-spacing: -0.02em;
      white-space: nowrap;
    }

    .brand-tag {
      font-size: 0.65rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: var(--accent-clay);
      margin-top: 0.15rem;
      white-space: nowrap;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: clamp(0.75rem, 1.3vw, 1.5rem);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .nav-link {
      font-size: clamp(0.82rem, 0.88vw, 0.92rem);
      font-weight: 500;
      color: var(--earth-800);
      text-decoration: none;
      position: relative;
      padding: 0.35rem 0.2rem;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      line-height: 1.2;
      transition: color 0.2s ease;
    }

    .nav-link:hover {
      color: var(--forest-900);
    }

    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--accent-clay);
      transition: width 0.2s ease;
      border-radius: 2px;
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-shrink: 0;
    }

    /* Theme Switcher Styles */
    .theme-dropdown-container {
      position: relative;
      display: inline-flex;
      align-items: center;
    }

    .theme-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.4rem 0.65rem;
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-full);
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-subtle);
    }

    .theme-toggle-btn:hover {
      border-color: var(--accent-clay);
      background: var(--cream-100);
      transform: translateY(-1px);
    }

    .active-palette-preview {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .swatch-dot-mini {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.12);
    }

    .theme-dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      width: 290px;
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      padding: 0.6rem;
      z-index: 1200;
      animation: dropdownFade 0.2s ease-out;
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .theme-dropdown-header {
      padding: 0.4rem 0.6rem 0.5rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--earth-700);
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 0.4rem;
    }

    .theme-options-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .theme-option-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.65rem;
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: var(--transition);
    }

    .theme-option-item:hover {
      background: var(--cream-100);
      border-color: var(--border-light);
    }

    .theme-option-item.active {
      background: var(--forest-50);
      border-color: var(--accent-clay);
    }

    .theme-swatch-row {
      display: flex;
      gap: 3px;
      flex-shrink: 0;
    }

    .swatch-circle {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.15);
    }

    .theme-info-col {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .theme-name {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--earth-950);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .theme-desc {
      font-size: 0.7rem;
      color: var(--earth-700);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .theme-check {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* Language Switcher Button */
    .lang-toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.4rem 0.75rem;
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--earth-900);
      cursor: pointer;
      transition: var(--transition);
      box-shadow: var(--shadow-subtle);
    }

    .lang-toggle-btn:hover {
      border-color: var(--accent-clay);
      background: var(--cream-100);
      transform: translateY(-1px);
    }

    .lang-flag {
      font-size: 1rem;
      line-height: 1;
    }

    .lang-options {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      letter-spacing: 0.04em;
    }

    .lang-sep {
      color: var(--earth-300);
      font-size: 0.75rem;
    }

    .active-lang {
      color: var(--accent-clay);
      font-weight: 800;
    }

    .navbar-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.84rem;
      padding: 0.4rem 0.9rem;
      min-height: 36px;
      white-space: nowrap;
      border-radius: var(--radius-full);
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      padding: 0.4rem;
      cursor: pointer;
    }

    .mobile-drawer {
      background: var(--cream-50);
      border-bottom: 1px solid var(--border-light);
      padding: 1.5rem;
      animation: slideDown 0.25s ease-out;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .mobile-lang-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-light);
    }

    .mobile-lang-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--earth-700);
    }

    .mobile-theme-section {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--border-light);
    }

    .mobile-theme-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--earth-700);
    }

    .mobile-theme-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }

    .mobile-theme-chip {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.5rem 0.6rem;
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      cursor: pointer;
      text-align: left;
      transition: var(--transition);
    }

    .mobile-theme-chip.active {
      border-color: var(--accent-clay);
      background: var(--forest-50);
    }

    .mini-swatch-cluster {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }

    .chip-swatch {
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }

    .chip-name {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--earth-900);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .mobile-link {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--earth-900);
      text-decoration: none;
      padding: 0.35rem 0;
      border-bottom: 1px solid rgba(0,0,0,0.03);
    }

    .mobile-cta-wrap {
      margin-top: 0.5rem;
    }

    .w-100 {
      width: 100%;
    }

    @media (max-width: 1140px) {
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
  public themeService = inject(ThemeService);

  @Input() whatsAppNumber: string = '51966380590';
  isScrolled = signal(false);
  isMenuOpen = signal(false);
  isThemeMenuOpen = signal(false);

  currentThemeColors = computed(() => this.themeService.getCurrentThemeOption().colors);

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola! Deseo consultar información sobre los recorridos guiados.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 25);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isThemeMenuOpen()) {
      const target = event.target as HTMLElement;
      if (!target.closest('.theme-dropdown-container')) {
        this.isThemeMenuOpen.set(false);
      }
    }
  }

  toggleThemeMenu(event: Event): void {
    event.stopPropagation();
    this.isThemeMenuOpen.update(v => !v);
  }

  selectTheme(themeId: ThemeId): void {
    this.themeService.setTheme(themeId);
    this.isThemeMenuOpen.set(false);
  }

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
