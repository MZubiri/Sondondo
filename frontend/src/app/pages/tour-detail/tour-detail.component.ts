import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TourDetail, TourSummary } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { IconComponent } from '../../components/icon/icon.component';
import { BookingModalComponent } from '../../components/booking-modal/booking-modal.component';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BookingModalComponent],
  template: `
    @if (tour()) {
      <div class="tour-detail-page">
        <!-- Hero Banner with Background -->
        <section class="detail-hero" [style.background-image]="'linear-gradient(rgba(18, 35, 26, 0.72), rgba(27, 21, 16, 0.88)), url(' + tour()!.mainImageUrl + ')'">
          <div class="container">
            <a routerLink="/" fragment="tours" class="back-link">
              <app-icon name="arrow-right" [size]="18" stroke="#FFFFFF" customClass="rotate-180"></app-icon>
              <span>Volver a todos los recorridos</span>
            </a>

            <div class="detail-header-content">
              <div class="hero-badges">
                <span class="badge badge-nature">{{ tour()!.categoryName }}</span>
                <span class="badge">Lucanas • Ayacucho, Perú</span>
              </div>

              <h1 class="detail-title">{{ tour()!.title }}</h1>
              <p class="detail-subtitle">{{ tour()!.subtitle }}</p>

              <!-- Pill Highlights -->
              <div class="detail-stats-bar">
                <div class="d-stat">
                  <app-icon name="clock" [size]="18" stroke="var(--secondary)"></app-icon>
                  <div>
                    <small>Duración</small>
                    <strong>{{ tour()!.duration }}</strong>
                  </div>
                </div>

                <div class="d-stat">
                  <app-icon name="mountain" [size]="18" stroke="var(--primary)"></app-icon>
                  <div>
                    <small>Altitud Máxima</small>
                    <strong>{{ tour()!.altitudeMax }}</strong>
                  </div>
                </div>

                <div class="d-stat">
                  <app-icon name="compass" [size]="18" stroke="#27AE60"></app-icon>
                  <div>
                    <small>Dificultad</small>
                    <strong>{{ tour()!.difficulty }}</strong>
                  </div>
                </div>

                <div class="d-stat">
                  <app-icon name="map-pin" [size]="18" stroke="#3498DB"></app-icon>
                  <div>
                    <small>Punto de Partida</small>
                    <strong>{{ tour()!.startingPoint }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Body & Sticky Sidebar Grid -->
        <div class="container detail-body-container">
          <div class="detail-main-col">
            <!-- Overview -->
            <section class="content-block">
              <h2 class="block-title">Descripción de la Experiencia</h2>
              <p class="lead-text">{{ tour()!.description }}</p>
            </section>

            <!-- Gallery Images -->
            @if (tour()!.galleryImages.length > 0) {
              <section class="content-block">
                <h2 class="block-title">Galería Fotográfica</h2>
                <div class="gallery-grid">
                  @for (img of tour()!.galleryImages; track img) {
                    <div class="gallery-item">
                      <img [src]="img" [alt]="tour()!.title" loading="lazy" (error)="onGalleryImageError($event)" />
                    </div>
                  }
                </div>
              </section>
            }

            <!-- Day-by-day Itinerary -->
            @if (tour()!.itineraries.length > 0) {
              <section class="content-block">
                <h2 class="block-title">Itinerario Día a Día</h2>
                <div class="itinerary-timeline">
                  @for (day of tour()!.itineraries; track day.id) {
                    <div class="timeline-step">
                      <div class="day-marker">
                        <span>Día</span>
                        <strong>{{ day.dayNumber }}</strong>
                      </div>
                      <div class="step-card glass-card">
                        <h3 class="step-title">{{ day.title }}</h3>
                        <p class="step-desc">{{ day.description }}</p>
                        
                        @if (day.activities) {
                          <div class="step-detail-row">
                            <app-icon name="compass" [size]="16" stroke="var(--primary)"></app-icon>
                            <span><strong>Actividades:</strong> {{ day.activities }}</span>
                          </div>
                        }

                        @if (day.meals) {
                          <div class="step-detail-row">
                            <app-icon name="check" [size]="16" stroke="var(--secondary)"></app-icon>
                            <span><strong>Alimentación:</strong> {{ day.meals }}</span>
                          </div>
                        }

                        @if (day.accommodation) {
                          <div class="step-detail-row">
                            <app-icon name="landmark" [size]="16" stroke="var(--accent-emerald)"></app-icon>
                            <span><strong>Pernocte:</strong> {{ day.accommodation }}</span>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </section>
            }

            <!-- Inclusions and Exclusions -->
            <section class="content-block">
              <div class="inclusions-grid">
                <!-- Included -->
                <div class="inc-card included-box">
                  <h3 class="inc-title text-success">
                    <app-icon name="check" [size]="20" stroke="#27AE60"></app-icon>
                    <span>Qué Incluye</span>
                  </h3>
                  <ul class="inc-list">
                    @for (item of tour()!.included; track item) {
                      <li>
                        <app-icon name="check" [size]="16" stroke="#27AE60"></app-icon>
                        <span>{{ item }}</span>
                      </li>
                    }
                  </ul>
                </div>

                <!-- Not Included -->
                <div class="inc-card not-included-box">
                  <h3 class="inc-title text-danger">
                    <app-icon name="x" [size]="20" stroke="#E74C3C"></app-icon>
                    <span>No Incluye</span>
                  </h3>
                  <ul class="inc-list">
                    @for (item of tour()!.notIncluded; track item) {
                      <li>
                        <app-icon name="x" [size]="16" stroke="#E74C3C"></app-icon>
                        <span>{{ item }}</span>
                      </li>
                    }
                  </ul>
                </div>
              </div>
            </section>

            <!-- Recommendations -->
            @if (tour()!.recommendations.length > 0) {
              <section class="content-block">
                <h2 class="block-title">¿Qué Debes Llevar? (Recomendaciones)</h2>
                <div class="recommendations-box">
                  @for (tip of tour()!.recommendations; track tip) {
                    <div class="tip-chip">
                      <app-icon name="shield-check" [size]="16" stroke="var(--primary)"></app-icon>
                      <span>{{ tip }}</span>
                    </div>
                  }
                </div>
              </section>
            }
          </div>

          <!-- Sticky Sidebar -->
          <aside class="detail-sidebar-col">
            <div class="sticky-booking-card">
              <div class="card-price-header">
                <span class="price-subtitle">Tarifa del Recorrido</span>
                <div class="price-row">
                  @if (tour()!.priceSoles > 0) {
                    <span class="currency">S/</span>
                    <span class="price-val">{{ tour()!.priceSoles }}</span>
                  } @else {
                    <span class="price-val">Consultar</span>
                  }
                </div>
              </div>

              <div class="card-perks">
                <div class="perk-item">
                  <app-icon name="shield-check" [size]="18" stroke="#27AE60"></app-icon>
                  <span>Certificación Safe Travels</span>
                </div>
                <div class="perk-item">
                  <app-icon name="users" [size]="18" stroke="var(--primary)"></app-icon>
                  <span>Grupos reducidos y seguros</span>
                </div>
                <div class="perk-item">
                  <app-icon name="whatsapp" [size]="18" stroke="#25D366"></app-icon>
                  <span>Atención directa sin intermediarios</span>
                </div>
              </div>

              <div class="card-cta-group">
                <button (click)="openBookingModal()" class="btn btn-primary w-100 btn-lg">
                  <app-icon name="calendar" [size]="20" stroke="#FFFFFF"></app-icon>
                  <span>Solicitar Cotización</span>
                </button>

                <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp w-100 btn-lg mt-2">
                  <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>

              <div class="card-contact-hint">
                <app-icon name="phone" [size]="15"></app-icon>
                <span>¿Dudas? Llámanos al <strong>+51 966 380 590</strong></span>
              </div>
            </div>
          </aside>
        </div>

        <!-- Booking Modal -->
        @if (isModalOpen()) {
          <app-booking-modal 
            [tour]="tour()!" 
            (close)="isModalOpen.set(false)">
          </app-booking-modal>
        }
      </div>
    }
  `,
  styles: [`
    .tour-detail-page {
      padding-bottom: 6rem;
    }

    .detail-hero {
      padding-top: 7.5rem;
      padding-bottom: 4.5rem;
      color: #FFFFFF;
      background-size: cover;
      background-position: center;
      position: relative;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #DDE4EC;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      transition: var(--transition-smooth);
    }

    .back-link:hover {
      color: var(--secondary);
      transform: translateX(-4px);
    }

    .rotate-180 {
      transform: rotate(180deg);
    }

    .hero-badges {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .badge-category {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .detail-title {
      font-size: 3rem;
      color: #FFFFFF;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 1rem;
      max-width: 900px;
    }

    .detail-subtitle {
      font-size: 1.2rem;
      color: #DDE4EC;
      max-width: 800px;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .detail-stats-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      padding: 1.1rem 1.6rem;
      background: rgba(18, 35, 26, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: var(--radius-sm);
      max-width: fit-content;
    }

    .d-stat {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .d-stat small {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #C5BAAD;
    }

    .d-stat strong {
      font-family: var(--font-display);
      font-size: 0.98rem;
      color: #FFFFFF;
    }

    .detail-body-container {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 3.5rem;
      margin-top: 3.5rem;
      align-items: flex-start;
    }

    .content-block {
      margin-bottom: 3.5rem;
    }

    .block-title {
      font-size: 1.75rem;
      color: var(--earth-950);
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.5rem;
    }

    .block-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 40px;
      height: 2px;
      background: var(--accent-clay);
    }

    .lead-text {
      font-size: 1.08rem;
      line-height: 1.8;
      color: var(--earth-800);
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .gallery-item {
      height: 190px;
      border-radius: var(--radius-xs);
      overflow: hidden;
      border: 1px solid var(--border-light);
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .gallery-item:hover img {
      transform: scale(1.05);
    }

    .itinerary-timeline {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .timeline-step {
      display: flex;
      gap: 1.5rem;
    }

    .day-marker {
      width: 54px;
      height: 54px;
      border-radius: var(--radius-xs);
      background: var(--forest-900);
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .day-marker span {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .day-marker strong {
      font-family: var(--font-display);
      font-size: 1.3rem;
      line-height: 1;
    }

    .step-card {
      flex-grow: 1;
      padding: 1.75rem;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
    }

    .step-title {
      font-size: 1.22rem;
      color: var(--earth-950);
      margin-bottom: 0.6rem;
    }

    .step-desc {
      font-size: 0.95rem;
      color: var(--earth-700);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .step-detail-row {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--earth-900);
      margin-top: 0.4rem;
    }

    .inclusions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .inc-card {
      padding: 2rem;
      border-radius: var(--radius-lg);
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
    }

    .included-box {
      border-top: 4px solid #27AE60;
    }

    .not-included-box {
      border-top: 4px solid #E74C3C;
    }

    .inc-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      margin-bottom: 1.25rem;
    }

    .text-success { color: #27AE60; }
    .text-danger { color: #E74C3C; }

    .inc-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .inc-list li {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.9rem;
      color: var(--earth-700);
      line-height: 1.5;
    }

    .recommendations-box {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .tip-chip {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--night-900);
      box-shadow: var(--shadow-sm);
    }

    /* Sticky Sidebar */
    .sticky-booking-card {
      position: sticky;
      top: 6.5rem;
      padding: 2.2rem;
      background: #FFFFFF;
      box-shadow: var(--shadow-lg);
      border: 1.5px solid rgba(192, 57, 43, 0.15);
    }

    .card-price-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-light);
    }

    .price-subtitle {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #7D8898;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      margin-top: 0.25rem;
    }

    .currency {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
    }

    .price-val {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 900;
      color: var(--night-900);
      line-height: 1;
    }

    .price-usd-badge {
      font-size: 0.85rem;
      color: #7D8898;
    }

    .card-perks {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.75rem;
    }

    .perk-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--night-900);
      font-weight: 500;
    }

    .card-cta-group {
      margin-bottom: 1.5rem;
    }

    .w-100 { width: 100%; }
    .mt-2 { margin-top: 0.75rem; }

    .card-contact-hint {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: #7D8898;
      justify-content: center;
    }

    @media (max-width: 992px) {
      .detail-body-container {
        grid-template-columns: 1fr;
      }
      .gallery-grid {
        grid-template-columns: 1fr 1fr;
      }
      .inclusions-grid {
        grid-template-columns: 1fr;
      }
      .detail-title {
        font-size: 2.2rem;
      }
    }

    @media (max-width: 600px) {
      .timeline-step {
        flex-direction: column;
      }
      .gallery-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TourDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tourService = inject(TourService);

  tour = signal<TourDetail | null>(null);
  isModalOpen = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.tourService.getTourBySlug(slug).subscribe(t => {
          this.tour.set(t);
        });
      }
    });
  }

  get whatsAppUrl(): string {
    const t = this.tour();
    const tourTitle = t ? t.title : 'un tour';
    const text = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\n` +
      `Deseo cotizar y coordinar fechas para el tour: *${tourTitle}*.\n` +
      `¿Podrían indicarme disponibilidad y detalles? Gracias.`
    );
    return `https://wa.me/51966380590?text=${text}`;
  }

  openBookingModal(): void {
    this.isModalOpen.set(true);
  }

  onGalleryImageError(e: Event): void {
    const target = e.target as HTMLImageElement;
    target.src = '/assets/images/andenes_andamarca.jpg';
  }
}
