import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelInfo, HotelRoom } from '../../models/hotel.model';
import { HotelRoomModalComponent } from './hotel-room-modal.component';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [CommonModule, HotelRoomModalComponent, IconComponent],
  template: `
    <section id="habitaciones" class="hotel-section">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header">
          <div class="section-badge-wrap">
            <span class="section-badge">{{ ts.t('hotel.badge') }}</span>
            <span class="stars-badge">
              <app-icon name="star" [size]="14" stroke="#F1C40F"></app-icon>
              <app-icon name="star" [size]="14" stroke="#F1C40F"></app-icon>
              <app-icon name="star" [size]="14" stroke="#F1C40F"></app-icon>
              <span>{{ ts.t('hotel.stars') }}</span>
            </span>
          </div>

          <h2 class="section-title">{{ ts.t('hotel.title') }}</h2>
          <p class="section-subtitle">{{ ts.t('hotel.subtitle') }}</p>
        </div>

        <!-- Amenities Ribbon -->
        <div class="amenities-ribbon">
          <div class="ribbon-item">
            <app-icon name="wifi" [size]="20" stroke="var(--forest-900)"></app-icon>
            <div>
              <strong>{{ ts.t('hotel.amenityWifi') }}</strong>
              <span>{{ ts.t('hotel.amenityWifiDesc') }}</span>
            </div>
          </div>
          <div class="ribbon-item">
            <app-icon name="car" [size]="20" stroke="var(--forest-900)"></app-icon>
            <div>
              <strong>{{ ts.t('hotel.amenityParking') }}</strong>
              <span>{{ ts.t('hotel.amenityParkingDesc') }}</span>
            </div>
          </div>
          <div class="ribbon-item">
            <app-icon name="clock" [size]="20" stroke="var(--forest-900)"></app-icon>
            <div>
              <strong>{{ ts.t('hotel.amenityReception') }}</strong>
              <span>{{ ts.t('hotel.amenityReceptionDesc') }}</span>
            </div>
          </div>
          <div class="ribbon-item">
            <app-icon name="bath" [size]="20" stroke="var(--forest-900)"></app-icon>
            <div>
              <strong>{{ ts.t('hotel.amenityBath') }}</strong>
              <span>{{ ts.t('hotel.amenityBathDesc') }}</span>
            </div>
          </div>
          <div class="ribbon-item">
            <app-icon name="sun" [size]="20" stroke="var(--forest-900)"></app-icon>
            <div>
              <strong>{{ ts.t('hotel.amenityBalcony') }}</strong>
              <span>{{ ts.t('hotel.amenityBalconyDesc') }}</span>
            </div>
          </div>
        </div>

        <!-- Direct Website Booking Guarantee Banner (Direct on Website) -->
        <div class="direct-booking-banner">
          <div class="direct-badge-pill">
            <app-icon name="shield-check" [size]="16" stroke="#FFFFFF"></app-icon>
            <span>{{ ts.t('hotel.directBannerTitle') }}</span>
          </div>
          <h3 class="direct-title">{{ ts.t('hotel.directBannerSubtitle') }}</h3>
          <p class="direct-desc">{{ ts.t('hotel.directBannerDesc') }}</p>
          <div class="direct-perks">
            <span class="perk-tag">✓ {{ ts.t('hotel.perkCancel') }}</span>
            <span class="perk-tag">✓ {{ ts.t('hotel.perkConfirm') }}</span>
            <span class="perk-tag">✓ {{ ts.t('hotel.perkCheckin') }}</span>
          </div>
        </div>

        <!-- Room Cards Grid -->
        <div class="rooms-grid">
          @for (room of hotelInfo.rooms; track room.id) {
            <article class="room-card glass-card">
              <!-- Room Image -->
              <div class="room-image-wrap" (click)="openRoomModal(room)">
                <img [src]="room.mainImage" [alt]="getRoomTitle(room)" class="room-img" loading="lazy" />
                <span class="room-capacity-badge">
                  <app-icon name="users" [size]="14" stroke="#FFFFFF"></app-icon>
                  <span>{{ room.capacityText }}</span>
                </span>
                <button type="button" class="btn-zoom" aria-label="Ver fotos de la habitación">
                  <app-icon name="compass" [size]="16" stroke="#FFFFFF"></app-icon>
                  <span>{{ ts.t('hotel.viewPhotos') }}</span>
                </button>
              </div>

              <!-- Room Info -->
              <div class="room-content">
                <div class="room-header-meta">
                  <span class="bed-meta">{{ room.bedConfiguration }}</span>
                </div>

                <h3 class="room-title" (click)="openRoomModal(room)">{{ getRoomTitle(room) }}</h3>
                <p class="room-desc">{{ getRoomDesc(room) }}</p>

                <!-- Amenity Badges -->
                <div class="room-chips">
                  @for (chip of room.highlights; track chip) {
                    <span class="chip">{{ chip }}</span>
                  }
                </div>

                <!-- Price and Action Box -->
                <div class="room-footer">
                  <div class="room-price">
                    <span class="from-text">{{ ts.t('hotel.from') }}</span>
                    <div class="price-val">
                      <span class="currency">S/</span>
                      <strong class="number">{{ room.pricePerNightSoles }}</strong>
                      <span class="period">{{ ts.t('hotel.perNight') }}</span>
                    </div>
                    <span class="usd-hint">~ USD {{ room.pricePerNightUsd }}</span>
                  </div>

                  <div class="room-buttons">
                    <button 
                      type="button" 
                      class="btn btn-primary btn-sm w-100" 
                      (click)="onPayMercadoPago(room)">
                      <app-icon name="credit-card" [size]="15" stroke="#FFFFFF"></app-icon>
                      <span>{{ ts.t('hotel.payMp') }}</span>
                    </button>

                    <div class="sub-buttons">
                      <button 
                        type="button" 
                        class="btn btn-secondary btn-sm flex-1" 
                        (click)="openRoomModal(room)">
                        <app-icon name="compass" [size]="15" stroke="var(--forest-900)"></app-icon>
                        <span>{{ ts.t('hotel.details') }}</span>
                      </button>

                      <a 
                        [href]="getRoomWhatsAppUrl(room)" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="btn btn-whatsapp-direct" 
                        aria-label="Consultar por WhatsApp">
                        <app-icon name="whatsapp" [size]="16" stroke="#FFFFFF"></app-icon>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          }
        </div>

        <!-- Location Footer Note -->
        <div class="hotel-location-note">
          <div class="location-item">
            <app-icon name="map-pin" [size]="18" stroke="var(--forest-900)"></app-icon>
            <span><strong>{{ ts.t('hotel.locationLabel') }}</strong> {{ hotelInfo.address }}, {{ hotelInfo.city }}, Perú (C.P. {{ hotelInfo.postalCode }})</span>
          </div>
          <div class="location-item">
            <app-icon name="compass" [size]="18" stroke="var(--forest-900)"></app-icon>
            <span>{{ ts.t('hotel.locationRoute') }}</span>
          </div>
        </div>
      </div>

      <!-- Detail Modal -->
      @if (selectedRoom()) {
        <app-hotel-room-modal 
          [room]="selectedRoom()!" 
          [whatsAppNumber]="hotelInfo.whatsAppNumber"
          (payMercadoPago)="onPayMercadoPago($event)"
          (close)="closeRoomModal()">
        </app-hotel-room-modal>
      }
    </section>
  `,
  styles: [`
    .hotel-section {
      padding: 5rem 0;
      background: linear-gradient(180deg, #FAF8F5 0%, #F3EFEA 100%);
      position: relative;
    }

    .section-header {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 2.75rem auto;
    }

    .section-badge-wrap {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.85rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .section-badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--forest-900);
      background: rgba(27, 53, 39, 0.08);
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
    }

    .stars-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--earth-900);
      background: #FFF9E6;
      padding: 0.3rem 0.75rem;
      border-radius: 999px;
      border: 1px solid #FFE082;
    }

    .section-title {
      font-family: var(--font-display);
      font-size: 2.25rem;
      font-weight: 800;
      color: var(--earth-950);
      letter-spacing: -0.02em;
      line-height: 1.2;
      margin-bottom: 1rem;
    }

    .section-subtitle {
      font-size: 1.05rem;
      line-height: 1.65;
      color: var(--earth-700);
    }

    .amenities-ribbon {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      box-shadow: 0 4px 20px rgba(38, 31, 24, 0.04);
      margin-bottom: 2rem;
    }

    .ribbon-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .ribbon-item strong {
      display: block;
      font-size: 0.88rem;
      color: var(--earth-950);
      line-height: 1.2;
    }

    .ribbon-item span {
      font-size: 0.75rem;
      color: var(--earth-600);
    }

    /* Direct Booking Banner */
    .direct-booking-banner {
      background: linear-gradient(135deg, #1B2B20 0%, #2D4A37 100%);
      color: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 1.6rem 2rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 8px 24px rgba(27, 43, 32, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .direct-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(4px);
      padding: 0.3rem 0.85rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #E2CEB8;
      margin-bottom: 0.6rem;
    }

    .direct-title {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.01em;
    }

    .direct-desc {
      font-size: 0.92rem;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 1rem 0;
      max-width: 760px;
    }

    .direct-perks {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.25rem;
    }

    .perk-tag {
      font-size: 0.82rem;
      font-weight: 600;
      color: #A3E635;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      margin-bottom: 2.5rem;
    }

    .room-card {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--border-light);
      box-shadow: 0 4px 18px rgba(38, 31, 24, 0.05);
      display: flex;
      flex-direction: column;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    .room-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(38, 31, 24, 0.1);
    }

    .room-image-wrap {
      position: relative;
      height: 220px;
      overflow: hidden;
      cursor: pointer;
    }

    .room-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .room-card:hover .room-img {
      transform: scale(1.04);
    }

    .room-capacity-badge {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      background: rgba(11, 19, 43, 0.8);
      backdrop-filter: blur(4px);
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-zoom {
      position: absolute;
      bottom: 0.85rem;
      right: 0.85rem;
      background: rgba(0, 0, 0, 0.65);
      border: none;
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-xs);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      backdrop-filter: blur(4px);
      transition: var(--transition);
    }

    .btn-zoom:hover {
      background: rgba(0, 0, 0, 0.85);
    }

    .room-content {
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .room-header-meta {
      margin-bottom: 0.35rem;
    }

    .bed-meta {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--forest-900);
      background: rgba(45, 106, 79, 0.08);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
    }

    .room-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.5rem;
      cursor: pointer;
      line-height: 1.3;
    }

    .room-title:hover {
      color: var(--forest-900);
    }

    .room-desc {
      font-size: 0.88rem;
      line-height: 1.55;
      color: var(--earth-600);
      margin-bottom: 1rem;
      flex: 1;
    }

    .room-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.25rem;
    }

    .chip {
      font-size: 0.75rem;
      color: var(--earth-700);
      background: var(--earth-100);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-xs);
    }

    .room-footer {
      border-top: 1px solid var(--border-light);
      padding-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .room-price {
      display: flex;
      flex-direction: column;
    }

    .from-text {
      font-size: 0.75rem;
      color: var(--earth-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .price-val {
      display: flex;
      align-items: baseline;
      gap: 0.2rem;
    }

    .currency {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--forest-900);
    }

    .number {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--forest-900);
    }

    .period {
      font-size: 0.82rem;
      color: var(--earth-600);
    }

    .usd-hint {
      font-size: 0.78rem;
      color: var(--earth-500);
      display: block;
      margin-top: -0.1rem;
    }

    .room-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sub-buttons {
      display: flex;
      gap: 0.4rem;
    }

    .flex-1 {
      flex: 1;
    }

    .btn-whatsapp-direct {
      background: #25D366;
      color: #FFFFFF;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-xs);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      transition: var(--transition);
      text-decoration: none;
    }

    .btn-whatsapp-direct:hover {
      background: #1EBE5D;
      color: #FFFFFF;
    }

    .hotel-location-note {
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 1.15rem 1.5rem;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.88rem;
      color: var(--earth-800);
    }

    .location-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    @media (max-width: 960px) {
      .rooms-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .amenities-ribbon {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 650px) {
      .rooms-grid {
        grid-template-columns: 1fr;
      }
      .amenities-ribbon {
        grid-template-columns: repeat(2, 1fr);
      }
      .hotel-location-note {
        flex-direction: column;
      }
    }
  `]
})
export class HotelRoomsComponent {
  public ts = inject(TranslationService);
  @Input({ required: true }) hotelInfo!: HotelInfo;
  @Output() bookWithMercadoPago = new EventEmitter<{ room: HotelRoom; amount: number }>();

  selectedRoom = signal<HotelRoom | null>(null);

  getRoomTitle(room: HotelRoom): string {
    if (room.id === 1) return this.ts.t('hotel.roomDouble');
    if (room.id === 2) return this.ts.t('hotel.roomTriple');
    if (room.id === 3) return this.ts.t('hotel.roomDuplex');
    return room.title;
  }

  getRoomDesc(room: HotelRoom): string {
    if (room.id === 1) return this.ts.t('hotel.roomDoubleDesc');
    if (room.id === 2) return this.ts.t('hotel.roomTripleDesc');
    if (room.id === 3) return this.ts.t('hotel.roomDuplexDesc');
    return room.shortDescription;
  }

  openRoomModal(room: HotelRoom): void {
    this.selectedRoom.set(room);
  }

  closeRoomModal(): void {
    this.selectedRoom.set(null);
  }

  onPayMercadoPago(room: HotelRoom): void {
    this.bookWithMercadoPago.emit({ room, amount: room.pricePerNightSoles });
  }

  getRoomWhatsAppUrl(room: HotelRoom): string {
    const text = encodeURIComponent(
      `¡Hola! 👋 Deseo consultar disponibilidad para la *${this.getRoomTitle(room)}* en el *Hotel Punto Clave* (S/ ${room.pricePerNightSoles}/noche).`
    );
    return `https://wa.me/${this.hotelInfo.whatsAppNumber}?text=${text}`;
  }
}
