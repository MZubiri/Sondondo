import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TourSummary } from '../../models/tour.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <article class="tour-card">
      <a [routerLink]="['/tour', tour.slug]" class="card-media" [attr.aria-label]="tour.title">
        <img 
          [src]="tour.mainImageUrl" 
          [alt]="tour.title" 
          loading="lazy" 
          class="card-img" />
      </a>

      <div class="card-body">
        <div class="card-meta">
          <span class="meta-item">
            <app-icon name="clock" [size]="14"></app-icon>
            {{ tour.duration }}
          </span>
          <span class="meta-dot">•</span>
          <span class="meta-item">
            <app-icon name="map-pin" [size]="14"></app-icon>
            {{ tour.startingPoint }}
          </span>
        </div>

        <h3 class="card-title">
          <a [routerLink]="['/tour', tour.slug]">{{ tour.title }}</a>
        </h3>

        <div class="card-footer">
          <div class="price-box">
            <span class="price-label">Precio</span>
            <span class="price-val">
              @if (tour.priceSoles > 0) {
                S/ {{ tour.priceSoles }}
              } @else {
                Consultar
              }
            </span>
          </div>

          <div class="card-actions">
            <button 
              type="button" 
              (click)="onBookClick.emit(tour)" 
              class="btn btn-primary btn-sm"
              title="Consultar por este recorrido">
              <span>Consultar</span>
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
      transition: var(--transition);
    }

    .tour-card:hover {
      border-color: var(--earth-300);
      box-shadow: var(--shadow-card);
      transform: translateY(-2px);
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
      transform: scale(1.03);
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
    }

    .price-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--earth-500);
      font-weight: 600;
    }

    .price-val {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--forest-900);
    }

    .btn-sm {
      padding: 0.5rem 1.15rem;
      font-size: 0.88rem;
      min-height: 40px;
    }
  `]
})
export class TourCardComponent {
  @Input({ required: true }) tour!: TourSummary;
  @Output() onBookClick = new EventEmitter<TourSummary>();
}
