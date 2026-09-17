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
      <!-- Media Header -->
      <div class="card-media">
        <img [src]="tour.mainImageUrl" [alt]="tour.title" loading="lazy" class="card-image" />
        
        <!-- Badges Overlay -->
        <div class="media-badges">
          <span class="badge badge-category">
            {{ tour.categoryName }}
          </span>
          @if (tour.featured) {
            <span class="badge badge-featured">Destacado</span>
          }
        </div>

        <!-- Duration Floating Chip -->
        <div class="duration-chip">
          <app-icon name="clock" [size]="14"></app-icon>
          <span>{{ tour.duration }}</span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <h3 class="tour-title">
          <a [routerLink]="['/tour', tour.slug]">{{ tour.title }}</a>
        </h3>
        
        <p class="tour-subtitle">{{ tour.subtitle }}</p>

        <!-- Metadata Attributes -->
        <div class="tour-meta-list">
          <div class="meta-item">
            <app-icon name="mountain" [size]="16" stroke="var(--primary)"></app-icon>
            <span>Max: <strong>{{ tour.altitudeMax }}</strong></span>
          </div>
          <div class="meta-item">
            <app-icon name="compass" [size]="16" stroke="var(--secondary)"></app-icon>
            <span>Nivel: <strong>{{ tour.difficulty }}</strong></span>
          </div>
          <div class="meta-item">
            <app-icon name="map-pin" [size]="16" stroke="var(--accent-emerald)"></app-icon>
            <span>Salida: <strong>{{ tour.startingPoint }}</strong></span>
          </div>
        </div>

        <!-- Footer / Pricing & Actions -->
        <div class="card-footer">
          <div class="price-box">
            <span class="price-label">Precio por persona</span>
            <div class="price-values">
              <span class="price-soles">S/ {{ tour.priceSoles }}</span>
              <span class="price-usd">(aprox. USD {{ tour.priceUsd }})</span>
            </div>
          </div>

          <div class="card-actions">
            <a [routerLink]="['/tour', tour.slug]" class="btn btn-secondary btn-sm" title="Ver itinerario completo">
              Itinerario
            </a>
            <button (click)="onBookClick.emit(tour)" class="btn btn-primary btn-sm" title="Cotizar o reservar tour">
              <app-icon name="calendar" [size]="15" stroke="#FFFFFF"></app-icon>
              <span>Cotizar</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .tour-card {
      background: var(--surface-card);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      transition: var(--transition-smooth);
      position: relative;
    }

    .tour-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(192, 57, 43, 0.25);
    }

    .card-media {
      position: relative;
      height: 230px;
      overflow: hidden;
      background: var(--night-800);
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .tour-card:hover .card-image {
      transform: scale(1.06);
    }

    .media-badges {
      position: absolute;
      top: 1rem;
      left: 1rem;
      display: flex;
      gap: 0.5rem;
      z-index: 2;
    }

    .badge-category {
      background: rgba(11, 19, 43, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .badge-featured {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: #FFFFFF;
      box-shadow: 0 2px 8px rgba(192, 57, 43, 0.4);
    }

    .duration-chip {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--night-900);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: var(--shadow-sm);
    }

    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .tour-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }

    .tour-title a:hover {
      color: var(--primary);
    }

    .tour-subtitle {
      font-size: 0.88rem;
      color: var(--earth-700);
      margin-bottom: 1.25rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tour-meta-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-top: 0.75rem;
      border-top: 1px dashed var(--border-light);
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.78rem;
      color: var(--earth-700);
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-top: 1.2rem;
      border-top: 1px solid var(--border-light);
    }

    .price-box {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.72rem;
      color: #7D8898;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .price-values {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .price-soles {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--night-900);
    }

    .price-usd {
      font-size: 0.76rem;
      color: #7D8898;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.45rem 0.95rem;
      font-size: 0.85rem;
    }
  `]
})
export class TourCardComponent {
  @Input({ required: true }) tour!: TourSummary;
  @Output() onBookClick = new EventEmitter<TourSummary>();
}
