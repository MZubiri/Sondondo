import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Testimonial } from '../../models/tour.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="testimonials-section" id="testimonios">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-tag">Testimonios Reales</span>
          <h2 class="section-title">Lo Que Dicen Nuestros Viajeros</h2>
          <p class="section-subtitle">
            Historias auténticas de quienes se atrevieron a explorar los cañones, andenes y glaciares de Sondondo.
          </p>
        </div>

        <div class="testimonials-grid">
          @for (item of testimonials; track item.id) {
            <div class="testimonial-card">
              <!-- Star Rating -->
              <div class="rating-stars">
                @for (star of [1,2,3,4,5]; track star) {
                  <app-icon name="star" [size]="18" stroke="#F1C40F" customClass="star-icon"></app-icon>
                }
              </div>

              <p class="testimonial-comment">
                “{{ item.comment }}”
              </p>

              <div class="testimonial-meta">
                <div class="author-avatar">
                  {{ getInitials(item.authorName) }}
                </div>
                <div>
                  <div class="author-name">{{ item.authorName }}</div>
                  <div class="author-location">{{ item.location }}</div>
                  <div class="tour-tag">{{ item.tourName }}</div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .testimonials-section {
      padding: 6rem 0;
      background: var(--earth-50);
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .testimonial-card {
      background: #FFFFFF;
      padding: 2.2rem 1.8rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: var(--transition-smooth);
    }

    .testimonial-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-md);
      border-color: rgba(230, 126, 34, 0.3);
    }

    .rating-stars {
      display: flex;
      gap: 0.25rem;
      margin-bottom: 1.25rem;
      color: #F1C40F;
    }

    .testimonial-comment {
      font-size: 0.95rem;
      line-height: 1.65;
      color: var(--earth-900);
      font-style: italic;
      margin-bottom: 1.75rem;
      flex-grow: 1;
    }

    .testimonial-meta {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
    }

    .author-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      flex-shrink: 0;
    }

    .author-name {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--night-900);
    }

    .author-location {
      font-size: 0.78rem;
      color: #7D8898;
    }

    .tour-tag {
      font-size: 0.72rem;
      color: var(--primary);
      font-weight: 600;
      margin-top: 2px;
    }

    @media (max-width: 992px) {
      .testimonials-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TestimonialsComponent {
  @Input() testimonials: Testimonial[] = [];

  getInitials(name: string): string {
    if (!name) return 'V';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
