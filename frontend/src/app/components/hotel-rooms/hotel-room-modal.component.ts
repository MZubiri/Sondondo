import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelRoom } from '../../models/hotel.model';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-hotel-room-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-dialog glass-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <div class="header-badges">
              <span class="badge badge-hotel">{{ ts.t('modal.hotelTitle') }}</span>
              <span class="badge badge-capacity">{{ room.capacityText }}</span>
            </div>
            <h3 class="modal-title">{{ getRoomTitle() }}</h3>
            <p class="modal-subtitle">{{ room.bedConfiguration }}</p>
          </div>
          <button class="close-btn" (click)="onClose()" [attr.aria-label]="ts.t('modal.close')">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Gallery -->
        <div class="modal-gallery">
          <div class="main-image-container">
            <img [src]="activeImage()" [alt]="getRoomTitle()" class="main-gallery-img" />
          </div>
          <div class="thumbnails-row">
            @for (img of room.gallery; track $index) {
              <button 
                type="button" 
                class="thumb-btn" 
                [class.active]="activeImage() === img"
                (click)="setActiveImage(img)">
                <img [src]="img" [alt]="getRoomTitle()" />
              </button>
            }
          </div>
        </div>

        <!-- Room Specs & Description -->
        <div class="modal-body">
          <div class="description-block">
            <h4>{{ ts.t('modal.descTitle') }}</h4>
            <p>{{ getRoomDesc() }}</p>
          </div>

          <!-- Key Amenities Grid -->
          <div class="amenities-block">
            <h4>{{ ts.t('modal.amenitiesTitle') }}</h4>
            <div class="amenities-grid">
              @for (item of room.amenities; track item) {
                <div class="amenity-item">
                  <app-icon name="check" [size]="16" stroke="var(--forest-900)"></app-icon>
                  <span>{{ item }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Policy notice -->
          <div class="policy-card">
            <div class="policy-item">
              <app-icon name="clock" [size]="18" stroke="var(--forest-900)"></app-icon>
              <div>
                <strong>{{ ts.t('modal.checkin') }}</strong> {{ ts.t('modal.checkinVal') }}
              </div>
            </div>
            <div class="policy-item">
              <app-icon name="clock" [size]="18" stroke="var(--forest-900)"></app-icon>
              <div>
                <strong>{{ ts.t('modal.checkout') }}</strong> {{ ts.t('modal.checkoutVal') }}
              </div>
            </div>
            <div class="policy-item">
              <app-icon name="shield-check" [size]="18" stroke="var(--forest-900)"></app-icon>
              <div>
                <strong>{{ ts.t('modal.security') }}</strong> {{ ts.t('modal.securityVal') }}
              </div>
            </div>
          </div>

          <!-- Price and Action Buttons (Direct on website & WhatsApp, No Booking.com) -->
          <div class="modal-actions-box">
            <div class="price-display">
              <span class="price-label">{{ ts.t('modal.ratePerNight') }}</span>
              <div class="price-figures">
                <span class="currency">S/</span>
                <span class="amount">{{ room.pricePerNightSoles }}</span>
                <span class="usd">(aprox. USD {{ room.pricePerNightUsd }})</span>
              </div>
            </div>

            <div class="actions-group">
              <button 
                type="button" 
                (click)="onPayMercadoPago()" 
                class="btn btn-primary action-btn">
                <app-icon name="credit-card" [size]="18" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('modal.payNowMp') }}</span>
              </button>

              <a 
                [href]="whatsAppUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-whatsapp action-btn">
                <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('modal.inquireWa') }}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 19, 43, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      width: 100%;
      max-width: 680px;
      max-height: 92vh;
      overflow-y: auto;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 1.75rem;
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .header-badges {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }

    .badge-hotel {
      background: rgba(27, 53, 39, 0.1);
      color: var(--forest-900);
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }

    .badge-capacity {
      background: rgba(199, 108, 62, 0.12);
      color: var(--accent-clay);
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 999px;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--earth-950);
      margin: 0;
    }

    .modal-subtitle {
      font-size: 0.9rem;
      color: var(--earth-700);
      margin: 0.2rem 0 0 0;
    }

    .close-btn {
      background: var(--cream-100);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xs);
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--earth-900);
      transition: var(--transition);
    }

    .close-btn:hover {
      background: var(--earth-200);
    }

    .modal-gallery {
      margin-bottom: 1.5rem;
    }

    .main-image-container {
      width: 100%;
      height: 320px;
      border-radius: var(--radius-sm);
      overflow: hidden;
      margin-bottom: 0.6rem;
      background: var(--earth-100);
    }

    .main-gallery-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .thumbnails-row {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .thumb-btn {
      width: 68px;
      height: 52px;
      border-radius: var(--radius-xs);
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      background: none;
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0.7;
      transition: var(--transition);
    }

    .thumb-btn.active, .thumb-btn:hover {
      opacity: 1;
      border-color: var(--forest-900);
    }

    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .description-block h4, .amenities-block h4 {
      font-size: 1.05rem;
      color: var(--earth-950);
      margin-bottom: 0.5rem;
    }

    .description-block p {
      font-size: 0.92rem;
      color: var(--earth-800);
      line-height: 1.65;
      margin-bottom: 1.25rem;
    }

    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.6rem 1rem;
      margin-bottom: 1.25rem;
    }

    .amenity-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--earth-900);
    }

    .policy-card {
      background: var(--cream-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1.15rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
      color: var(--earth-800);
    }

    .policy-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .modal-actions-box {
      background: var(--cream-100);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .price-display {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }

    .price-label {
      font-size: 0.88rem;
      color: var(--earth-700);
    }

    .price-figures {
      display: flex;
      align-items: baseline;
      gap: 0.25rem;
    }

    .currency {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--forest-900);
    }

    .amount {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--forest-900);
    }

    .usd {
      font-size: 0.85rem;
      color: var(--earth-600);
      margin-left: 0.35rem;
    }

    .actions-group {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .action-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      border-radius: var(--radius-sm);
    }

    @media (max-width: 600px) {
      .amenities-grid {
        grid-template-columns: 1fr;
      }
      .main-image-container {
        height: 220px;
      }
      .policy-card {
        flex-direction: column;
        gap: 0.6rem;
      }
    }
  `]
})
export class HotelRoomModalComponent {
  public ts = inject(TranslationService);
  @Input({ required: true }) room!: HotelRoom;
  @Input() whatsAppNumber: string = '51966380590';
  @Output() close = new EventEmitter<void>();
  @Output() payMercadoPago = new EventEmitter<HotelRoom>();

  activeImage = signal<string>('');

  ngOnInit(): void {
    if (this.room) {
      this.activeImage.set(this.room.mainImage);
    }
  }

  getRoomTitle(): string {
    if (!this.room) return '';
    if (this.room.id === 1) return this.ts.t('hotel.roomDouble');
    if (this.room.id === 2) return this.ts.t('hotel.roomTriple');
    if (this.room.id === 3) return this.ts.t('hotel.roomDuplex');
    return this.room.title;
  }

  getRoomDesc(): string {
    if (!this.room) return '';
    if (this.room.id === 1) return this.ts.t('hotel.roomDoubleDesc');
    if (this.room.id === 2) return this.ts.t('hotel.roomTripleDesc');
    if (this.room.id === 3) return this.ts.t('hotel.roomDuplexDesc');
    return this.room.description;
  }

  setActiveImage(img: string): void {
    this.activeImage.set(img);
  }

  get whatsAppUrl(): string {
    const text = encodeURIComponent(
      `¡Hola! 👋 Deseo consultar disponibilidad para la *${this.getRoomTitle()}* en el *Hotel Punto Clave* (S/ ${this.room.pricePerNightSoles}/noche). ¿Tienen fechas disponibles?`
    );
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }

  onPayMercadoPago(): void {
    this.payMercadoPago.emit(this.room);
  }

  onClose(): void {
    this.close.emit();
  }
}
