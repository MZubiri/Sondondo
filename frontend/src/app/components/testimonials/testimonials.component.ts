import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Testimonial } from '../../models/tour.model';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    @if (testimonials.length > 0) {
      <section class="testimonials-section" id="testimonios">
        <div class="container">
          <div class="section-title-wrap text-center">
            <span class="section-tag">{{ ts.t('test.badge') }}</span>
            <h2 class="section-title">{{ ts.t('test.title') }}</h2>
            <p class="section-subtitle">
              {{ ts.t('test.subtitle') }}
            </p>
          </div>

          <div class="testimonials-grid">
            @for (item of testimonials; track item.id) {
              <div class="testimonial-card">
                <p class="testimonial-quote">“{{ item.comment }}”</p>
                <div class="testimonial-footer">
                  <span class="author-name">{{ item.authorName }}</span>
                  <span class="author-location">{{ item.location }}</span>
                  <span class="tour-name">{{ item.tourName }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>
    } @else {
      <!-- Transparencia: si no hay testimonios auditados, no inventamos nombres falsos -->
      <section class="community-note-section" id="testimonios">
        <div class="container">
          <div class="community-box">
            <div class="community-icon">
              <app-icon name="users" [size]="24" stroke="var(--forest-900)"></app-icon>
            </div>
            <div class="community-text">
              <h4>Comunidad de Viajeros y Reseñas Directas</h4>
              <p>
                Por política de transparencia y respeto, no publicamos testimonios inventados. 
                Puedes consultar fotografías, experiencias y opiniones directas de nuestros viajeros en nuestra 
                comunidad de Facebook o solicitar referencias de salidas recientes por WhatsApp.
              </p>
            </div>
            <div class="community-action">
              <a 
                href="https://www.facebook.com/valledelsondondoexpeditions" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-secondary btn-sm">
                <span>Ver Facebook Oficial</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .testimonials-section {
      padding: 5.5rem 0;
      background: var(--cream-50);
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .testimonial-card {
      background: var(--surface-card, #FFFFFF);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .testimonial-quote {
      font-family: var(--font-serif);
      font-style: italic;
      font-size: 1rem;
      line-height: 1.7;
      color: var(--earth-800);
      margin-bottom: 1.5rem;
    }

    .testimonial-footer {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }

    .author-name {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--earth-950);
    }

    .author-location {
      font-size: 0.8rem;
      color: var(--earth-500);
    }

    .tour-name {
      font-size: 0.78rem;
      color: var(--accent-clay);
      font-weight: 600;
    }

    /* Nota honesta de comunidad */
    .community-note-section {
      padding: 3.5rem 0;
      background: var(--cream-50);
    }

    .community-box {
      background: var(--surface-card, #FFFFFF);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 2rem 2.5rem;
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .community-icon {
      width: 50px;
      height: 50px;
      background: var(--forest-50);
      border-radius: var(--radius-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .community-text {
      flex-grow: 1;
    }

    .community-text h4 {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.35rem;
    }

    .community-text p {
      font-size: 0.9rem;
      color: var(--earth-700);
      line-height: 1.6;
    }

    .community-action {
      flex-shrink: 0;
    }

    @media (max-width: 992px) {
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
      .community-box {
        flex-direction: column;
        align-items: flex-start;
        padding: 1.75rem;
      }
    }
  `]
})
export class TestimonialsComponent {
  public ts = inject(TranslationService);
  @Input() testimonials: Testimonial[] = [];
}
