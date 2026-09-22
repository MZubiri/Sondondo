import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="hero-section" id="hero">
      <div class="hero-overlay"></div>

      <div class="container hero-container">
        <div class="hero-content">
          <span class="hero-kicker">{{ ts.t('hero.kicker') }}</span>

          <h1 class="hero-title">
            {{ ts.t('hero.title') }}
          </h1>

          <p class="hero-description">
            {{ ts.t('hero.description') }}
          </p>

          <div class="hero-actions">
            <a 
              [href]="whatsAppUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn btn-whatsapp hero-btn-main">
              <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
              <span>{{ ts.t('hero.ctaWhatsApp') }}</span>
            </a>

            <a href="#tours" class="btn btn-outline-light hero-btn-sub">
              <app-icon name="compass" [size]="18" stroke="#FFFFFF"></app-icon>
              <span>{{ ts.t('hero.ctaTours') }}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      min-height: 84vh;
      display: flex;
      align-items: center;
      padding-top: 8rem;
      padding-bottom: 5rem;
      background: #1B2B20 url('/assets/images/hero_sondondo.jpg') center 40% / cover no-repeat;
      color: #FFFFFF;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: var(--hero-overlay);
      pointer-events: none;
      transition: background 0.4s ease;
    }

    .hero-container {
      position: relative;
      z-index: 2;
    }

    .hero-content {
      max-width: 780px;
    }

    .hero-kicker {
      display: inline-block;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--hero-kicker-color, #E2CEB8);
      margin-bottom: 1.25rem;
      transition: color 0.3s ease;
    }

    .hero-title {
      font-size: 3.4rem;
      font-weight: 700;
      line-height: 1.15;
      color: #FFFFFF;
      margin-bottom: 1.35rem;
      letter-spacing: -0.025em;
    }

    .hero-description {
      font-size: 1.18rem;
      line-height: 1.7;
      color: #EDE8DE;
      margin-bottom: 2.5rem;
      max-width: 680px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }

    .hero-btn-main {
      padding: 0.85rem 2rem;
      font-size: 1.02rem;
    }

    .hero-btn-sub {
      padding: 0.85rem 1.8rem;
      font-size: 1rem;
    }

    @media (max-width: 992px) {
      .hero-title {
        font-size: 2.6rem;
      }
      .hero-description {
        font-size: 1.05rem;
      }
    }

    @media (max-width: 600px) {
      .hero-section {
        min-height: auto;
        padding-top: 6.5rem;
        padding-bottom: 4rem;
      }
      .hero-title {
        font-size: 2rem;
        line-height: 1.2;
      }
      .hero-description {
        font-size: 0.98rem;
        margin-bottom: 1.8rem;
      }
      .hero-actions {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }
      .hero-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class HeroComponent {
  public ts = inject(TranslationService);
  @Input() whatsAppNumber: string = '51966380590';

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola! Me comunico desde la web para consultar información sobre las expediciones y recorridos guiados.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }
}
