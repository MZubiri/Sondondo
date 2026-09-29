import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { HotelInfo, HotelRoom, HotelBooking, HotelAmenity, GalleryItem } from '../../models/admin.model';

@Component({
  selector: 'app-admin-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hotel-admin-page">
      <!-- HEADER -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badges">
            <span class="badge-gold">🏨 Hospedaje Oficial</span>
            <span class="badge-stars">
              ★ {{ hotelInfo().stars || 3 }} Estrellas
            </span>
          </div>
          <h1 class="page-title">{{ hotelInfo().name || 'Hotel Punto Clave' }} — Gestión de Hospedaje</h1>
          <p class="page-desc">Administra habitaciones, tarifas por noche, amenidades y reservas de huéspedes del hotel y alojamientos del circuito</p>
        </div>

        <div class="header-actions">
          <button type="button" class="btn-secondary" (click)="exportCsv()" title="Descargar reporte de reservas">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Exportar CSV</span>
          </button>

          <button type="button" class="btn-primary" (click)="openCreateRoomModal()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nueva Habitación</span>
          </button>

          <button type="button" class="btn-gold" (click)="openCreateBookingModal()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Registrar Reserva</span>
          </button>
        </div>
      </div>

      <!-- TOAST FEEDBACK -->
      <div *ngIf="toastMessage()" class="admin-toast">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <span>{{ toastMessage() }}</span>
      </div>

      <!-- STATS RIBBON (KPIs) -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap icon-blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 4v16"></path>
              <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
              <path d="M2 17h20"></path>
              <path d="M6 8v9"></path>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Total Habitaciones</span>
            <div class="stat-value-row">
              <strong class="stat-val">{{ totalRooms() }}</strong>
              <span class="stat-subval">({{ activeRoomsCount() }} activas en web)</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap icon-emerald">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Capacidad de Huéspedes</span>
            <div class="stat-value-row">
              <strong class="stat-val">{{ totalCapacityAdults() }}</strong>
              <span class="stat-subval">personas en simultáneo</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap icon-amber">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Tarifa Promedio / Noche</span>
            <div class="stat-value-row">
              <strong class="stat-val">S/ {{ avgNightlyRate() }}</strong>
              <span class="stat-subval">USD ~{{ avgNightlyRateUsd() }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap icon-purple">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Reservas de Hospedaje</span>
            <div class="stat-value-row">
              <strong class="stat-val">{{ totalBookingsCount() }}</strong>
              <span class="stat-pill-pending" *ngIf="pendingBookingsCount() > 0">
                {{ pendingBookingsCount() }} pendientes
              </span>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrap icon-gold">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-data">
            <span class="stat-label">Ingresos Recaudados</span>
            <div class="stat-value-row">
              <strong class="stat-val">S/ {{ totalRevenueSoles() }}</strong>
              <span class="stat-subval">Pagos en hospedaje</span>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN NAVIGATION TABS -->
      <div class="admin-tabs">
        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'rooms'"
          (click)="activeTab.set('rooms')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 4v16"></path>
            <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
            <path d="M2 17h20"></path>
            <path d="M6 8v9"></path>
          </svg>
          <span>Habitaciones & Tarifas ({{ totalRooms() }})</span>
        </button>

        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'bookings'"
          (click)="activeTab.set('bookings')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Reservas & Huéspedes ({{ totalBookingsCount() }})</span>
          <span class="tab-badge" *ngIf="pendingBookingsCount() > 0">{{ pendingBookingsCount() }}</span>
        </button>

        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'profile'"
          (click)="activeTab.set('profile')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          <span>Perfil del Hotel & Políticas</span>
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: HABITACIONES & TARIFAS              -->
      <!-- ========================================== -->
      <section *ngIf="activeTab() === 'rooms'" class="tab-content">
        <!-- FILTER BAR -->
        <div class="filters-bar">
          <div class="filter-pills">
            <button 
              type="button" 
              class="pill" 
              [class.active]="roomsFilter() === 'all'"
              (click)="roomsFilter.set('all')"
            >
              Todas ({{ totalRooms() }})
            </button>
            <button 
              type="button" 
              class="pill pill-green" 
              [class.active]="roomsFilter() === 'active'"
              (click)="roomsFilter.set('active')"
            >
              🟢 Activas en Web ({{ activeRoomsCount() }})
            </button>
            <button 
              type="button" 
              class="pill pill-amber" 
              [class.active]="roomsFilter() === 'hidden'"
              (click)="roomsFilter.set('hidden')"
            >
              ⏸️ En Mantenimiento / Pausadas ({{ hiddenRoomsCount() }})
            </button>
          </div>

          <div class="filter-hint">
            <span>💡 Las habitaciones marcadas como <strong>Activas</strong> se sincronizan automáticamente con la sección de reserva y pasarela de pago del portal público.</span>
          </div>
        </div>

        <!-- ROOMS GRID -->
        <div class="rooms-grid">
          <div 
            *ngFor="let room of filteredRooms()" 
            class="room-card glass-panel"
            [class.room-paused]="room.isActive === false"
          >
            <!-- Room Image & Overlay -->
            <div class="room-media-wrap" (click)="openRoomGallery(room)">
              <img [src]="room.mainImage" [alt]="room.title" class="room-img" onerror="this.src='/assets/images/hero_sondondo.jpg'" />
              
              <div class="room-badge-top">
                <span class="capacity-tag">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <span>{{ room.capacityText }}</span>
                </span>

                <span *ngIf="room.isActive === false" class="paused-tag">Pausada / Oculta</span>
                <span *ngIf="room.isActive !== false" class="active-tag">En Línea</span>
              </div>

              <div class="hover-photo-hint">
                <span>🔍 Ver galería ({{ room.gallery.length }} fotos)</span>
              </div>
            </div>

            <!-- Content -->
            <div class="room-body">
              <div class="room-title-row">
                <div>
                  <h3 class="room-title">{{ room.title }}</h3>
                  <span class="room-bed-cfg">{{ room.bedConfiguration }}</span>
                </div>
                <div class="room-rates">
                  <span class="rate-soles">S/ {{ room.pricePerNightSoles }}</span>
                  <span class="rate-usd">~USD {{ room.pricePerNightUsd }}</span>
                  <span class="rate-unit">por noche</span>
                </div>
              </div>

              <p class="room-desc-short">{{ room.shortDescription }}</p>

              <!-- Highlights chips -->
              <div class="room-highlights-row">
                <span *ngFor="let h of room.highlights" class="hl-chip">✓ {{ h }}</span>
              </div>

              <!-- Meta info footer -->
              <div class="room-meta-info">
                <span class="meta-item" *ngIf="room.floorOrZone">
                  <strong>Ubicación:</strong> {{ room.floorOrZone }}
                </span>
                <span class="meta-item">
                  <strong>Unidades:</strong> {{ room.totalUnits || 1 }} hab.
                </span>
                <span class="meta-item">
                  <strong>Amenidades:</strong> {{ room.amenities.length }} incluidas
                </span>
              </div>

              <!-- Actions row -->
              <div class="room-actions-row">
                <button 
                  type="button" 
                  class="btn-toggle-active" 
                  [class.btn-paused]="room.isActive === false"
                  (click)="onToggleRoomActive(room.id)"
                  [title]="room.isActive === false ? 'Habilitar en web' : 'Pausar habitación temporalmente'"
                >
                  <span *ngIf="room.isActive !== false">⏸️ Pausar</span>
                  <span *ngIf="room.isActive === false">▶ Publicar</span>
                </button>

                <div class="right-buttons">
                  <button type="button" class="btn-action-edit" (click)="openEditRoomModal(room)" title="Editar datos y precios">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Editar</span>
                  </button>

                  <button type="button" class="btn-action-delete" (click)="onDeleteRoom(room.id)" title="Eliminar habitación">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- TAB 2: RESERVAS DE HOSPEDAJE               -->
      <!-- ========================================== -->
      <section *ngIf="activeTab() === 'bookings'" class="tab-content">
        <!-- FILTER BAR & SEARCH -->
        <div class="bookings-control-bar">
          <div class="filter-pills">
            <button 
              type="button" 
              class="pill" 
              [class.active]="bookingStatusFilter() === 'all'"
              (click)="bookingStatusFilter.set('all')"
            >
              Todas ({{ totalBookingsCount() }})
            </button>
            <button 
              type="button" 
              class="pill pill-amber" 
              [class.active]="bookingStatusFilter() === 'Pending'"
              (click)="bookingStatusFilter.set('Pending')"
            >
              🟡 Pendientes ({{ pendingBookingsCount() }})
            </button>
            <button 
              type="button" 
              class="pill pill-green" 
              [class.active]="bookingStatusFilter() === 'Confirmed'"
              (click)="bookingStatusFilter.set('Confirmed')"
            >
              🟢 Confirmadas
            </button>
            <button 
              type="button" 
              class="pill pill-blue" 
              [class.active]="bookingStatusFilter() === 'CheckedIn'"
              (click)="bookingStatusFilter.set('CheckedIn')"
            >
              🏨 En Estadía
            </button>
            <button 
              type="button" 
              class="pill" 
              [class.active]="bookingStatusFilter() === 'Completed'"
              (click)="bookingStatusFilter.set('Completed')"
            >
              ✓ Finalizadas
            </button>
            <button 
              type="button" 
              class="pill pill-red" 
              [class.active]="bookingStatusFilter() === 'Cancelled'"
              (click)="bookingStatusFilter.set('Cancelled')"
            >
              ❌ Canceladas
            </button>
          </div>

          <div class="search-wrap">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="searchBookingQuery" 
              placeholder="Buscar huésped, voucher, teléfono o habitación..."
            />
          </div>
        </div>

        <!-- TABLE OF BOOKINGS -->
        <div class="table-card glass-panel">
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Voucher / Fecha</th>
                  <th>Huésped & Contacto</th>
                  <th>Habitación</th>
                  <th>Check-In / Out</th>
                  <th>Noches</th>
                  <th>Huéspedes</th>
                  <th>Total & Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of filteredBookings()">
                  <!-- Voucher & Date -->
                  <td>
                    <div class="voucher-box">
                      <span class="voucher-code">{{ b.voucherCode }}</span>
                      <span class="created-at">{{ b.createdAt | date:'shortDate' }}</span>
                    </div>
                  </td>

                  <!-- Guest -->
                  <td>
                    <div class="guest-info-box">
                      <strong class="guest-name">{{ b.guestName }}</strong>
                      <span class="guest-doc" *ngIf="b.guestDocumentNumber">{{ b.guestDocumentType || 'DNI' }}: {{ b.guestDocumentNumber }}</span>
                      <span class="guest-contact">📞 {{ b.guestPhone }}</span>
                      <span class="guest-contact" *ngIf="b.guestEmail">✉️ {{ b.guestEmail }}</span>
                    </div>
                  </td>

                  <!-- Room -->
                  <td>
                    <span class="table-room-name">{{ b.roomTitle }}</span>
                  </td>

                  <!-- Checkin / Checkout -->
                  <td>
                    <div class="dates-box">
                      <span class="date-in">📥 In: {{ b.checkInDate }}</span>
                      <span class="date-out">📤 Out: {{ b.checkOutDate }}</span>
                    </div>
                  </td>

                  <!-- Nights -->
                  <td>
                    <span class="nights-pill">{{ b.nights }} noche(s)</span>
                  </td>

                  <!-- Guests -->
                  <td>
                    <span class="guest-count">👥 {{ b.numberOfGuests }}</span>
                  </td>

                  <!-- Total & Payment -->
                  <td>
                    <div class="pay-info-box">
                      <span class="total-amount">S/ {{ b.totalPriceSoles }}</span>
                      <span 
                        class="pay-status-tag"
                        [class.tag-paid]="b.paymentStatus === 'Pagado 100%'"
                        [class.tag-half]="b.paymentStatus === 'Adelanto 50%'"
                        [class.tag-pending]="!b.paymentStatus || b.paymentStatus === 'Pendiente'"
                      >
                        {{ b.paymentStatus || 'Pendiente' }}
                      </span>
                      <span class="pay-method" *ngIf="b.paymentMethod">💳 {{ b.paymentMethod }}</span>
                    </div>
                  </td>

                  <!-- Status Selector -->
                  <td>
                    <select 
                      [ngModel]="b.status" 
                      (ngModelChange)="onUpdateBookingStatus(b.id, $event)"
                      class="status-select"
                      [class.st-pending]="b.status === 'Pending'"
                      [class.st-confirmed]="b.status === 'Confirmed'"
                      [class.st-checkin]="b.status === 'CheckedIn'"
                      [class.st-completed]="b.status === 'Completed'"
                      [class.st-cancelled]="b.status === 'Cancelled'"
                    >
                      <option value="Pending">🟡 Pendiente</option>
                      <option value="Confirmed">🟢 Confirmada</option>
                      <option value="CheckedIn">🏨 En Estadía</option>
                      <option value="Completed">✓ Finalizada</option>
                      <option value="Cancelled">❌ Cancelada</option>
                    </select>
                  </td>

                  <!-- Actions -->
                  <td>
                    <div class="row-actions">
                      <a 
                        [href]="b.whatsAppDirectUrl" 
                        target="_blank" 
                        rel="noopener" 
                        class="btn-wa-direct"
                        title="Abrir WhatsApp para coordinar con el huésped"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/>
                        </svg>
                      </a>

                      <button type="button" class="btn-edit-sm" (click)="openEditBookingModal(b)" title="Editar reserva">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>

                      <button type="button" class="btn-del-sm" (click)="onDeleteBooking(b.id)" title="Eliminar reserva">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredBookings().length === 0">
                  <td colspan="9" class="empty-state">
                    <div class="empty-box">
                      <span>📭 No se encontraron reservas con los filtros aplicados.</span>
                      <button type="button" class="btn-secondary-sm" (click)="openCreateBookingModal()">
                        Registrar una nueva reserva manual
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- TAB 3: PERFIL DEL HOTEL & POLÍTICAS        -->
      <!-- ========================================== -->
      <section *ngIf="activeTab() === 'profile'" class="tab-content">
        <div class="hotel-profile-card glass-panel">
          <div class="profile-header">
            <div>
              <h2 class="profile-title">Ficha Oficial de Alojamiento</h2>
              <p class="profile-subtitle">Modifica la información corporativa, ubicación, amenidades generales y horarios del hotel visibles en la web</p>
            </div>
            <button type="button" class="btn-primary" (click)="onSaveHotelProfile()">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              <span>Guardar Cambios del Hotel</span>
            </button>
          </div>

          <form class="hotel-form" (ngSubmit)="onSaveHotelProfile()">
            <div class="form-row-2">
              <div class="form-group">
                <label>Nombre Comercial del Hotel *</label>
                <input type="text" [(ngModel)]="profileName" name="profileName" required />
              </div>

              <div class="form-group">
                <label>Categoría Estrellas (1 - 5)</label>
                <select [(ngModel)]="profileStars" name="profileStars">
                  <option [ngValue]="1">★ 1 Estrella</option>
                  <option [ngValue]="2">★★ 2 Estrellas</option>
                  <option [ngValue]="3">★★★ 3 Estrellas (Recomendado)</option>
                  <option [ngValue]="4">★★★★ 4 Estrellas</option>
                  <option [ngValue]="5">★★★★★ 5 Estrellas</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Lema / Tagline de Bienvenida</label>
              <input type="text" [(ngModel)]="profileTagline" name="profileTagline" placeholder="Ej: Alojamiento oficial y descanso confortable con balcón privado..." />
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label>Dirección</label>
                <input type="text" [(ngModel)]="profileAddress" name="profileAddress" />
              </div>
              <div class="form-group">
                <label>Ciudad / Región</label>
                <input type="text" [(ngModel)]="profileCity" name="profileCity" />
              </div>
              <div class="form-group">
                <label>Código Postal</label>
                <input type="text" [(ngModel)]="profilePostalCode" name="profilePostalCode" />
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label>WhatsApp de Contacto Oficial</label>
                <input type="text" [(ngModel)]="profileWhatsApp" name="profileWhatsApp" placeholder="Ej: 51966380590" />
              </div>
              <div class="form-group">
                <label>Horario Check-In</label>
                <input type="text" [(ngModel)]="profileCheckIn" name="profileCheckIn" placeholder="Ej: A partir de las 13:00 hrs" />
              </div>
              <div class="form-group">
                <label>Horario Check-Out</label>
                <input type="text" [(ngModel)]="profileCheckOut" name="profileCheckOut" placeholder="Ej: Hasta las 12:00 hrs" />
              </div>
            </div>

            <div class="form-group">
              <label>Descripción General del Hotel</label>
              <textarea [(ngModel)]="profileDescription" name="profileDescription" rows="4"></textarea>
            </div>

            <!-- Featured Amenities Editor -->
            <div class="amenities-management-section">
              <div class="amenities-header">
                <div>
                  <h3 class="amenities-title">Amenidades Destacadas del Establecimiento</h3>
                  <p class="amenities-desc">Servicios clave que aparecen en la cinta superior de la página web</p>
                </div>
                <button type="button" class="btn-secondary-sm" (click)="addAmenityField()">
                  + Agregar Amenidad
                </button>
              </div>

              <div class="amenities-list-editor">
                <div *ngFor="let am of profileAmenities; let i = index" class="amenity-editor-row">
                  <input type="text" [(ngModel)]="am.name" [name]="'am_name_' + i" placeholder="Nombre (ej. WiFi Gratis)" class="am-name-input" />
                  <input type="text" [(ngModel)]="am.description" [name]="'am_desc_' + i" placeholder="Descripción breve" class="am-desc-input" />
                  <button type="button" class="btn-remove-am" (click)="removeAmenity(i)">×</button>
                </div>
              </div>
            </div>

            <div class="form-footer-actions">
              <button type="submit" class="btn-primary">
                Guardar y Sincronizar Ficha
              </button>
            </div>
          </form>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- MODAL 1: HABITACIÓN (CREAR / EDITAR)       -->
      <!-- ========================================== -->
      <div class="modal-backdrop" *ngIf="showRoomModal()" (click)="closeRoomModal()">
        <div class="modal-card glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="modal-kicker">{{ editingRoomId ? 'Edición de Habitación' : 'Nueva Habitación' }}</span>
              <h2 class="modal-heading">{{ roomForm.title || 'Detalles de Habitación' }}</h2>
            </div>
            <button class="btn-close" (click)="closeRoomModal()">×</button>
          </div>

          <form class="modal-form-body" (ngSubmit)="onSaveRoom()">
            <div class="form-row-2">
              <div class="form-group">
                <label>Nombre / Tipo de Habitación *</label>
                <input type="text" [(ngModel)]="roomForm.title" name="roomTitle" required placeholder="Ej: Habitación Matrimonial Deluxe" />
              </div>
              <div class="form-group">
                <label>Slug URL (automático o personalizado)</label>
                <input type="text" [(ngModel)]="roomForm.slug" name="roomSlug" placeholder="ej: habitacion-matrimonial-deluxe" />
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label>Capacidad Texto</label>
                <input type="text" [(ngModel)]="roomForm.capacityText" name="capacityText" placeholder="Ej: 2 Adultos o Hasta 4 Huéspedes" />
              </div>
              <div class="form-group">
                <label>Capacidad Máx. Adultos</label>
                <input type="number" [(ngModel)]="roomForm.capacityAdults" name="capacityAdults" min="1" max="10" />
              </div>
              <div class="form-group">
                <label>Distribución de Camas</label>
                <input type="text" [(ngModel)]="roomForm.bedConfiguration" name="bedConfiguration" placeholder="Ej: 1 Cama Doble Matrimonial" />
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label>Tarifa Soles (S/ por noche) *</label>
                <input type="number" [(ngModel)]="roomForm.pricePerNightSoles" name="priceSoles" min="1" step="0.5" required (ngModelChange)="autoCalcUsd()" />
              </div>
              <div class="form-group">
                <label>Tarifa Dólares (USD por noche)</label>
                <input type="number" [(ngModel)]="roomForm.pricePerNightUsd" name="priceUsd" min="1" step="0.5" />
              </div>
              <div class="form-group">
                <label>Unidades Disponibles de este tipo</label>
                <input type="number" [(ngModel)]="roomForm.totalUnits" name="totalUnits" min="1" />
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Piso / Zona</label>
                <input type="text" [(ngModel)]="roomForm.floorOrZone" name="floorOrZone" placeholder="Ej: Piso 1 con balcón" />
              </div>
              <div class="form-group">
                <label>Estado en Página Web</label>
                <div class="toggle-group">
                  <label class="toggle-label">
                    <input type="checkbox" [(ngModel)]="roomForm.isActive" name="roomIsActive" />
                    <span>Publicada y disponible para reservas</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Descripción Corta (tarjeta web)</label>
              <input type="text" [(ngModel)]="roomForm.shortDescription" name="shortDesc" placeholder="Resumen conciso para la vista en tarjeta" />
            </div>

            <div class="form-group">
              <label>Descripción Detallada</label>
              <textarea [(ngModel)]="roomForm.description" name="roomDesc" rows="3" placeholder="Detalle completo de comodidades, ambiente y confort..."></textarea>
            </div>

            <!-- Image & Gallery Management -->
            <div class="form-group">
              <label>Imagen Principal (URL)</label>
              <div class="input-with-preview">
                <input type="text" [(ngModel)]="roomForm.mainImage" name="mainImage" placeholder="/assets/images/hotel/room_double.jpg" />
                <div class="main-thumb-preview" *ngIf="roomForm.mainImage">
                  <img [src]="roomForm.mainImage" alt="Preview" onerror="this.src='/assets/images/hero_sondondo.jpg'" />
                </div>
              </div>
              <div class="quick-img-suggestions">
                <span>Imágenes sugeridas:</span>
                <button type="button" class="btn-sugg" (click)="roomForm.mainImage = '/assets/images/hotel/room_double.jpg'">Hab. Doble</button>
                <button type="button" class="btn-sugg" (click)="roomForm.mainImage = '/assets/images/hotel/room_triple.jpg'">Hab. Triple</button>
                <button type="button" class="btn-sugg" (click)="roomForm.mainImage = '/assets/images/hotel/room_duplex.jpg'">Dúplex</button>
                <button type="button" class="btn-sugg" (click)="roomForm.mainImage = '/assets/images/hotel/hotel_terrace.jpg'">Terraza</button>
                <button type="button" class="btn-sugg" (click)="roomForm.mainImage = '/assets/images/hotel/hotel_bathroom.jpg'">Baño/Jacuzzi</button>
              </div>
            </div>

            <!-- Gallery Images list -->
            <div class="form-group">
              <label>Galería Fotográfica ({{ roomForm.gallery.length }} imágenes)</label>
              <div class="gallery-thumbs-editor">
                <div *ngFor="let img of roomForm.gallery; let i = index" class="gallery-thumb-item">
                  <img [src]="img" alt="Gallery image" onerror="this.src='/assets/images/hero_sondondo.jpg'" />
                  <button type="button" class="btn-del-thumb" (click)="removeGalleryImg(i)">×</button>
                </div>
              </div>

              <div class="add-img-row">
                <input type="text" [(ngModel)]="newGalleryImgUrl" name="newGalleryImg" placeholder="Pegar URL de foto o /assets/images/hotel/..." />
                <button type="button" class="btn-secondary-sm" (click)="addGalleryImg()">+ Agregar a Galería</button>
              </div>
            </div>

            <!-- Highlights Chips -->
            <div class="form-group">
              <label>Puntos Destacados (Highlights visibles en tarjeta)</label>
              <div class="chips-editor-box">
                <span *ngFor="let hl of roomForm.highlights; let i = index" class="editable-chip">
                  {{ hl }}
                  <button type="button" (click)="removeHighlight(i)">×</button>
                </span>
              </div>
              <div class="add-chip-row">
                <input type="text" [(ngModel)]="newHighlightText" name="newHl" placeholder="Ej: Balcón privado con vista" (keyup.enter)="addHighlight()" />
                <button type="button" class="btn-secondary-sm" (click)="addHighlight()">+ Agregar Highlight</button>
              </div>
            </div>

            <!-- Amenities list -->
            <div class="form-group">
              <label>Amenidades Incluidas en la Habitación</label>
              <div class="amenities-checkboxes-grid">
                <label *ngFor="let am of popularAmenities" class="am-check-label">
                  <input 
                    type="checkbox" 
                    [checked]="hasAmenity(am)" 
                    (change)="toggleAmenity(am)" 
                  />
                  <span>{{ am }}</span>
                </label>
              </div>
            </div>

            <div class="modal-footer-actions">
              <button type="button" class="btn-secondary" (click)="closeRoomModal()">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingRoomId ? 'Actualizar Habitación' : 'Crear Habitación' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL 2: RESERVA (CREAR / EDITAR)          -->
      <!-- ========================================== -->
      <div class="modal-backdrop" *ngIf="showBookingModal()" (click)="closeBookingModal()">
        <div class="modal-card glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="modal-kicker">{{ editingBookingId ? 'Gestión de Reserva' : 'Nueva Reserva de Hospedaje' }}</span>
              <h2 class="modal-heading">{{ bookingForm.voucherCode || 'Ficha de Alojamiento' }}</h2>
            </div>
            <button class="btn-close" (click)="closeBookingModal()">×</button>
          </div>

          <form class="modal-form-body" (ngSubmit)="onSaveBooking()">
            <div class="form-section-title">Datos del Huésped</div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Nombre y Apellidos *</label>
                <input type="text" [(ngModel)]="bookingForm.guestName" name="guestName" required placeholder="Ej: Mariana Silva Gómez" />
              </div>
              <div class="form-group">
                <label>Teléfono / WhatsApp *</label>
                <input type="text" [(ngModel)]="bookingForm.guestPhone" name="guestPhone" required placeholder="Ej: +51 984 123 456" />
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" [(ngModel)]="bookingForm.guestEmail" name="guestEmail" placeholder="correo@ejemplo.com" />
              </div>
              <div class="form-group">
                <label>Tipo Documento</label>
                <select [(ngModel)]="bookingForm.guestDocumentType" name="guestDocType">
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Carnet Ext.">Carnet Extranjería</option>
                </select>
              </div>
              <div class="form-group">
                <label>N° Documento</label>
                <input type="text" [(ngModel)]="bookingForm.guestDocumentNumber" name="guestDocNum" placeholder="45892104" />
              </div>
            </div>

            <div class="form-section-title">Detalles de la Estadía</div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Habitación Seleccionada *</label>
                <select [(ngModel)]="bookingForm.roomId" name="roomId" required (ngModelChange)="onBookingRoomChanged($event)">
                  <option *ngFor="let r of allRooms()" [ngValue]="r.id">
                    {{ r.title }} — S/ {{ r.pricePerNightSoles }}/noche ({{ r.capacityText }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Número de Huéspedes</label>
                <input type="number" [(ngModel)]="bookingForm.numberOfGuests" name="numGuests" min="1" max="10" />
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label>Fecha Check-In *</label>
                <input type="date" [(ngModel)]="bookingForm.checkInDate" name="checkInDate" required (ngModelChange)="calcNightsAndTotal()" />
              </div>
              <div class="form-group">
                <label>Fecha Check-Out *</label>
                <input type="date" [(ngModel)]="bookingForm.checkOutDate" name="checkOutDate" required (ngModelChange)="calcNightsAndTotal()" />
              </div>
              <div class="form-group">
                <label>Noches Calculadas</label>
                <input type="number" [(ngModel)]="bookingForm.nights" name="nights" min="1" (ngModelChange)="recalcTotalFromNights()" />
              </div>
            </div>

            <div class="form-section-title">Importes y Estado de Pago</div>

            <div class="form-row-3">
              <div class="form-group">
                <label>Importe Total (S/) *</label>
                <input type="number" [(ngModel)]="bookingForm.totalPriceSoles" name="totalSoles" min="0" step="0.5" required />
              </div>
              <div class="form-group">
                <label>Monto Pagado / Adelanto (S/)</label>
                <input type="number" [(ngModel)]="bookingForm.paidAmountSoles" name="paidSoles" min="0" step="0.5" />
              </div>
              <div class="form-group">
                <label>Estado de Pago</label>
                <select [(ngModel)]="bookingForm.paymentStatus" name="paymentStatus">
                  <option value="Pendiente">Pendiente de Pago</option>
                  <option value="Adelanto 50%">Adelanto 50%</option>
                  <option value="Pagado 100%">Pagado 100% (Liquidado)</option>
                  <option value="Reembolsado">Reembolsado</option>
                </select>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Método de Pago</label>
                <select [(ngModel)]="bookingForm.paymentMethod" name="paymentMethod">
                  <option value="MercadoPago">MercadoPago (Tarjeta/Online)</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Transferencia BCP">Transferencia BCP</option>
                  <option value="Banco de la Nación">Banco de la Nación</option>
                  <option value="Efectivo">Efectivo en Recepción</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>
              <div class="form-group">
                <label>Estado de la Reserva</label>
                <select [(ngModel)]="bookingForm.status" name="bookingStatus">
                  <option value="Pending">🟡 Pendiente de Confirmación</option>
                  <option value="Confirmed">🟢 Confirmada</option>
                  <option value="CheckedIn">🏨 En Estadía (Check-in Realizado)</option>
                  <option value="Completed">✓ Finalizada (Check-out)</option>
                  <option value="Cancelled">❌ Cancelada</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Peticiones Especiales / Notas Internas</label>
              <textarea [(ngModel)]="bookingForm.specialRequests" name="specialReq" rows="2" placeholder="Ej: Solicita cuna para bebé, late check-in a las 22:00, etc."></textarea>
            </div>

            <div class="modal-footer-actions">
              <button type="button" class="btn-secondary" (click)="closeBookingModal()">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingBookingId ? 'Guardar Cambios de Reserva' : 'Crear Reserva' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL 3: LIGHTBOX GALERÍA DE HABITACIÓN    -->
      <!-- ========================================== -->
      <div class="modal-backdrop" *ngIf="activeGalleryRoom()" (click)="activeGalleryRoom.set(null)">
        <div class="gallery-lightbox glass-modal" (click)="$event.stopPropagation()">
          <div class="lightbox-header">
            <div>
              <h3>{{ activeGalleryRoom()?.title }}</h3>
              <p>{{ activeGalleryRoom()?.bedConfiguration }} • S/ {{ activeGalleryRoom()?.pricePerNightSoles }} por noche</p>
            </div>
            <button class="btn-close" (click)="activeGalleryRoom.set(null)">×</button>
          </div>

          <div class="lightbox-main">
            <img [src]="activeLightboxImg()" [alt]="activeGalleryRoom()?.title" class="lightbox-hero" />
          </div>

          <div class="lightbox-thumbs">
            <button 
              *ngFor="let img of activeGalleryRoom()?.gallery" 
              type="button" 
              class="lb-thumb"
              [class.active]="activeLightboxImg() === img"
              (click)="activeLightboxImg.set(img)"
            >
              <img [src]="img" alt="Foto habitación" />
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      color: #f1f5f9;
      font-family: inherit;
    }

    .hotel-admin-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* HEADER */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .header-badges {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }

    .badge-gold {
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid rgba(224, 159, 62, 0.35);
      color: #e09f3e;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-stars {
      background: rgba(241, 196, 15, 0.15);
      border: 1px solid rgba(241, 196, 15, 0.35);
      color: #f1c40f;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.02em;
      margin: 0 0 0.4rem;
    }

    .page-desc {
      font-size: 0.9rem;
      color: #94a3b8;
      margin: 0;
      max-width: 700px;
      line-height: 1.5;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    /* BUTTONS */
    .btn-primary, .btn-secondary, .btn-gold {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      border: none;
    }

    .btn-primary {
      background: #c85a32;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(200, 90, 50, 0.3);
    }

    .btn-primary:hover {
      background: #b54e28;
      transform: translateY(-1px);
    }

    .btn-gold {
      background: #e09f3e;
      color: #0b1216;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(224, 159, 62, 0.25);
    }

    .btn-gold:hover {
      background: #cf8e30;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.09);
      color: #ffffff;
    }

    .btn-secondary-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      cursor: pointer;
    }

    .btn-secondary-sm:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    /* TOAST */
    .admin-toast {
      background: #064e3b;
      border: 1px solid #10b981;
      color: #ecfdf5;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-size: 0.88rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      animation: fadeIn 0.3s ease;
    }

    /* KPIS STATS RIBBON */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: #0e171e;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 1.15rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }

    .stat-card:hover {
      border-color: rgba(224, 159, 62, 0.3);
      transform: translateY(-2px);
    }

    .stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-blue { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
    .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .icon-amber { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .icon-purple { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .icon-gold { background: rgba(224, 159, 62, 0.15); color: #e09f3e; }

    .stat-data {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #94a3b8;
      font-weight: 600;
    }

    .stat-value-row {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .stat-val {
      font-size: 1.35rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.01em;
    }

    .stat-subval {
      font-size: 0.72rem;
      color: #64748b;
    }

    .stat-pill-pending {
      font-size: 0.7rem;
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      padding: 0.15rem 0.45rem;
      border-radius: 6px;
      font-weight: 600;
    }

    /* TABS */
    .admin-tabs {
      display: flex;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.75rem;
      overflow-x: auto;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.85rem 1.25rem;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: #94a3b8;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .tab-btn:hover {
      color: #f8fafc;
      background: rgba(255, 255, 255, 0.02);
    }

    .tab-btn.active {
      color: #e09f3e;
      border-bottom-color: #e09f3e;
    }

    .tab-badge {
      background: #c85a32;
      color: #ffffff;
      font-size: 0.7rem;
      padding: 0.1rem 0.4rem;
      border-radius: 999px;
      font-weight: 700;
    }

    /* FILTER BAR */
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-pills {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pill:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #f1f5f9;
    }

    .pill.active {
      background: #c85a32;
      border-color: #c85a32;
      color: #ffffff;
    }

    .filter-hint {
      font-size: 0.8rem;
      color: #64748b;
    }

    /* ROOMS GRID */
    .rooms-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 1.5rem;
    }

    .room-card {
      background: #0e171e;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .room-card:hover {
      border-color: rgba(224, 159, 62, 0.35);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }

    .room-card.room-paused {
      opacity: 0.7;
      border-color: rgba(245, 158, 11, 0.25);
    }

    .room-media-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      overflow: hidden;
      cursor: pointer;
      background: #05090c;
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

    .room-badge-top {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      right: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
    }

    .capacity-tag {
      background: rgba(11, 18, 22, 0.85);
      backdrop-filter: blur(4px);
      color: #f1f5f9;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .active-tag {
      background: rgba(16, 185, 129, 0.9);
      color: #ffffff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .paused-tag {
      background: rgba(245, 158, 11, 0.9);
      color: #0b1216;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.55rem;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .hover-photo-hint {
      position: absolute;
      inset: 0;
      background: rgba(11, 18, 22, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
      font-size: 0.85rem;
      font-weight: 600;
      color: #ffffff;
    }

    .room-media-wrap:hover .hover-photo-hint {
      opacity: 1;
    }

    .room-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 0.85rem;
    }

    .room-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .room-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      line-height: 1.3;
    }

    .room-bed-cfg {
      font-size: 0.78rem;
      color: #e09f3e;
      font-weight: 600;
      display: block;
      margin-top: 0.2rem;
    }

    .room-rates {
      text-align: right;
      display: flex;
      flex-direction: column;
      line-height: 1.1;
      flex-shrink: 0;
    }

    .rate-soles {
      font-size: 1.25rem;
      font-weight: 800;
      color: #f8fafc;
    }

    .rate-usd {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .rate-unit {
      font-size: 0.68rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .room-desc-short {
      font-size: 0.84rem;
      color: #94a3b8;
      line-height: 1.45;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .room-highlights-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    .hl-chip {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      font-size: 0.72rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
    }

    .room-meta-info {
      font-size: 0.75rem;
      color: #64748b;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.5rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .room-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      gap: 0.5rem;
    }

    .btn-toggle-active {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-toggle-active.btn-paused {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.3);
      color: #fbbf24;
    }

    .right-buttons {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-action-edit {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-action-edit:hover {
      background: rgba(224, 159, 62, 0.15);
      border-color: #e09f3e;
      color: #e09f3e;
    }

    .btn-action-delete {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 0.35rem 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-action-delete:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* BOOKINGS TAB */
    .bookings-control-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .search-wrap {
      position: relative;
      width: 320px;
    }

    .search-wrap svg {
      position: absolute;
      left: 0.85rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .search-wrap input {
      width: 100%;
      background: #0e171e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
      padding: 0.55rem 0.85rem 0.55rem 2.4rem;
      border-radius: 8px;
      font-size: 0.85rem;
      outline: none;
    }

    .search-wrap input:focus {
      border-color: #e09f3e;
    }

    .table-card {
      background: #0e171e;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }

    .data-table th {
      background: rgba(255, 255, 255, 0.02);
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.05em;
      padding: 0.85rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      white-space: nowrap;
    }

    .data-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .voucher-box {
      display: flex;
      flex-direction: column;
    }

    .voucher-code {
      font-weight: 700;
      color: #e09f3e;
      font-family: monospace;
      font-size: 0.85rem;
    }

    .created-at {
      font-size: 0.72rem;
      color: #64748b;
    }

    .guest-info-box {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
    }

    .guest-name {
      font-weight: 700;
      color: #f8fafc;
    }

    .guest-doc, .guest-contact {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .table-room-name {
      font-weight: 600;
      color: #f1f5f9;
    }

    .dates-box {
      display: flex;
      flex-direction: column;
      font-size: 0.78rem;
      font-family: monospace;
      gap: 0.15rem;
    }

    .date-in { color: #34d399; }
    .date-out { color: #f87171; }

    .nights-pill {
      background: rgba(255, 255, 255, 0.06);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.78rem;
      color: #cbd5e1;
      font-weight: 600;
      white-space: nowrap;
    }

    .pay-info-box {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .total-amount {
      font-weight: 800;
      color: #f8fafc;
    }

    .pay-status-tag {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.1rem 0.45rem;
      border-radius: 4px;
      width: fit-content;
    }

    .tag-paid { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .tag-half { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
    .tag-pending { background: rgba(239, 68, 68, 0.15); color: #f87171; }

    .pay-method {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .status-select {
      background: #090f13;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }

    .status-select.st-pending { color: #fbbf24; border-color: rgba(245, 158, 11, 0.4); }
    .status-select.st-confirmed { color: #34d399; border-color: rgba(16, 185, 129, 0.4); }
    .status-select.st-checkin { color: #60a5fa; border-color: rgba(59, 130, 246, 0.4); }
    .status-select.st-completed { color: #cbd5e1; }
    .status-select.st-cancelled { color: #f87171; border-color: rgba(239, 68, 68, 0.4); }

    .row-actions {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-wa-direct {
      background: rgba(37, 211, 102, 0.15);
      border: 1px solid rgba(37, 211, 102, 0.3);
      color: #25d366;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-wa-direct:hover {
      background: #25d366;
      color: #ffffff;
    }

    .btn-edit-sm {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .btn-edit-sm:hover {
      background: rgba(224, 159, 62, 0.2);
      color: #e09f3e;
      border-color: #e09f3e;
    }

    .btn-del-sm {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .btn-del-sm:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .empty-state {
      padding: 3rem 1rem !important;
      text-align: center;
    }

    .empty-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #94a3b8;
    }

    /* PROFILE & HOTEL FORM */
    .hotel-profile-card {
      background: #0e171e;
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 12px;
      padding: 2rem;
    }

    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .profile-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 0.3rem;
    }

    .profile-subtitle {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }

    .hotel-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .form-row-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-group label {
      font-size: 0.82rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .form-group input, 
    .form-group select, 
    .form-group textarea {
      background: #090f13;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f1f5f9;
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      font-size: 0.88rem;
      outline: none;
      font-family: inherit;
    }

    .form-group input:focus, 
    .form-group select:focus, 
    .form-group textarea:focus {
      border-color: #e09f3e;
    }

    .amenities-management-section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 1.25rem;
      margin-top: 0.5rem;
    }

    .amenities-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .amenities-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.2rem;
    }

    .amenities-desc {
      font-size: 0.78rem;
      color: #64748b;
      margin: 0;
    }

    .amenities-list-editor {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .amenity-editor-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .am-name-input {
      width: 250px;
    }

    .am-desc-input {
      flex: 1;
    }

    .btn-remove-am {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1.1rem;
    }

    .form-footer-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 1rem;
    }

    /* MODALS */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(5, 9, 12, 0.85);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-y: auto;
    }

    .modal-card {
      background: #0e171e;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      width: 100%;
      max-width: 780px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: sticky;
      top: 0;
      background: #0e171e;
      z-index: 10;
    }

    .modal-kicker {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #e09f3e;
      font-weight: 700;
    }

    .modal-heading {
      font-size: 1.3rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0.2rem 0 0;
    }

    .btn-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }

    .btn-close:hover {
      color: #ffffff;
    }

    .modal-form-body {
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-section-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #e09f3e;
      margin-top: 0.5rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid rgba(224, 159, 62, 0.2);
    }

    .toggle-group {
      display: flex;
      align-items: center;
      height: 42px;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      font-size: 0.85rem;
      color: #f1f5f9;
    }

    .input-with-preview {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .input-with-preview input {
      flex: 1;
    }

    .main-thumb-preview {
      width: 52px;
      height: 38px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
    }

    .main-thumb-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .quick-img-suggestions {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-top: 0.4rem;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .btn-sugg {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.72rem;
      cursor: pointer;
    }

    .btn-sugg:hover {
      background: rgba(224, 159, 62, 0.2);
      border-color: #e09f3e;
      color: #e09f3e;
    }

    .gallery-thumbs-editor {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.6rem;
    }

    .gallery-thumb-item {
      position: relative;
      width: 65px;
      height: 50px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .gallery-thumb-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .btn-del-thumb {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.9);
      color: #ffffff;
      border: none;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .add-img-row, .add-chip-row {
      display: flex;
      gap: 0.5rem;
    }

    .add-img-row input, .add-chip-row input {
      flex: 1;
    }

    .chips-editor-box {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      margin-bottom: 0.5rem;
    }

    .editable-chip {
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid rgba(224, 159, 62, 0.3);
      color: #e09f3e;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.78rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .editable-chip button {
      background: transparent;
      border: none;
      color: #e09f3e;
      cursor: pointer;
      font-weight: 700;
    }

    .amenities-checkboxes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      padding: 0.85rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .am-check-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: #cbd5e1;
      cursor: pointer;
    }

    .modal-footer-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      bottom: 0;
      background: #0e171e;
      margin-top: 0.5rem;
    }

    /* LIGHTBOX */
    .gallery-lightbox {
      background: #090f13;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      max-width: 800px;
      width: 100%;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .lightbox-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .lightbox-header h3 {
      font-size: 1.25rem;
      color: #f8fafc;
      margin: 0;
    }

    .lightbox-header p {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0.2rem 0 0;
    }

    .lightbox-main {
      width: 100%;
      height: 420px;
      border-radius: 8px;
      overflow: hidden;
      background: #000000;
    }

    .lightbox-hero {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lightbox-thumbs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .lb-thumb {
      width: 70px;
      height: 50px;
      border-radius: 6px;
      overflow: hidden;
      border: 2px solid transparent;
      padding: 0;
      cursor: pointer;
      background: #000000;
      flex-shrink: 0;
    }

    .lb-thumb.active {
      border-color: #e09f3e;
    }

    .lb-thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    @media (max-width: 768px) {
      .form-row-2, .form-row-3 {
        grid-template-columns: 1fr;
      }
      .rooms-grid {
        grid-template-columns: 1fr;
      }
      .page-header {
        flex-direction: column;
      }
      .lightbox-main {
        height: 250px;
      }
    }
  `]
})
export class AdminHotelComponent implements OnInit {
  private adminService = inject(AdminService);

  // Active tab: 'rooms' | 'bookings' | 'profile'
  activeTab = signal<'rooms' | 'bookings' | 'profile'>('rooms');

  // Signals
  hotelInfo = this.adminService.hotelInfoSignal;
  hotelBookings = this.adminService.hotelBookingsSignal;

  // Rooms filtering
  roomsFilter = signal<'all' | 'active' | 'hidden'>('all');

  // Bookings filtering
  bookingStatusFilter = signal<'all' | 'Pending' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'Cancelled'>('all');
  searchBookingQuery = '';

  // Toast feedback
  toastMessage = signal<string | null>(null);

  // Modals state
  showRoomModal = signal<boolean>(false);
  editingRoomId: number | null = null;
  roomForm: HotelRoom = this.createEmptyRoom();
  newGalleryImgUrl = '';
  newHighlightText = '';

  showBookingModal = signal<boolean>(false);
  editingBookingId: number | null = null;
  bookingForm: HotelBooking = this.createEmptyBooking();

  // Lightbox
  activeGalleryRoom = signal<HotelRoom | null>(null);
  activeLightboxImg = signal<string>('');

  // Profile Form state
  profileName = '';
  profileStars = 3;
  profileTagline = '';
  profileAddress = '';
  profileCity = '';
  profilePostalCode = '';
  profileWhatsApp = '';
  profileCheckIn = '';
  profileCheckOut = '';
  profileDescription = '';
  profileAmenities: HotelAmenity[] = [];

  // Popular checklist amenities for rooms
  popularAmenities: string[] = [
    'WiFi de alta velocidad gratuito',
    'Balcón privado con vista exterior',
    'Baño privado con ducha y agua caliente',
    'Bañera de hidromasaje / Jacuzzi',
    'TV de pantalla plana con cable',
    'Zona de cocina privada y equipada',
    'Escritorio de trabajo y enchufes cercanos',
    'Artículos de aseo gratuitos y toallas',
    'Ropa de cama hipoalergénica de algodón',
    'Caja fuerte en habitación',
    'Servicio a la habitación',
    'Ventilador / Calefacción'
  ];

  // COMPUTED STATS
  allRooms = computed(() => this.hotelInfo()?.rooms || []);
  totalRooms = computed(() => this.allRooms().length);
  activeRoomsCount = computed(() => this.allRooms().filter(r => r.isActive !== false).length);
  hiddenRoomsCount = computed(() => this.allRooms().filter(r => r.isActive === false).length);

  totalCapacityAdults = computed(() => {
    return this.allRooms()
      .filter(r => r.isActive !== false)
      .reduce((sum, r) => sum + ((r.capacityAdults || 2) * (r.totalUnits || 1)), 0);
  });

  avgNightlyRate = computed(() => {
    const list = this.allRooms();
    if (list.length === 0) return '0.00';
    const sum = list.reduce((acc, r) => acc + (r.pricePerNightSoles || 0), 0);
    return (sum / list.length).toFixed(2);
  });

  avgNightlyRateUsd = computed(() => {
    const list = this.allRooms();
    if (list.length === 0) return '0';
    const sum = list.reduce((acc, r) => acc + (r.pricePerNightUsd || 0), 0);
    return Math.round(sum / list.length);
  });

  filteredRooms = computed(() => {
    const filter = this.roomsFilter();
    const rooms = this.allRooms();
    if (filter === 'active') return rooms.filter(r => r.isActive !== false);
    if (filter === 'hidden') return rooms.filter(r => r.isActive === false);
    return rooms;
  });

  totalBookingsCount = computed(() => this.hotelBookings().length);
  pendingBookingsCount = computed(() => this.hotelBookings().filter(b => b.status === 'Pending').length);

  totalRevenueSoles = computed(() => {
    return this.hotelBookings()
      .reduce((sum, b) => sum + (b.paidAmountSoles || (b.paymentStatus === 'Pagado 100%' ? b.totalPriceSoles : 0)), 0)
      .toLocaleString('es-PE', { minimumFractionDigits: 2 });
  });

  filteredBookings = computed(() => {
    let list = this.hotelBookings();
    const filter = this.bookingStatusFilter();
    if (filter !== 'all') {
      list = list.filter(b => b.status === filter);
    }
    const q = this.searchBookingQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(b => 
        b.guestName.toLowerCase().includes(q) ||
        b.guestPhone.includes(q) ||
        b.voucherCode.toLowerCase().includes(q) ||
        b.roomTitle.toLowerCase().includes(q) ||
        (b.guestEmail && b.guestEmail.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.adminService.getHotelInfo(true).subscribe(info => {
      this.populateProfileForm(info);
    });
    this.adminService.getHotelBookings().subscribe();
  }

  populateProfileForm(info: HotelInfo): void {
    if (!info) return;
    this.profileName = info.name;
    this.profileStars = info.stars || 3;
    this.profileTagline = info.tagline || '';
    this.profileAddress = info.address || '';
    this.profileCity = info.city || '';
    this.profilePostalCode = info.postalCode || '';
    this.profileWhatsApp = info.whatsAppNumber || '';
    this.profileCheckIn = info.checkInTime || '';
    this.profileCheckOut = info.checkOutTime || '';
    this.profileDescription = info.description || '';
    this.profileAmenities = info.featuredAmenities 
      ? JSON.parse(JSON.stringify(info.featuredAmenities))
      : [];
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  // --- ROOM MANAGEMENT ---

  openCreateRoomModal(): void {
    this.editingRoomId = null;
    this.roomForm = this.createEmptyRoom();
    this.showRoomModal.set(true);
  }

  openEditRoomModal(room: HotelRoom): void {
    this.editingRoomId = room.id;
    this.roomForm = JSON.parse(JSON.stringify(room));
    if (!this.roomForm.gallery) this.roomForm.gallery = [];
    if (!this.roomForm.highlights) this.roomForm.highlights = [];
    if (!this.roomForm.amenities) this.roomForm.amenities = [];
    this.showRoomModal.set(true);
  }

  closeRoomModal(): void {
    this.showRoomModal.set(false);
  }

  onSaveRoom(): void {
    if (!this.roomForm.title || !this.roomForm.pricePerNightSoles) {
      alert('Por favor completa el título y la tarifa por noche.');
      return;
    }

    if (!this.roomForm.slug) {
      this.roomForm.slug = this.roomForm.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    if (!this.roomForm.mainImage) {
      this.roomForm.mainImage = '/assets/images/hotel/room_double.jpg';
    }

    if (this.roomForm.gallery.length === 0) {
      this.roomForm.gallery = [this.roomForm.mainImage];
    }

    this.adminService.saveHotelRoom(this.roomForm).subscribe(() => {
      this.showToast(this.editingRoomId ? '✓ Habitación actualizada exitosamente' : '✓ Nueva habitación registrada en el catálogo');
      this.closeRoomModal();
    });
  }

  onToggleRoomActive(id: number): void {
    this.adminService.toggleHotelRoomActive(id).subscribe(() => {
      this.showToast('✓ Estado de visibilidad web actualizado');
    });
  }

  onDeleteRoom(id: number): void {
    if (confirm('¿Estás seguro de eliminar esta habitación del hotel? Esta acción no se puede deshacer.')) {
      this.adminService.deleteHotelRoom(id).subscribe(() => {
        this.showToast('✓ Habitación eliminada');
      });
    }
  }

  openRoomGallery(room: HotelRoom): void {
    this.activeGalleryRoom.set(room);
    this.activeLightboxImg.set(room.mainImage || (room.gallery && room.gallery[0]) || '/assets/images/hero_sondondo.jpg');
  }

  autoCalcUsd(): void {
    if (this.roomForm.pricePerNightSoles) {
      this.roomForm.pricePerNightUsd = Math.round(this.roomForm.pricePerNightSoles / 3.75);
    }
  }

  addGalleryImg(): void {
    if (this.newGalleryImgUrl.trim()) {
      this.roomForm.gallery.push(this.newGalleryImgUrl.trim());
      this.newGalleryImgUrl = '';
    }
  }

  removeGalleryImg(index: number): void {
    this.roomForm.gallery.splice(index, 1);
  }

  addHighlight(): void {
    if (this.newHighlightText.trim()) {
      this.roomForm.highlights.push(this.newHighlightText.trim());
      this.newHighlightText = '';
    }
  }

  removeHighlight(index: number): void {
    this.roomForm.highlights.splice(index, 1);
  }

  hasAmenity(am: string): boolean {
    return this.roomForm.amenities.includes(am);
  }

  toggleAmenity(am: string): void {
    const idx = this.roomForm.amenities.indexOf(am);
    if (idx >= 0) {
      this.roomForm.amenities.splice(idx, 1);
    } else {
      this.roomForm.amenities.push(am);
    }
  }

  // --- BOOKING MANAGEMENT ---

  openCreateBookingModal(): void {
    this.editingBookingId = null;
    this.bookingForm = this.createEmptyBooking();
    // Default to first room if available
    const rooms = this.allRooms();
    if (rooms.length > 0) {
      this.bookingForm.roomId = rooms[0].id;
      this.bookingForm.roomTitle = rooms[0].title;
      this.bookingForm.totalPriceSoles = rooms[0].pricePerNightSoles;
    }
    this.showBookingModal.set(true);
  }

  openEditBookingModal(booking: HotelBooking): void {
    this.editingBookingId = booking.id;
    this.bookingForm = JSON.parse(JSON.stringify(booking));
    this.showBookingModal.set(true);
  }

  closeBookingModal(): void {
    this.showBookingModal.set(false);
  }

  onBookingRoomChanged(roomId: number): void {
    const room = this.allRooms().find(r => r.id === roomId);
    if (room) {
      this.bookingForm.roomTitle = room.title;
      this.bookingForm.totalPriceSoles = (room.pricePerNightSoles || 0) * (this.bookingForm.nights || 1);
    }
  }

  calcNightsAndTotal(): void {
    if (this.bookingForm.checkInDate && this.bookingForm.checkOutDate) {
      const d1 = new Date(this.bookingForm.checkInDate);
      const d2 = new Date(this.bookingForm.checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const nights = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)));
      this.bookingForm.nights = nights;

      const room = this.allRooms().find(r => r.id === this.bookingForm.roomId);
      if (room) {
        this.bookingForm.totalPriceSoles = room.pricePerNightSoles * nights;
      }
    }
  }

  recalcTotalFromNights(): void {
    const room = this.allRooms().find(r => r.id === this.bookingForm.roomId);
    if (room && this.bookingForm.nights > 0) {
      this.bookingForm.totalPriceSoles = room.pricePerNightSoles * this.bookingForm.nights;
    }
  }

  onSaveBooking(): void {
    if (!this.bookingForm.guestName || !this.bookingForm.guestPhone) {
      alert('Por favor ingresa el nombre y teléfono del huésped.');
      return;
    }

    this.adminService.saveHotelBooking(this.bookingForm).subscribe(() => {
      this.showToast(this.editingBookingId ? '✓ Reserva actualizada' : '✓ Reserva de hospedaje registrada con éxito');
      this.closeBookingModal();
    });
  }

  onUpdateBookingStatus(id: number, status: HotelBooking['status']): void {
    this.adminService.updateHotelBookingStatus(id, status).subscribe(() => {
      this.showToast(`✓ Estado de reserva actualizado a ${status}`);
    });
  }

  onDeleteBooking(id: number): void {
    if (confirm('¿Deseas eliminar este registro de reserva?')) {
      this.adminService.deleteHotelBooking(id).subscribe(() => {
        this.showToast('✓ Registro de reserva eliminado');
      });
    }
  }

  exportCsv(): void {
    this.adminService.exportHotelBookingsCsv();
    this.showToast('✓ Descargando archivo CSV de reservas de hospedaje...');
  }

  // --- PROFILE MANAGEMENT ---

  onSaveHotelProfile(): void {
    const current = this.hotelInfo();
    const updated: HotelInfo = {
      name: this.profileName || 'Hotel Punto Clave',
      stars: this.profileStars || 3,
      tagline: this.profileTagline,
      address: this.profileAddress,
      city: this.profileCity,
      postalCode: this.profilePostalCode,
      whatsAppNumber: this.profileWhatsApp,
      checkInTime: this.profileCheckIn,
      checkOutTime: this.profileCheckOut,
      description: this.profileDescription,
      featuredAmenities: this.profileAmenities,
      rooms: current?.rooms || []
    };

    this.adminService.updateHotelInfo(updated).subscribe(() => {
      this.showToast('✓ Información corporativa del hotel actualizada y sincronizada');
    });
  }

  addAmenityField(): void {
    this.profileAmenities.push({
      name: '',
      icon: 'check',
      description: ''
    });
  }

  removeAmenity(index: number): void {
    this.profileAmenities.splice(index, 1);
  }

  // --- FACTORY HELPERS ---

  private createEmptyRoom(): HotelRoom {
    return {
      id: 0,
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      capacityText: '2 Adultos',
      capacityAdults: 2,
      bedConfiguration: '1 Cama Doble Matrimonial',
      pricePerNightSoles: 90,
      pricePerNightUsd: 24,
      mainImage: '/assets/images/hotel/room_double.jpg',
      gallery: [
        '/assets/images/hotel/room_double.jpg',
        '/assets/images/hotel/hotel_bathroom.jpg',
        '/assets/images/hotel/hotel_terrace.jpg'
      ],
      amenities: [
        'WiFi de alta velocidad gratuito',
        'Balcón privado con vista exterior',
        'Baño privado con ducha y agua caliente',
        'TV de pantalla plana con cable',
        'Artículos de aseo gratuitos y toallas'
      ],
      highlights: ['1 cama matrimonial', 'Balcón privado', 'Baño privado', 'WiFi gratis'],
      isActive: true,
      totalUnits: 1,
      floorOrZone: 'Piso 1'
    };
  }

  private createEmptyBooking(): HotelBooking {
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24 * 3600000);
    const inStr = today.toISOString().split('T')[0];
    const outStr = tomorrow.toISOString().split('T')[0];

    return {
      id: 0,
      voucherCode: '',
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      guestDocumentType: 'DNI',
      guestDocumentNumber: '',
      roomId: 1,
      roomTitle: 'Habitación Doble',
      checkInDate: inStr,
      checkOutDate: outStr,
      nights: 1,
      numberOfGuests: 2,
      totalPriceSoles: 85,
      paidAmountSoles: 0,
      paymentMethod: 'Pendiente',
      paymentStatus: 'Pendiente',
      status: 'Pending',
      specialRequests: '',
      createdAt: new Date().toISOString()
    };
  }
}
