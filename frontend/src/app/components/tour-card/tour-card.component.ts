import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TourSummary } from '../../models/tour.model';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <article class="tour-card">
      <a [routerLink]="['/tour', tour.slug]" class="card-media" [attr.aria-label]="getTourTitle()">
        <img 
          [src]="tour.mainImageUrl" 
          [alt]="getTourTitle()" 
          loading="lazy" 
          class="card-img"
          (error)="onImageError($event)" />

        <div class="card-badges">
          @if (tour.altitudeMax) {
            <span class="badge-altitude">
              <app-icon name="mountain" [size]="12" stroke="#FFFFFF"></app-icon>
              {{ tour.altitudeMax }}
            </span>
          }
          @if (tour.difficulty) {
            <span class="badge-difficulty" [ngClass]="getDifficultyClass()">
              {{ getTourDifficulty() }}
            </span>
          }
        </div>
      </a>

      <div class="card-body">
        <div class="card-meta">
          <span class="meta-item">
            <app-icon name="clock" [size]="14"></app-icon>
            {{ getTourDuration() }}
          </span>
          <span class="meta-dot">•</span>
          <span class="meta-item">
            <app-icon name="map-pin" [size]="14"></app-icon>
            {{ tour.startingPoint }}
          </span>
        </div>

        <h3 class="card-title">
          <a [routerLink]="['/tour', tour.slug]">{{ getTourTitle() }}</a>
        </h3>

        <div class="card-footer">
          <div class="price-box">
            <span class="price-label">{{ ts.t('tours.from') }}</span>
            <div class="price-val">
              @if (tour.priceSoles > 0) {
                <span class="currency">S/</span>
                <span class="amount">{{ tour.priceSoles }}</span>
              } @else {
                <span class="amount inquire">{{ ts.t('tours.book') }}</span>
              }
            </div>
            @if (tour.priceUsd && tour.priceUsd > 0) {
              <span class="price-usd-sub">~ USD {{ tour.priceUsd }}</span>
            }
          </div>

          <div class="card-actions">
            <a 
              [routerLink]="['/tour', tour.slug]" 
              class="btn-outline-itinerary"
              title="Ver itinerario completo día por día">
              <span>{{ ts.t('tours.viewDetails') }}</span>
            </a>
            <button 
              type="button" 
              (click)="onBookClick.emit(tour)" 
              class="btn btn-primary btn-sm"
              title="Consultar por este recorrido">
              <span>{{ ts.t('tours.book') }}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .tour-card {
      background: var(--surface-card);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }

    .tour-card:hover {
      border-color: var(--earth-300);
      box-shadow: var(--shadow-card);
      transform: translateY(-3px);
    }

    .card-media {
      display: block;
      position: relative;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: var(--earth-100);
    }

    .card-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .tour-card:hover .card-img {
      transform: scale(1.04);
    }

    .card-badges {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      pointer-events: none;
      z-index: 2;
    }

    .badge-altitude {
      background: rgba(22, 36, 26, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.55rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      letter-spacing: 0.02em;
    }

    .badge-difficulty {
      background: rgba(22, 36, 26, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #E2CEB8;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid rgba(226, 206, 184, 0.35);
      letter-spacing: 0.02em;
    }

    .badge-difficulty.diff-exigente {
      background: rgba(184, 61, 39, 0.88);
      color: #FFFFFF;
      border-color: rgba(255, 255, 255, 0.35);
    }

    .card-body {
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--earth-700);
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .meta-dot {
      color: var(--earth-300);
    }

    .card-title {
      font-size: 1.22rem;
      font-weight: 700;
      line-height: 1.35;
      color: var(--earth-950);
      margin-bottom: 1.25rem;
    }

    .card-title a {
      color: inherit;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .card-title a:hover {
      color: var(--accent-clay);
    }

    .card-footer {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .price-box {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      min-width: 0;
    }

    .price-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--earth-500);
      font-weight: 600;
      line-height: 1.2;
    }

    .price-val {
      display: inline-flex;
      align-items: baseline;
      gap: 0.2rem;
      white-space: nowrap;
      line-height: 1.2;
    }

    .price-val .currency {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--forest-800);
      white-space: nowrap;
    }

    .price-val .amount {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--forest-900);
      white-space: nowrap;
      letter-spacing: -0.01em;
    }

    .price-val .amount.inquire {
      font-size: 0.95rem;
      font-weight: 700;
    }

    .price-usd-sub {
      font-size: 0.72rem;
      color: var(--earth-500);
      font-weight: 500;
      margin-top: 0.15rem;
      white-space: nowrap;
    }

    .card-actions {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 0.4rem;
      flex-shrink: 0;
      min-width: 145px;
    }

    .btn-outline-itinerary {
      padding: 0.4rem 0.75rem;
      font-size: 0.8rem;
      min-height: 36px;
      border: 1px solid var(--earth-300);
      background: transparent;
      color: var(--forest-900);
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      white-space: nowrap;
      text-align: center;
      width: 100%;
    }

    .btn-outline-itinerary:hover {
      background: var(--earth-100);
      border-color: var(--forest-900);
      color: var(--forest-900);
    }

    .btn-outline-itinerary:focus-visible,
    .btn:focus-visible {
      outline: 2px solid var(--accent-clay);
      outline-offset: 2px;
    }

    .btn-sm {
      padding: 0.45rem 1rem;
      font-size: 0.84rem;
      min-height: 36px;
      white-space: nowrap;
      justify-content: center;
      width: 100%;
    }
  `]
})
export class TourCardComponent {
  public ts = inject(TranslationService);
  @Input({ required: true }) tour!: TourSummary;
  @Output() onBookClick = new EventEmitter<TourSummary>();

  getTourTitle(): string {
    const key = `tour.${this.tour.id}.title`;
    const trans = this.ts.t(key);
    return trans !== key ? trans : this.tour.title;
  }

  getTourDuration(): string {
    const key = `tour.${this.tour.id}.duration`;
    const trans = this.ts.t(key);
    return trans !== key ? trans : this.tour.duration;
  }

  getTourDifficulty(): string {
    const key = `tour.${this.tour.id}.difficulty`;
    const trans = this.ts.t(key);
    return trans !== key ? trans : this.tour.difficulty;
  }

  getDifficultyClass(): string {
    const diff = (this.tour.difficulty || '').toLowerCase();
    if (diff.includes('exigente') || diff.includes('demanding')) {
      return 'diff-exigente';
    }
    return '';
  }

  onImageError(e: Event): void {
    const target = e.target as HTMLImageElement;
    target.src = '/assets/images/hero_sondondo.jpg';
  }
}
