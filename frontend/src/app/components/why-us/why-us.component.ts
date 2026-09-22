import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="why-us-section" id="nosotros">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-tag">{{ ts.t('why.badge') }}</span>
          <h2 class="section-title">{{ ts.t('why.title') }}</h2>
          <p class="section-subtitle">
            {{ ts.t('why.subtitle') }}
          </p>
        </div>

        <!-- 3 Authentic Arguments with Subtle Dividers -->
        <div class="arguments-list">
          <div class="argument-item">
            <div class="arg-header">
              <div class="arg-icon">
                <app-icon name="compass" [size]="20" stroke="var(--forest-900)"></app-icon>
              </div>
              <h3 class="arg-title">{{ ts.t('why.point1Title') }}</h3>
            </div>
            <p class="arg-desc">
              {{ ts.t('why.point1Desc') }}
            </p>
          </div>

          <div class="argument-item">
            <div class="arg-header">
              <div class="arg-icon">
                <app-icon name="feather" [size]="20" stroke="var(--accent-clay)"></app-icon>
              </div>
              <h3 class="arg-title">{{ ts.t('why.point2Title') }}</h3>
            </div>
            <p class="arg-desc">
              {{ ts.t('why.point2Desc') }}
            </p>
          </div>

          <div class="argument-item">
            <div class="arg-header">
              <div class="arg-icon">
                <app-icon name="shield-check" [size]="20" stroke="var(--forest-900)"></app-icon>
              </div>
              <h3 class="arg-title">{{ ts.t('why.point3Title') }}</h3>
            </div>
            <p class="arg-desc">
              {{ ts.t('why.point3Desc') }}
            </p>
          </div>
        </div>

        <!-- Ethical Travel Philosophy Banner -->
        <div class="philosophy-strip">
          <div class="philosophy-content">
            <p class="philosophy-quote">
              “Caminamos con veneración por la Pachamama y los Apus protectores. Promovemos el respeto a nuestras comunidades campesinas y la conservación milenaria de los andenes vivos.”
            </p>
            <span class="philosophy-author">Comunidad de Guías Locales • Valle del Sondondo, Ayacucho, Perú</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .why-us-section {
      padding: 6rem 0;
      background: var(--cream-100);
      border-bottom: 1px solid var(--border-light);
    }

    .arguments-list {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 3rem;
      margin-bottom: 4rem;
    }

    .argument-item {
      display: flex;
      flex-direction: column;
    }

    .arg-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 0.85rem;
    }

    .arg-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-xs);
      background: var(--surface-card, #FFFFFF);
      border: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .arg-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--earth-950);
      line-height: 1.3;
    }

    .arg-desc {
      font-size: 0.92rem;
      line-height: 1.7;
      color: var(--earth-700);
      padding-left: 0.2rem;
    }

    .philosophy-strip {
      background: var(--surface-card, #FFFFFF);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 2.2rem 3rem;
      text-align: center;
    }

    .philosophy-quote {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1.15rem;
      line-height: 1.7;
      color: var(--earth-900);
      max-width: 780px;
      margin: 0 auto 0.75rem auto;
    }

    .philosophy-author {
      display: block;
      font-size: 0.82rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent-clay);
    }

    @media (max-width: 992px) {
      .arguments-list {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .philosophy-strip {
        padding: 1.8rem 1.5rem;
      }
      .philosophy-quote {
        font-size: 1.02rem;
      }
    }
  `]
})
export class WhyUsComponent {
  public ts = inject(TranslationService);
}
