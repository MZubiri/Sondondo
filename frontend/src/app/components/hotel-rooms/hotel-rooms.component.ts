import { Component, EventEmitter, Input, Output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelInfo, HotelRoom } from '../../models/hotel.model';
import { HotelRoomModalComponent } from './hotel-room-modal.component';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-hotel-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule, HotelRoomModalComponent, IconComponent],
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

        <!-- BARRA DE BÚSQUEDA INTERACTIVA (CHECK-IN / CHECK-OUT / HUÉSPEDES) -->
        <div class="hotel-search-bar-wrap">
          <div class="hotel-search-card">
            <div class="search-field">
              <label class="search-label">
                <app-icon name="calendar" [size]="15" stroke="var(--terracotta-500)"></app-icon>
                <span>Check-In (Llegada)</span>
              </label>
              <input 
                type="date" 
                class="search-input" 
                [ngModel]="searchCheckIn()" 
                (ngModelChange)="onCheckInChange($event)" 
                [min]="minCheckInDate" 
              />
            </div>

            <div class="search-divider"></div>

            <div class="search-field">
              <label class="search-label">
                <app-icon name="calendar" [size]="15" stroke="var(--terracotta-500)"></app-icon>
                <span>Check-Out (Salida)</span>
              </label>
              <input 
                type="date" 
                class="search-input" 
                [ngModel]="searchCheckOut()" 
                (ngModelChange)="onCheckOutChange($event)" 
                [min]="minCheckOutDate" 
              />
            </div>

            <div class="search-divider"></div>

            <div class="search-field">
              <label class="search-label">
                <app-icon name="users" [size]="15" stroke="var(--terracotta-500)"></app-icon>
                <span>Huéspedes</span>
              </label>
              <select class="search-select" [ngModel]="searchGuests()" (ngModelChange)="searchGuests.set(+$event)">
                <option [value]="1">1 Huésped (Viajero Solo)</option>
                <option [value]="2">2 Huéspedes (Pareja / Matrimonial)</option>
                <option [value]="3">3 Huéspedes (Familiar Triple)</option>
                <option [value]="4">4+ Huéspedes (Grupo / Dúplex)</option>
              </select>
            </div>

            <div class="search-summary-action">
              <div class="stay-nights-badge">
                <span class="nights-val">{{ nightsCount() }}</span>
                <span class="nights-lbl">{{ nightsCount() === 1 ? 'Noche' : 'Noches' }}</span>
              </div>
              <button *ngIf="isCustomSearch()" type="button" class="btn-clear-search" (click)="resetSearchDates()" title="Restablecer fechas predeterminadas">
                ↺ Restablecer
              </button>
            </div>
          </div>

          <!-- Dynamic search feedback pill -->
          <div class="search-feedback-bar" *ngIf="isCustomSearch()">
            <span class="feedback-text">
              ✨ Mostrando disponibilidad y tarifas para <strong>{{ nightsCount() }} {{ nightsCount() === 1 ? 'noche' : 'noches' }}</strong> ({{ searchCheckIn() }} al {{ searchCheckOut() }}) para <strong>{{ searchGuests() }} {{ searchGuests() === 1 ? 'huésped' : 'huéspedes' }}</strong>:
            </span>
          </div>
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
          @for (room of filteredRooms(); track room.id) {
            <article class="room-card glass-card" [class.room-unavailable]="isRoomBlockedForDates(room)">
              <!-- Room Image -->
              <div class="room-image-wrap" (click)="openRoomModal(room)">
                <img [src]="room.mainImage" [alt]="getRoomTitle(room)" class="room-img" loading="lazy" />
                <span class="room-capacity-badge">
                  <app-icon name="users" [size]="14" stroke="#FFFFFF"></app-icon>
                  <span>{{ room.capacityText }}</span>
                </span>

                <span *ngIf="isRoomBlockedForDates(room)" class="badge-dates-blocked">
                  🔒 Fechas No Disponibles
                </span>
                <span *ngIf="!isRoomBlockedForDates(room) && getRoomStayDetails(room).hasSpecialRate" class="badge-seasonal-rate">
                  ⭐ {{ getRoomStayDetails(room).seasonalReason }}
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
                      <strong class="number">{{ getRoomStayDetails(room).effectiveNightlyRate }}</strong>
                      <span class="period">{{ ts.t('hotel.perNight') }}</span>
                    </div>
                    <span class="usd-hint">~ USD {{ roundUsd(getRoomStayDetails(room).effectiveNightlyRate) }}</span>

                    <!-- Dynamic total stay price display -->
                    <div class="total-stay-calculated" *ngIf="nightsCount() > 1">
                      <span class="total-stay-label">Total por {{ nightsCount() }} noches:</span>
                      <strong class="total-stay-amount">S/ {{ getRoomStayDetails(room).totalSoles }}</strong>
                    </div>
                  </div>

                  <div class="room-buttons">
                    <button 
                      *ngIf="!isRoomBlockedForDates(room)"
                      type="button" 
                      class="btn btn-primary btn-sm w-100" 
                      (click)="onPayMercadoPago(room)">
                      <app-icon name="credit-card" [size]="15" stroke="#FFFFFF"></app-icon>
                      <span>Reservar • S/ {{ getRoomStayDetails(room).totalSoles }}</span>
                    </button>

                    <button 
                      *ngIf="isRoomBlockedForDates(room)"
                      type="button" 
                      disabled
                      class="btn btn-disabled btn-sm w-100">
                      <span>🔒 Fechas No Disponibles</span>
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
      background: var(--hotel-bg, linear-gradient(180deg, var(--cream-50) 0%, var(--section-bg-tint) 100%));
      position: relative;
      transition: background 0.3s ease;
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
      background: var(--forest-100);
      padding: 0.35rem 0.85rem;
      border-radius: 999px;
      border: 1px solid var(--border-light);
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
      background: var(--surface-card, #FFFFFF);
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
      background: linear-gradient(135deg, var(--banner-bg-start, var(--forest-950)) 0%, var(--banner-bg-end, var(--forest-800)) 100%);
      color: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 1.6rem 2rem;
      margin-bottom: 2.5rem;
      box-shadow: 0 8px 24px rgba(27, 43, 32, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
      transition: background 0.3s ease;
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
      color: var(--banner-badge-color, var(--hero-kicker-color));
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
      color: var(--banner-perk-color, #A3E635);
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

    /* BARRA DE BÚSQUEDA INTERACTIVA */
    .hotel-search-bar-wrap {
      max-width: 980px;
      margin: 0 auto 2.5rem auto;
    }

    .hotel-search-card {
      background: #FFFFFF;
      border: 2px solid rgba(200, 90, 50, 0.25);
      border-radius: var(--radius-md, 12px);
      padding: 0.85rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      box-shadow: 0 10px 30px rgba(38, 31, 24, 0.08);
      flex-wrap: wrap;
    }

    .search-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
      min-width: 170px;
    }

    .search-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--earth-700);
    }

    .search-input, .search-select {
      border: 1px solid var(--border-light, #e2e8f0);
      background: var(--cream-50, #faf8f5);
      border-radius: 6px;
      padding: 0.5rem 0.65rem;
      font-size: 0.88rem;
      color: var(--earth-950, #0f172a);
      font-weight: 600;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus, .search-select:focus {
      border-color: #c85a32;
      background: #FFFFFF;
    }

    .search-divider {
      width: 1px;
      height: 40px;
      background: var(--border-light, #e2e8f0);
      align-self: center;
    }

    .search-summary-action {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .stay-nights-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(200, 90, 50, 0.1);
      border: 1px solid rgba(200, 90, 50, 0.25);
      padding: 0.35rem 0.85rem;
      border-radius: 8px;
    }

    .nights-val {
      font-size: 1.15rem;
      font-weight: 800;
      color: #c85a32;
      line-height: 1;
    }

    .nights-lbl {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--earth-800);
    }

    .btn-clear-search {
      background: transparent;
      border: 1px dashed var(--border-light);
      color: var(--earth-600);
      font-size: 0.75rem;
      padding: 0.45rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-clear-search:hover {
      background: rgba(0, 0, 0, 0.04);
      color: var(--earth-900);
    }

    .search-feedback-bar {
      margin-top: 0.75rem;
      text-align: center;
      font-size: 0.85rem;
      color: var(--earth-700);
    }

    .search-feedback-bar strong {
      color: #c85a32;
    }

    /* Total Stay on room card */
    .total-stay-calculated {
      margin-top: 0.35rem;
      padding: 0.25rem 0.5rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .total-stay-label {
      font-size: 0.68rem;
      color: #065f46;
      font-weight: 600;
      text-transform: uppercase;
    }

    .total-stay-amount {
      font-size: 0.95rem;
      font-weight: 800;
      color: #047857;
    }

    .badge-dates-blocked {
      position: absolute;
      bottom: 0.75rem;
      left: 0.75rem;
      background: rgba(220, 38, 38, 0.9);
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      z-index: 2;
    }

    .badge-seasonal-rate {
      position: absolute;
      bottom: 0.75rem;
      left: 0.75rem;
      background: rgba(224, 159, 62, 0.95);
      color: #0b1216;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 0.3rem 0.65rem;
      border-radius: 6px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      z-index: 2;
    }

    .room-card.room-unavailable {
      opacity: 0.75;
      filter: grayscale(0.2);
    }

    .btn-disabled {
      background: #e2e8f0 !important;
      color: #94a3b8 !important;
      cursor: not-allowed !important;
      border: none !important;
    }

    @media (max-width: 960px) {
      .rooms-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .amenities-ribbon {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .hotel-search-card {
        flex-direction: column;
        align-items: stretch;
      }
      .search-divider {
        display: none;
      }
      .search-summary-action {
        justify-content: space-between;
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

  // Search Bar Signals
  searchCheckIn = signal<string>('');
  searchCheckOut = signal<string>('');
  searchGuests = signal<number>(2);
  minCheckInDate: string = '';
  minCheckOutDate: string = '';

  constructor() {
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24 * 3600000);
    this.minCheckInDate = today.toISOString().split('T')[0];
    this.minCheckOutDate = tomorrow.toISOString().split('T')[0];
    this.searchCheckIn.set(this.minCheckInDate);
    this.searchCheckOut.set(this.minCheckOutDate);
  }

  nightsCount = computed(() => {
    const inDate = this.searchCheckIn();
    const outDate = this.searchCheckOut();
    if (!inDate || !outDate) return 1;
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diff = d2.getTime() - d1.getTime();
    return Math.max(1, Math.round(diff / (1000 * 3600 * 24)));
  });

  isCustomSearch = computed(() => {
    return this.nightsCount() > 1 || this.searchGuests() !== 2 || this.searchCheckIn() !== this.minCheckInDate;
  });

  onCheckInChange(val: string): void {
    this.searchCheckIn.set(val);
    if (this.searchCheckIn() && this.searchCheckOut()) {
      if (this.searchCheckIn() >= this.searchCheckOut()) {
        const nextDay = new Date(new Date(this.searchCheckIn()).getTime() + 24 * 3600000);
        this.searchCheckOut.set(nextDay.toISOString().split('T')[0]);
      }
      const nextDayMin = new Date(new Date(this.searchCheckIn()).getTime() + 24 * 3600000);
      this.minCheckOutDate = nextDayMin.toISOString().split('T')[0];
    }
  }

  onCheckOutChange(val: string): void {
    this.searchCheckOut.set(val);
  }

  resetSearchDates(): void {
    this.searchCheckIn.set(this.minCheckInDate);
    this.searchCheckOut.set(this.minCheckOutDate);
    this.searchGuests.set(2);
  }

  isRoomBlockedForDates(room: HotelRoom): boolean {
    const inDate = this.searchCheckIn();
    const outDate = this.searchCheckOut();
    if (!inDate || !outDate || !this.hotelInfo?.dateBlocks) return false;

    return this.hotelInfo.dateBlocks.some(blk => {
      if (!blk.isBlocked) return false;
      if (blk.roomId && blk.roomId !== room.id) return false;
      // Overlap: start < outDate && end > inDate
      return blk.startDate < outDate && blk.endDate > inDate;
    });
  }

  getRoomStayDetails(room: HotelRoom): { effectiveNightlyRate: number; totalSoles: number; hasSpecialRate: boolean; seasonalReason?: string } {
    const inDate = this.searchCheckIn();
    const outDate = this.searchCheckOut();
    const nights = this.nightsCount();
    const baseRate = room.pricePerNightSoles;

    if (!inDate || !outDate || !this.hotelInfo?.dateBlocks || this.hotelInfo.dateBlocks.length === 0) {
      return {
        effectiveNightlyRate: baseRate,
        totalSoles: baseRate * nights,
        hasSpecialRate: false
      };
    }

    // Check if there is a special seasonal rate block (isBlocked === false)
    const specialBlock = this.hotelInfo.dateBlocks.find(blk => {
      if (blk.isBlocked) return false;
      if (blk.roomId && blk.roomId !== room.id) return false;
      return blk.startDate < outDate && blk.endDate > inDate && blk.priceOverrideSoles;
    });

    if (specialBlock && specialBlock.priceOverrideSoles) {
      const specialRate = specialBlock.priceOverrideSoles;
      return {
        effectiveNightlyRate: specialRate,
        totalSoles: specialRate * nights,
        hasSpecialRate: true,
        seasonalReason: specialBlock.reason
      };
    }

    return {
      effectiveNightlyRate: baseRate,
      totalSoles: baseRate * nights,
      hasSpecialRate: false
    };
  }

  filteredRooms = computed(() => {
    const rooms = this.hotelInfo?.rooms || [];
    const guests = this.searchGuests();
    const active = rooms.filter(r => r.isActive !== false);

    if (guests > 1) {
      const matching = active.filter(r => (r.capacityAdults || 2) >= guests);
      return matching.length > 0 ? matching : active;
    }
    return active;
  });

  roundUsd(soles: number): number {
    return Math.round(soles / 3.75);
  }

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
    const details = this.getRoomStayDetails(room);
    this.bookWithMercadoPago.emit({ room, amount: details.totalSoles });
  }

  getRoomWhatsAppUrl(room: HotelRoom): string {
    const details = this.getRoomStayDetails(room);
    const nights = this.nightsCount();
    const inDate = this.searchCheckIn();
    const outDate = this.searchCheckOut();
    const guests = this.searchGuests();
    const text = encodeURIComponent(
      `¡Hola! 👋 Deseo consultar disponibilidad para la *${this.getRoomTitle(room)}* en el *${this.hotelInfo?.name || 'Hotel Punto Clave'}*:\n` +
      `📅 Fechas: del ${inDate} al ${outDate} (${nights} ${nights === 1 ? 'noche' : 'noches'})\n` +
      `👥 Huéspedes: ${guests} persona(s)\n` +
      `💰 Tarifa total calculada: S/ ${details.totalSoles} (S/ ${details.effectiveNightlyRate}/noche)\n` +
      `¿Tienen disponibilidad para estas fechas?`
    );
    return `https://wa.me/${this.hotelInfo.whatsAppNumber}?text=${text}`;
  }
}
