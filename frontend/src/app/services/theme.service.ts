import { Injectable, signal, effect } from '@angular/core';

export type ThemeId = 'editorial' | 'aire-libre' | 'nitido-dramatico' | 'fresco-energico';

export interface ThemeOption {
  id: ThemeId;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  colors: string[]; // 4 color swatches
}

const STORAGE_KEY = 'sondondo_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly themes: ThemeOption[] = [
    {
      id: 'editorial',
      nameEs: 'Valle del Sondondo (Actual)',
      nameEn: 'Sondondo Valley (Default)',
      descriptionEs: 'Tierra, arcilla andina y verde bosque profundo',
      descriptionEn: 'Earthy tones, Andean clay and deep forest green',
      colors: ['#1B3527', '#261F18', '#C85A32', '#FAF8F5']
    },
    {
      id: 'aire-libre',
      nameEs: 'Aire Libre y Natural (06)',
      nameEn: 'Outdoor & Natural (06)',
      descriptionEs: 'Verde bosque, pasto fresco, lima y tierra húmeda',
      descriptionEn: 'Forest green, fresh grass, lime and rich earth',
      colors: ['#2E4600', '#486B00', '#A2C523', '#7D4427']
    },
    {
      id: 'nitido-dramatico',
      nameEs: 'Nítido y Dramático (04)',
      nameEn: 'Crisp & Dramatic (04)',
      descriptionEs: 'Nube tormentosa, cascada, musgo andino y prado',
      descriptionEn: 'Thunder cloud, waterfall blue, moss and meadow',
      colors: ['#505160', '#68829E', '#AEBD38', '#598234']
    },
    {
      id: 'fresco-energico',
      nameEs: 'Fresco y Enérgico (11)',
      nameEn: 'Fresh & Energetic (11)',
      descriptionEs: 'Cielo azul, granito andino, pino y campos dorados',
      descriptionEn: 'Sky blue, granite grey, mountain pine and fields',
      colors: ['#34675C', '#4CB5F5', '#B7B8B6', '#B3C100']
    }
  ];

  currentTheme = signal<ThemeId>(this.getInitialTheme());

  constructor() {
    // Apply theme on root element immediately
    this.applyThemeToDom(this.currentTheme());

    // React to signal updates
    effect(() => {
      const theme = this.currentTheme();
      this.applyThemeToDom(theme);
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // Ignore localStorage errors
      }
    });
  }

  setTheme(themeId: ThemeId): void {
    if (this.themes.some(t => t.id === themeId)) {
      this.currentTheme.set(themeId);
    }
  }

  getCurrentThemeOption(): ThemeOption {
    return this.themes.find(t => t.id === this.currentTheme()) || this.themes[0];
  }

  private getInitialTheme(): ThemeId {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId;
      if (saved && this.themes.some(t => t.id === saved)) {
        return saved;
      }
    } catch {
      // Fallback if localStorage is disabled
    }
    return 'editorial';
  }

  private applyThemeToDom(theme: ThemeId): void {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
    }
  }
}
