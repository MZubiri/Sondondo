import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { HotelInfo, HotelRoom, HotelBooking, HotelAmenity, GalleryItem, HotelDateBlock } from '../../models/admin.model';

@Component({
  selector: 'app-admin-hotel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="hotel-admin-page">
      <!-- HEADER -->
      <div class="page-header">
        <div class="page-header-titles">
          <div class="page-eyebrow eyebrow-hotel">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M2 4v16"></path>
              <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
              <path d="M2 17h20"></path>
              <path d="M6 8v9"></path>
            </svg>
            <span>Hospedaje Oficial & Albergues</span>
          </div>
          <h1 class="page-title">{{ hotelInfo().name || 'Hotel Punto Clave' }}</h1>
          <p class="page-desc">Gestión integral de habitaciones, tarifas por noche, ocupación y reservas de huéspedes</p>
        </div>

        <div class="header-actions">
          <button type="button" class="btn-adm btn-adm-secondary" (click)="exportCsv()" title="Descargar reporte de reservas">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Exportar CSV</span>
          </button>

          <button type="button" class="btn-adm btn-adm-secondary" (click)="openCreateRoomModal()">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Nueva Habitación</span>
          </button>

          <button type="button" class="btn-adm btn-adm-gold" (click)="openCreateBookingModal()">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
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

      <!-- CENTRO DE OPERACIONES DEL DÍA (RECEPCIÓN RÁPIDA) -->
      <div class="daily-reception-card glass-panel">
        <div class="reception-header">
          <div class="reception-title-box">
            <div class="rec-badge-row">
              <span class="reception-badge">Operaciones del Día</span>
              <span class="live-pulse-badge">● En Vivo</span>
            </div>
            <h2 class="reception-heading">{{ todayFormatted() }}</h2>
            <p class="reception-sub">Control en tiempo real: flujo de llegadas, salidas de huéspedes, estados de limpieza y ocupación</p>
          </div>
          <div class="reception-quick-actions">
            <button type="button" class="btn-rec-action" (click)="selectTab('rack')" title="Ver Tape Chart mensual">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Rack Calendario</span>
            </button>
            <button type="button" class="btn-rec-action" (click)="openCreateBlockModal()" title="Bloquear fechas o fijar tarifas especiales">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Bloquear Fechas</span>
            </button>
            <button type="button" class="btn-rec-action btn-gold-sm" (click)="openCreateBookingModal()">
              <span>+ Nueva Reserva</span>
            </button>
          </div>
        </div>

        <div class="reception-kpi-grid">
          <!-- KPI 1: Check-Ins de Hoy -->
          <div class="kpi-op-box" [class.highlight-active]="todayCheckIns().length > 0">
            <div class="kpi-op-header">
              <span class="kpi-op-icon icon-in">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </span>
              <div class="kpi-op-meta">
                <span class="kpi-op-title">Llegadas de Hoy (Check-In)</span>
                <strong class="kpi-op-count">{{ todayCheckIns().length }}</strong>
              </div>
            </div>
            
            <div class="kpi-op-list" *ngIf="todayCheckIns().length > 0">
              <div *ngFor="let b of todayCheckIns()" class="guest-action-row">
                <div class="guest-action-info">
                  <strong class="g-name">{{ b.guestName }}</strong>
                  <span class="g-meta">{{ b.roomTitle }} • {{ b.nights }} noche(s)</span>
                  <span class="g-meta balance-alert" *ngIf="(b.paidAmountSoles || 0) < b.totalPriceSoles">
                    Saldo: S/ {{ b.totalPriceSoles - (b.paidAmountSoles || 0) }}
                  </span>
                </div>
                <div class="guest-action-btns">
                  <button 
                    *ngIf="b.status !== 'CheckedIn'" 
                    type="button" 
                    class="btn-op-checkin" 
                    (click)="onQuickCheckIn(b)" 
                    title="Registrar ingreso y marcar habitación ocupada"
                  >
                    Check-In
                  </button>
                  <span *ngIf="b.status === 'CheckedIn'" class="status-pill active">En Estadía</span>
                  <button type="button" class="btn-op-voucher" (click)="openGuestVoucherModal(b)" title="Ver voucher y recibo">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                  <a [href]="b.whatsAppDirectUrl" target="_blank" rel="noopener" class="btn-op-wa" title="WhatsApp">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            <div class="kpi-op-empty" *ngIf="todayCheckIns().length === 0">
              <span>Sin llegadas programadas para hoy</span>
            </div>
          </div>

          <!-- KPI 2: Check-Outs de Hoy -->
          <div class="kpi-op-box" [class.highlight-active]="todayCheckOuts().length > 0">
            <div class="kpi-op-header">
              <span class="kpi-op-icon icon-out">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </span>
              <div class="kpi-op-meta">
                <span class="kpi-op-title">Salidas de Hoy (Check-Out)</span>
                <strong class="kpi-op-count">{{ todayCheckOuts().length }}</strong>
              </div>
            </div>

            <div class="kpi-op-list" *ngIf="todayCheckOuts().length > 0">
              <div *ngFor="let b of todayCheckOuts()" class="guest-action-row">
                <div class="guest-action-info">
                  <strong class="g-name">{{ b.guestName }}</strong>
                  <span class="g-meta">{{ b.roomTitle }}</span>
                </div>
                <div class="guest-action-btns">
                  <button 
                    *ngIf="b.status !== 'Completed'" 
                    type="button" 
                    class="btn-op-checkout" 
                    (click)="onQuickCheckOut(b)" 
                    title="Completar salida y marcar habitación como sucia para limpieza"
                  >
                    Check-Out
                  </button>
                  <span *ngIf="b.status === 'Completed'" class="status-pill confirmed">Finalizado</span>
                  <button type="button" class="btn-op-voucher" (click)="openGuestVoucherModal(b)" title="Ver voucher">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div class="kpi-op-empty" *ngIf="todayCheckOuts().length === 0">
              <span>Sin salidas programadas para hoy</span>
            </div>
          </div>

          <!-- KPI 3: Housekeeping (Limpieza) -->
          <div class="kpi-op-box">
            <div class="kpi-op-header">
              <span class="kpi-op-icon icon-clean">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </span>
              <div class="kpi-op-meta">
                <span class="kpi-op-title">Housekeeping (Limpieza)</span>
                <strong class="kpi-op-count">{{ cleanRoomsCount() }}/{{ totalRooms() }}</strong>
              </div>
            </div>
            <div class="housekeeping-status-summary">
              <div class="hk-stat-item hk-clean">
                <span class="hk-dot dot-clean"></span>
                <span>{{ cleanRoomsCount() }} Limpias</span>
              </div>
              <div class="hk-stat-item hk-occupied">
                <span class="hk-dot dot-occupied"></span>
                <span>{{ activeOccupiedCount() }} Ocupadas</span>
              </div>
              <div class="hk-stat-item hk-dirty">
                <span class="hk-dot dot-dirty"></span>
                <span>{{ dirtyRoomsCount() }} Por limpiar</span>
                <button *ngIf="dirtyRoomsCount() > 0" type="button" class="btn-hk-clean-all" (click)="onMarkAllClean()" title="Marcar todas como limpias">
                  Marcar limpias
                </button>
              </div>
              <div class="hk-stat-item hk-maint" *ngIf="maintenanceRoomsCount() > 0">
                <span class="hk-dot dot-maint"></span>
                <span>{{ maintenanceRoomsCount() }} Mantenimiento</span>
              </div>
            </div>
          </div>

          <!-- KPI 4: Ocupación en Vivo -->
          <div class="kpi-op-box">
            <div class="kpi-op-header">
              <span class="kpi-op-icon icon-occ">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 4v16"></path>
                  <path d="M2 8h18a2 2 0 0 1 2 2v10"></path>
                  <path d="M2 17h20"></path>
                  <path d="M6 8v9"></path>
                </svg>
              </span>
              <div class="kpi-op-meta">
                <span class="kpi-op-title">Ocupación Actual</span>
                <strong class="kpi-op-count">{{ occupancyRatePercent() }}%</strong>
              </div>
            </div>
            <div class="occupancy-gauge-box">
              <div class="gauge-track">
                <div class="gauge-fill" [style.width.%]="occupancyRatePercent()"></div>
              </div>
              <div class="gauge-legend">
                <span>{{ activeOccupiedCount() }} de {{ totalRooms() }} hab. ocupadas</span>
                <span>{{ totalRooms() - activeOccupiedCount() }} disponibles</span>
              </div>
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
          (click)="selectTab('rooms')"
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
          [class.active]="activeTab() === 'rack'"
          (click)="selectTab('rack')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>Rack de Ocupación</span>
        </button>

        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'bookings'"
          (click)="selectTab('bookings')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Reservas & Huéspedes ({{ totalBookingsCount() }})</span>
          <span class="tab-badge" *ngIf="pendingBookingsCount() > 0">{{ pendingBookingsCount() }}</span>
        </button>

        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'blocks'"
          (click)="selectTab('blocks')"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span>Bloqueos & Tarifas ({{ hotelDateBlocks().length }})</span>
        </button>

        <button 
          type="button" 
          class="tab-btn" 
          [class.active]="activeTab() === 'profile'"
          (click)="selectTab('profile')"
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
              class="pill-btn" 
              [class.active]="roomsFilter() === 'all'"
              (click)="roomsFilter.set('all')"
            >
              Todas ({{ totalRooms() }})
            </button>
            <button 
              type="button" 
              class="pill-btn" 
              [class.active]="roomsFilter() === 'active'"
              (click)="roomsFilter.set('active')"
            >
              <span class="pill-dot is-active"></span>
              <span>Activas en Web ({{ activeRoomsCount() }})</span>
            </button>
            <button 
              type="button" 
              class="pill-btn" 
              [class.active]="roomsFilter() === 'hidden'"
              (click)="roomsFilter.set('hidden')"
            >
              <span class="pill-dot is-paused"></span>
              <span>En Mantenimiento ({{ hiddenRoomsCount() }})</span>
            </button>
          </div>

          <div class="filter-hint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Las habitaciones <strong>Activas</strong> se sincronizan automáticamente con el portal de reservas público.</span>
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
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  Galería ({{ room.gallery.length }} fotos)
                </span>
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
                <span *ngFor="let h of room.highlights" class="hl-chip">{{ h }}</span>
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

              <!-- Housekeeping Quick Control -->
              <div class="room-housekeeping-box">
                <span class="hk-label">Estado de Limpieza:</span>
                <div class="hk-pills-row">
                  <button 
                    type="button" 
                    class="hk-pill-btn hk-pill-clean"
                    [class.active]="(room.housekeepingStatus || 'clean') === 'clean'"
                    (click)="onUpdateHousekeeping(room.id, 'clean')"
                    title="Limpia y lista para asignar"
                  >
                    <span class="hk-dot dot-clean"></span> Limpia
                  </button>
                  <button 
                    type="button" 
                    class="hk-pill-btn hk-pill-occupied"
                    [class.active]="room.housekeepingStatus === 'occupied'"
                    (click)="onUpdateHousekeeping(room.id, 'occupied')"
                    title="Huésped actualmente alojado"
                  >
                    <span class="hk-dot dot-occupied"></span> Ocupada
                  </button>
                  <button 
                    type="button" 
                    class="hk-pill-btn hk-pill-dirty"
                    [class.active]="room.housekeepingStatus === 'dirty'"
                    (click)="onUpdateHousekeeping(room.id, 'dirty')"
                    title="Desocupada pendiente de aseo"
                  >
                    <span class="hk-dot dot-dirty"></span> Por Limpiar
                  </button>
                  <button 
                    type="button" 
                    class="hk-pill-btn hk-pill-maint"
                    [class.active]="room.housekeepingStatus === 'maintenance'"
                    (click)="onUpdateHousekeeping(room.id, 'maintenance')"
                    title="En mantenimiento"
                  >
                    <span class="hk-dot dot-maint"></span> Mantenimiento
                  </button>
                </div>
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
                  <button type="button" class="btn-action-block" (click)="openCreateBlockModal(room.id)" title="Bloquear fechas para esta habitación">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Bloquear</span>
                  </button>

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
      <!-- TAB 2: RACK DE OCUPACIÓN (TAPE CHART)      -->
      <!-- ========================================== -->
      <section *ngIf="activeTab() === 'rack'" class="tab-content">
        <!-- RACK TOOLBAR -->
        <div class="rack-toolbar glass-panel">
          <div class="rack-nav-controls">
            <button type="button" class="btn-rack-nav" (click)="prevRackMonth()">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              <span>Mes Anterior</span>
            </button>

            <div class="rack-current-month">
              <span class="cal-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </span>
              <strong class="month-title">{{ rackMonthName() }}</strong>
            </div>

            <button type="button" class="btn-rack-nav" (click)="nextRackMonth()">
              <span>Mes Siguiente</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <button type="button" class="btn-rack-today" (click)="goToTodayRack()">
              Ir a Hoy
            </button>
          </div>

          <div class="rack-quick-stats">
            <div class="rack-stat-chip">
              <span class="rk-label">Noches Vendidas:</span>
              <strong class="rk-val">{{ monthBookedNights() }}</strong>
            </div>
            <div class="rack-stat-chip">
              <span class="rk-label">Ocupación Mensual:</span>
              <strong class="rk-val">{{ monthOccupancyPercent() }}%</strong>
            </div>
            <button type="button" class="btn-gold-sm" (click)="openCreateBookingModal()">
              + Nueva Reserva
            </button>
          </div>
        </div>

        <!-- RACK MATRIX / TAPE CHART SCROLLER -->
        <div class="tape-chart-card glass-panel">
          <div class="tape-chart-scroll-wrapper">
            <table class="tape-chart-table">
              <thead>
                <tr>
                  <th class="sticky-col-header">
                    <span>Habitaciones & Unidades</span>
                  </th>
                  <th 
                    *ngFor="let d of rackDays()" 
                    class="day-header"
                    [class.is-today]="d.isToday"
                    [class.is-weekend]="d.isWeekend"
                  >
                    <span class="day-name">{{ d.dayName }}</span>
                    <strong class="day-num">{{ d.dayNum }}</strong>
                    <span class="today-marker" *ngIf="d.isToday">HOY</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let room of allRooms()">
                  <!-- Sticky Room Header -->
                  <td class="sticky-room-cell">
                    <div class="rack-room-info">
                      <img [src]="room.mainImage" [alt]="room.title" class="rack-room-thumb" onerror="this.src='/assets/images/hero_sondondo.jpg'" />
                      <div class="rack-room-text">
                        <strong class="rack-room-name">{{ room.title }}</strong>
                        <span class="rack-room-meta">
                          {{ room.bedConfiguration }} • S/ {{ room.pricePerNightSoles }}
                        </span>
                        <div class="rack-hk-mini">
                          <span 
                            class="hk-dot"
                            [class.dot-clean]="(room.housekeepingStatus || 'clean') === 'clean'"
                            [class.dot-occupied]="room.housekeepingStatus === 'occupied'"
                            [class.dot-dirty]="room.housekeepingStatus === 'dirty'"
                            [class.dot-maint]="room.housekeepingStatus === 'maintenance'"
                          ></span>
                          <span class="hk-mini-text">
                            {{ (room.housekeepingStatus || 'clean') === 'clean' ? 'Limpia' :
                               room.housekeepingStatus === 'occupied' ? 'Ocupada' :
                               room.housekeepingStatus === 'dirty' ? 'Por Limpiar' : 'Mantenimiento' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Day Cells for Room -->
                  <td 
                    *ngFor="let d of rackDays()" 
                    class="tape-day-cell"
                    [class.is-today]="d.isToday"
                    [class.is-weekend]="d.isWeekend"
                    (click)="onRackCellClick(room, d.dateStr)"
                  >
                    <!-- Scenario 1: Booked Day -->
                    <ng-container *ngIf="getBookingForRoomDay(room.id, d.dateStr) as b">
                      <div 
                        class="tape-booking-block"
                        [class.bk-confirmed]="b.status === 'Confirmed'"
                        [class.bk-checkin]="b.status === 'CheckedIn'"
                        [class.bk-pending]="b.status === 'Pending'"
                        [class.bk-completed]="b.status === 'Completed'"
                        [title]="b.guestName + ' (' + b.voucherCode + ') • Clic para ver voucher'"
                      >
                        <span class="bk-guest-label">{{ b.guestName }}</span>
                        <span class="bk-code-label">{{ b.voucherCode }}</span>
                      </div>
                    </ng-container>

                    <!-- Scenario 2: Blocked Day (Maintenance / Special Season Rate) -->
                    <ng-container *ngIf="!getBookingForRoomDay(room.id, d.dateStr) && getDateBlockForRoomDay(room.id, d.dateStr) as blk">
                      <div 
                        class="tape-blocked-block"
                        [class.blk-closed]="blk.isBlocked"
                        [class.blk-special]="!blk.isBlocked"
                        [title]="blk.reason + (blk.priceOverrideSoles ? ' (Tarifa Especial S/ ' + blk.priceOverrideSoles + ')' : ' (Bloqueado)')"
                      >
                        <span *ngIf="blk.isBlocked">{{ blk.reason }}</span>
                        <span *ngIf="!blk.isBlocked">S/ {{ blk.priceOverrideSoles }}</span>
                      </div>
                    </ng-container>

                    <!-- Scenario 3: Available Free Cell -->
                    <ng-container *ngIf="!getBookingForRoomDay(room.id, d.dateStr) && !getDateBlockForRoomDay(room.id, d.dateStr)">
                      <div class="tape-free-slot" title="Disponible • Clic para reservar">
                        <span class="free-plus">+</span>
                      </div>
                    </ng-container>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- RACK FOOTER LEGEND -->
          <div class="tape-legend-bar">
            <span class="legend-title">Guía de estados del Rack:</span>
            <div class="legend-items">
              <span class="leg-item"><span class="leg-color leg-free"></span> Libre / Disponible</span>
              <span class="leg-item"><span class="leg-color leg-conf"></span> Confirmada</span>
              <span class="leg-item"><span class="leg-color leg-in"></span> En Estadía (Huésped en Hotel)</span>
              <span class="leg-item"><span class="leg-color leg-pend"></span> Pendiente de Pago</span>
              <span class="leg-item"><span class="leg-color leg-block"></span> Bloqueada / Mantenimiento</span>
              <span class="leg-item"><span class="leg-color leg-special"></span> Tarifa Especial Temporada</span>
            </div>
            <span class="legend-hint">Clic en cualquier bloque ocupado para abrir la Ficha de Huésped y enviar Voucher por WhatsApp. Clic en celda libre para crear una reserva.</span>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- TAB 3: RESERVAS DE HOSPEDAJE               -->
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
              <span class="pill-dot dot-pending"></span> Pendientes ({{ pendingBookingsCount() }})
            </button>
            <button 
              type="button" 
              class="pill pill-green" 
              [class.active]="bookingStatusFilter() === 'Confirmed'"
              (click)="bookingStatusFilter.set('Confirmed')"
            >
              <span class="pill-dot dot-confirmed"></span> Confirmadas
            </button>
            <button 
              type="button" 
              class="pill pill-blue" 
              [class.active]="bookingStatusFilter() === 'CheckedIn'"
              (click)="bookingStatusFilter.set('CheckedIn')"
            >
              <span class="pill-dot dot-checkin"></span> En Estadía
            </button>
            <button 
              type="button" 
              class="pill" 
              [class.active]="bookingStatusFilter() === 'Completed'"
              (click)="bookingStatusFilter.set('Completed')"
            >
              <span class="pill-dot dot-completed"></span> Finalizadas
            </button>
            <button 
              type="button" 
              class="pill pill-red" 
              [class.active]="bookingStatusFilter() === 'Cancelled'"
              (click)="bookingStatusFilter.set('Cancelled')"
            >
              <span class="pill-dot dot-cancelled"></span> Canceladas
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
                      <span class="guest-contact">{{ b.guestPhone }}</span>
                      <span class="guest-contact" *ngIf="b.guestEmail">{{ b.guestEmail }}</span>
                    </div>
                  </td>

                  <!-- Room -->
                  <td>
                    <span class="table-room-name">{{ b.roomTitle }}</span>
                  </td>

                  <!-- Checkin / Checkout -->
                  <td>
                    <div class="dates-box">
                      <span class="date-in">In: {{ b.checkInDate }}</span>
                      <span class="date-out">Out: {{ b.checkOutDate }}</span>
                    </div>
                  </td>

                  <!-- Nights -->
                  <td>
                    <span class="nights-pill">{{ b.nights }} noche(s)</span>
                  </td>

                  <!-- Guests -->
                  <td>
                    <span class="guest-count">{{ b.numberOfGuests }} pers.</span>
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
                      <span class="pay-method" *ngIf="b.paymentMethod">{{ b.paymentMethod }}</span>
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
                      <option value="Pending">Pendiente</option>
                      <option value="Confirmed">Confirmada</option>
                      <option value="CheckedIn">En Estadía</option>
                      <option value="Completed">Finalizada</option>
                      <option value="Cancelled">Cancelada</option>
                    </select>
                  </td>

                  <!-- Actions -->
                  <td>
                    <div class="row-actions">
                      <button type="button" class="btn-voucher-sm" (click)="openGuestVoucherModal(b)" title="Ver Ficha de Huésped y Voucher Digital">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 3px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                        Voucher
                      </button>

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
                      <span>No se encontraron reservas con los filtros aplicados.</span>
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
      <!-- TAB 4: BLOQUEOS DE FECHAS & TARIFAS        -->
      <!-- ========================================== -->
      <section *ngIf="activeTab() === 'blocks'" class="tab-content">
        <div class="blocks-page-card glass-panel">
          <div class="blocks-header">
            <div>
              <h2 class="blocks-title">Gestión de Bloqueos & Tarifas Especiales</h2>
              <p class="blocks-sub">Cierra fechas de habitaciones por mantenimiento o festividades locales, o define tarifas especiales (Yaku Raymi, Semana Santa, etc.).</p>
            </div>
            <button type="button" class="btn-gold" (click)="openCreateBlockModal()">
              + Nuevo Bloqueo o Tarifa
            </button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Habitación / Alcance</th>
                  <th>Fechas (Inicio - Fin)</th>
                  <th>Tipo / Motivo</th>
                  <th>Tarifa Especial</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let blk of hotelDateBlocks()">
                  <td>
                    <div class="blk-room-cell">
                      <strong *ngIf="!blk.roomId">Todo el Hotel (General)</strong>
                      <strong *ngIf="blk.roomId">{{ blk.roomTitle || ('Habitación #' + blk.roomId) }}</strong>
                    </div>
                  </td>
                  <td>
                    <div class="dates-box">
                      <span>{{ blk.startDate }} al {{ blk.endDate }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="blk-reason-cell">
                      <span class="blk-tag" [class.blk-tag-closed]="blk.isBlocked" [class.blk-tag-rate]="!blk.isBlocked">
                        {{ blk.isBlocked ? 'Cierre / Bloqueo' : 'Tarifa Especial' }}
                      </span>
                      <span class="blk-reason-text">{{ blk.reason }}</span>
                    </div>
                  </td>
                  <td>
                    <span *ngIf="!blk.isBlocked && blk.priceOverrideSoles" class="special-rate-tag">
                      S/ {{ blk.priceOverrideSoles }} / noche
                    </span>
                    <span *ngIf="blk.isBlocked" class="text-muted">No reservable</span>
                  </td>
                  <td>
                    <span class="badge-status-active">Activo</span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button type="button" class="btn-edit-sm" (click)="openEditBlockModal(blk)" title="Editar bloqueo">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="btn-del-sm" (click)="onDeleteBlock(blk.id)" title="Eliminar bloqueo">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="hotelDateBlocks().length === 0">
                  <td colspan="6" class="empty-state">
                    <div class="empty-box">
                      <span>No hay fechas bloqueadas ni tarifas estacionales configuradas.</span>
                      <button type="button" class="btn-secondary-sm" (click)="openCreateBlockModal()">
                        Crear el primer bloqueo o tarifa
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
      <!-- TAB 5: PERFIL DEL HOTEL & POLÍTICAS        -->
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
                  <option [ngValue]="1">1 Estrella</option>
                  <option [ngValue]="2">2 Estrellas</option>
                  <option [ngValue]="3">3 Estrellas (Estándar)</option>
                  <option [ngValue]="4">4 Estrellas</option>
                  <option [ngValue]="5">5 Estrellas</option>
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
                  <option value="Pending">Pendiente de Confirmación</option>
                  <option value="Confirmed">Confirmada</option>
                  <option value="CheckedIn">En Estadía (Check-in Realizado)</option>
                  <option value="Completed">Finalizada (Check-out)</option>
                  <option value="Cancelled">Cancelada</option>
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

      <!-- ========================================== -->
      <!-- MODAL 4: FICHA DE HUÉSPED & VOUCHER        -->
      <!-- ========================================== -->
      <div class="modal-backdrop voucher-modal-backdrop" *ngIf="selectedVoucherBooking()" (click)="closeGuestVoucherModal()">
        <div class="voucher-modal-card glass-modal" (click)="$event.stopPropagation()">
          <div class="voucher-modal-top-bar no-print">
            <div class="v-top-left">
              <span class="v-pill-code">VOUCHER #{{ selectedVoucherBooking()?.voucherCode }}</span>
              <span class="v-pill-status" [class.v-st-paid]="selectedVoucherBooking()?.paymentStatus === 'Pagado 100%'">
                {{ selectedVoucherBooking()?.paymentStatus || 'Pendiente' }}
              </span>
            </div>
            <div class="v-top-actions">
              <button type="button" class="btn-v-print" (click)="onPrintVoucher()" title="Imprimir o guardar como PDF">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: -2px; margin-right: 4px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Imprimir / PDF
              </button>
              <button 
                type="button" 
                class="btn-v-wa" 
                (click)="onSendVoucherWhatsApp(selectedVoucherBooking()!)" 
                title="Enviar voucher oficial al WhatsApp del huésped"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: -2px; margin-right: 4px;"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"/></svg>
                Enviar por WhatsApp
              </button>
              <button class="btn-close" (click)="closeGuestVoucherModal()">×</button>
            </div>
          </div>

          <!-- PRINTABLE VOUCHER TICKET -->
          <div class="voucher-ticket-paper" id="voucherPrintArea">
            <div class="v-header-banner">
              <div class="v-brand-box">
                <span class="v-hotel-kicker">VALLE DEL SONDONDO EXPEDITIONS</span>
                <h2 class="v-hotel-name">{{ hotelInfo().name || 'Hotel Punto Clave' }}</h2>
                <p class="v-hotel-sub">Alojamiento Oficial & Centro Operativo Turístico en Cabana Sur, Lucanas, Ayacucho</p>
              </div>
              <div class="v-code-box">
                <span class="v-code-label">CÓDIGO DE RESERVA</span>
                <strong class="v-code-val">{{ selectedVoucherBooking()?.voucherCode }}</strong>
                <span class="v-date-issued">Emisión: {{ selectedVoucherBooking()?.createdAt | date:'mediumDate' }}</span>
              </div>
            </div>

            <div class="v-divider-dashed"></div>

            <!-- GUEST & STAY METRICS GRID -->
            <div class="v-grid-sections">
              <!-- Guest Info -->
              <div class="v-section-box">
                <h4 class="v-sec-title">Ficha de Huésped Titular</h4>
                <div class="v-data-row">
                  <span class="v-lbl">Nombre:</span>
                  <strong class="v-val">{{ selectedVoucherBooking()?.guestName }}</strong>
                </div>
                <div class="v-data-row" *ngIf="selectedVoucherBooking()?.guestDocumentNumber">
                  <span class="v-lbl">Documento:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.guestDocumentType || 'DNI' }}: {{ selectedVoucherBooking()?.guestDocumentNumber }}</span>
                </div>
                <div class="v-data-row">
                  <span class="v-lbl">Teléfono / WhatsApp:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.guestPhone }}</span>
                </div>
                <div class="v-data-row" *ngIf="selectedVoucherBooking()?.guestEmail">
                  <span class="v-lbl">Correo Electrónico:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.guestEmail }}</span>
                </div>
                <div class="v-data-row">
                  <span class="v-lbl">Total Huéspedes:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.numberOfGuests }} persona(s)</span>
                </div>
              </div>

              <!-- Stay Info -->
              <div class="v-section-box">
                <h4 class="v-sec-title">Detalles de Estadía</h4>
                <div class="v-data-row">
                  <span class="v-lbl">Habitación Asignada:</span>
                  <strong class="v-val highlight-room">{{ selectedVoucherBooking()?.roomTitle }}</strong>
                </div>
                <div class="v-data-row">
                  <span class="v-lbl">Check-In:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.checkInDate }} ({{ hotelInfo().checkInTime || 'A partir de 13:00 hrs' }})</span>
                </div>
                <div class="v-data-row">
                  <span class="v-lbl">Check-Out:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.checkOutDate }} ({{ hotelInfo().checkOutTime || 'Hasta las 12:00 hrs' }})</span>
                </div>
                <div class="v-data-row">
                  <span class="v-lbl">Duración:</span>
                  <strong class="v-val">{{ selectedVoucherBooking()?.nights }} noche(s)</strong>
                </div>
                <div class="v-data-row">
                  <span class="v-lbl">Estado en Hotel:</span>
                  <span class="v-val">{{ selectedVoucherBooking()?.status }}</span>
                </div>
              </div>
            </div>

            <!-- PAYMENT SUMMARY TABLE -->
            <div class="v-finance-box">
              <h4 class="v-sec-title">Liquidación Financiera</h4>
              <div class="v-finance-grid">
                <div class="v-fin-item">
                  <span class="v-fin-lbl">Tarifa Total Estadía:</span>
                  <strong class="v-fin-val">S/ {{ selectedVoucherBooking()?.totalPriceSoles }}</strong>
                </div>
                <div class="v-fin-item">
                  <span class="v-fin-lbl">Monto Pagado / Adelanto:</span>
                  <span class="v-fin-val text-emerald">S/ {{ selectedVoucherBooking()?.paidAmountSoles || 0 }}</span>
                </div>
                <div class="v-fin-item highlight-balance">
                  <span class="v-fin-lbl">Saldo Pendiente al Ingreso:</span>
                  <strong class="v-fin-val balance-number">
                    S/ {{ ((selectedVoucherBooking()?.totalPriceSoles || 0) - (selectedVoucherBooking()?.paidAmountSoles || 0)) }}
                  </strong>
                </div>
                <div class="v-fin-item">
                  <span class="v-fin-lbl">Método de Pago:</span>
                  <span class="v-fin-val">{{ selectedVoucherBooking()?.paymentMethod || 'No especificado' }}</span>
                </div>
              </div>
            </div>

            <!-- SPECIAL REQUESTS & POLICIES -->
            <div class="v-footer-notes" *ngIf="selectedVoucherBooking()?.specialRequests">
              <strong>Observaciones / Peticiones Especiales:</strong>
              <p>{{ selectedVoucherBooking()?.specialRequests }}</p>
            </div>

            <div class="v-policy-box">
              <div class="v-policy-col">
                <strong>Ubicación:</strong> {{ hotelInfo().address || 'Plaza Principal s/n' }}, {{ hotelInfo().city || 'Cabana Sur, Ayacucho' }}.
              </div>
              <div class="v-policy-col">
                <strong>Recepción:</strong> Presentar documento original de identidad. Desayuno tradicional andino incluido.
              </div>
            </div>
          </div>

          <!-- FOOTER ACTIONS -->
          <div class="voucher-modal-footer no-print">
            <button 
              *ngIf="(selectedVoucherBooking()?.paidAmountSoles || 0) < (selectedVoucherBooking()?.totalPriceSoles || 0)"
              type="button" 
              class="btn-mark-paid"
              (click)="onMarkBookingPaid(selectedVoucherBooking()!)"
            >
              Marcar Pagado 100% (S/ {{ selectedVoucherBooking()?.totalPriceSoles }})
            </button>
            <button type="button" class="btn-secondary" (click)="closeGuestVoucherModal()">Cerrar Ficha</button>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL 5: BLOQUEO DE FECHAS & TARIFAS       -->
      <!-- ========================================== -->
      <div class="modal-backdrop" *ngIf="showBlockModal()" (click)="closeBlockModal()">
        <div class="modal-card glass-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <span class="modal-kicker">{{ editingBlockId ? 'Editar Bloqueo / Tarifa' : 'Nuevo Bloqueo / Tarifa Especial' }}</span>
              <h2 class="modal-heading">{{ blockForm.reason || 'Configuración de Fechas' }}</h2>
            </div>
            <button class="btn-close" (click)="closeBlockModal()">×</button>
          </div>

          <form class="modal-form-body" (ngSubmit)="onSaveBlock()">
            <div class="form-group">
              <label>Alcance / Habitación *</label>
              <select [(ngModel)]="blockForm.roomId" name="blockRoomId">
                <option [ngValue]="null">Todo el Hotel (Bloqueo General)</option>
                <option *ngFor="let r of allRooms()" [ngValue]="r.id">
                  Habitación: {{ r.title }} ({{ r.bedConfiguration }})
                </option>
              </select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label>Fecha de Inicio *</label>
                <input type="date" [(ngModel)]="blockForm.startDate" name="blockStartDate" required />
              </div>
              <div class="form-group">
                <label>Fecha de Fin *</label>
                <input type="date" [(ngModel)]="blockForm.endDate" name="blockEndDate" required />
              </div>
            </div>

            <div class="form-group">
              <label>Tipo de Acción *</label>
              <div class="radio-card-row">
                <label class="radio-card" [class.selected]="blockForm.isBlocked">
                  <input type="radio" [(ngModel)]="blockForm.isBlocked" [value]="true" name="isBlockedChoice" />
                  <div class="radio-info">
                    <strong>Cerrar Fechas / Mantenimiento</strong>
                    <span>No permite reservas en el rango seleccionado.</span>
                  </div>
                </label>

                <label class="radio-card" [class.selected]="!blockForm.isBlocked">
                  <input type="radio" [(ngModel)]="blockForm.isBlocked" [value]="false" name="isBlockedChoice" />
                  <div class="radio-info">
                    <strong>Tarifa Especial de Temporada</strong>
                    <span>Mantiene abierta la habitación pero aplica una tarifa personalizada.</span>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group" *ngIf="!blockForm.isBlocked">
              <label>Tarifa Especial por Noche (S/) *</label>
              <input type="number" [(ngModel)]="blockForm.priceOverrideSoles" name="blockPrice" min="1" placeholder="Ej: 130" />
            </div>

            <div class="form-group">
              <label>Motivo o Nombre de la Temporada *</label>
              <input type="text" [(ngModel)]="blockForm.reason" name="blockReason" required placeholder="Ej: Fiesta Patronal Yaku Raymi / Mantenimiento preventivo" />
            </div>

            <div class="form-group">
              <label>Notas Internas (Opcional)</label>
              <textarea [(ngModel)]="blockForm.notes" name="blockNotes" rows="2" placeholder="Detalles operativos..."></textarea>
            </div>

            <div class="modal-footer-actions">
              <button type="button" class="btn-secondary" (click)="closeBlockModal()">Cancelar</button>
              <button type="submit" class="btn-primary">
                {{ editingBlockId ? 'Guardar Cambios' : 'Crear Bloqueo / Tarifa' }}
              </button>
            </div>
          </form>
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

    /* HEADER BADGES & CUSTOM BUTTONS */
    .header-badges {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }

    .badge-gold {
      background: var(--adm-gold-surface);
      border: 1px solid var(--adm-gold-border);
      color: var(--adm-gold);
      padding: 0.2rem 0.65rem;
      border-radius: var(--adm-r-full);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-stars {
      background: rgba(207, 161, 90, 0.12);
      border: 1px solid var(--adm-gold-border);
      color: var(--adm-gold);
      padding: 0.2rem 0.65rem;
      border-radius: var(--adm-r-full);
      font-size: 0.72rem;
      font-weight: 700;
    }

    .btn-return-tours {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.6rem 0.95rem;
      border-radius: var(--adm-r-sm);
      background: var(--adm-clay-surface);
      border: 1px solid var(--adm-clay-border);
      color: var(--adm-clay);
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-return-tours:hover {
      background: var(--adm-clay);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .btn-secondary-sm {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: var(--adm-r-sm);
      background: var(--adm-card-elevated);
      border: 1px solid var(--adm-border);
      color: var(--adm-text-title);
      cursor: pointer;
    }

    .btn-secondary-sm:hover {
      background: var(--adm-card-hover);
    }

    /* KPIS STATS RIBBON */
    .stat-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: var(--adm-r-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-blue { background: var(--adm-blue-surface); color: var(--adm-blue); }
    .icon-emerald { background: var(--adm-green-surface); color: var(--adm-green); }
    .icon-amber { background: var(--adm-amber-surface); color: var(--adm-amber); }
    .icon-purple { background: var(--adm-purple-surface); color: var(--adm-purple); }
    .icon-gold { background: var(--adm-gold-surface); color: var(--adm-gold); }

    .stat-data {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .stat-value-row {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .stat-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--adm-text-title);
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .stat-subval {
      font-size: 0.72rem;
      color: var(--adm-text-muted);
    }

    .stat-pill-pending {
      font-size: 0.7rem;
      background: var(--adm-amber-surface);
      color: var(--adm-amber);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
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
      border-color: var(--adm-gold);
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
    .form-section-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--adm-gold);
      margin-top: 0.5rem;
      padding-bottom: 0.35rem;
      border-bottom: 1px solid var(--adm-gold-border);
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

    /* CENTRO DE OPERACIONES DEL DÍA */
    .daily-reception-card {
      background: linear-gradient(135deg, rgba(14, 23, 30, 0.95), rgba(19, 31, 40, 0.85));
      border: 1px solid rgba(224, 159, 62, 0.25);
      border-radius: 14px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    }

    .reception-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .rec-badge-row {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.25rem;
    }

    .reception-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #e09f3e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .live-pulse-badge {
      font-size: 0.72rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      font-weight: 600;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .reception-heading {
      font-size: 1.4rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0.2rem 0;
      text-transform: capitalize;
    }

    .reception-sub {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
    }

    .reception-quick-actions {
      display: flex;
      gap: 0.6rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .btn-rec-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 0.9rem;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-rec-action:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border-color: rgba(224, 159, 62, 0.4);
    }

    .btn-gold-sm {
      background: #e09f3e !important;
      color: #0b1216 !important;
      font-weight: 700;
      border: none !important;
    }

    .reception-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .kpi-op-box {
      background: rgba(11, 18, 22, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
      padding: 1.1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: border-color 0.2s;
    }

    .kpi-op-box.highlight-active {
      border-color: rgba(224, 159, 62, 0.4);
      background: rgba(224, 159, 62, 0.03);
    }

    .kpi-op-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .kpi-op-icon {
      font-size: 1.4rem;
      width: 38px;
      height: 38px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.04);
    }

    .kpi-op-meta {
      display: flex;
      flex-direction: column;
    }

    .kpi-op-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .kpi-op-count {
      font-size: 1.3rem;
      font-weight: 800;
      color: #f8fafc;
    }

    .kpi-op-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 180px;
      overflow-y: auto;
    }

    .guest-action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0.5rem 0.65rem;
      border-radius: 6px;
      gap: 0.5rem;
    }

    .guest-action-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      font-size: 0.8rem;
    }

    .g-name {
      color: #f1f5f9;
      font-weight: 600;
    }

    .g-meta {
      color: #94a3b8;
      font-size: 0.72rem;
    }

    .balance-alert {
      color: #fbbf24;
      font-weight: 600;
    }

    .guest-action-btns {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-op-checkin {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 0.3rem 0.6rem;
      border-radius: 5px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-op-checkin:hover {
      background: #059669;
    }

    .btn-op-checkout {
      background: #c85a32;
      color: #ffffff;
      border: none;
      padding: 0.3rem 0.6rem;
      border-radius: 5px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-op-checkout:hover {
      background: #b54e28;
    }

    .pill-checked-in {
      font-size: 0.7rem;
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .pill-completed {
      font-size: 0.7rem;
      background: rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .btn-op-voucher, .btn-op-wa {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      padding: 0.25rem 0.45rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
      text-decoration: none;
      color: #cbd5e1;
    }

    .btn-op-voucher:hover, .btn-op-wa:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .kpi-op-empty {
      font-size: 0.8rem;
      color: #64748b;
      font-style: italic;
      padding: 0.4rem 0;
    }

    /* HOUSEKEEPING STATUS SUMMARY */
    .housekeeping-status-summary {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 0.8rem;
    }

    .hk-stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #cbd5e1;
    }

    .hk-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .dot-clean { background: #10b981; }
    .dot-occupied { background: #f59e0b; }
    .dot-dirty { background: #f97316; }
    .dot-maint { background: #ef4444; }

    .btn-hk-clean-all {
      margin-left: auto;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.7rem;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
    }

    /* OCCUPANCY GAUGE */
    .occupancy-gauge-box {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .gauge-track {
      width: 100%;
      height: 12px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 999px;
      overflow: hidden;
    }

    .gauge-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #e09f3e);
      border-radius: 999px;
      transition: width 0.4s ease;
    }

    .gauge-legend {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #94a3b8;
    }

    /* HOUSEKEEPING ROOM PILLS */
    .room-housekeeping-box {
      margin: 0.75rem 0;
      padding: 0.6rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .hk-label {
      display: block;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      font-weight: 700;
      margin-bottom: 0.4rem;
    }

    .hk-pills-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;
    }

    .hk-pill-btn {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 0.35rem 0.2rem;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
    }

    .hk-pill-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .hk-pill-clean.active {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #34d399;
    }

    .hk-pill-occupied.active {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #fbbf24;
    }

    .hk-pill-dirty.active {
      background: rgba(249, 115, 22, 0.2);
      border-color: #f97316;
      color: #fdba74;
    }

    .hk-pill-maint.active {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      color: #fca5a5;
    }

    .btn-action-block {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-action-block:hover {
      background: rgba(245, 158, 11, 0.25);
    }

    /* RACK DE OCUPACIÓN / TAPE CHART */
    .rack-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .rack-nav-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-rack-nav {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      font-size: 0.82rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-rack-nav:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    .rack-current-month {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0 0.5rem;
    }

    .month-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: #f8fafc;
      text-transform: capitalize;
    }

    .btn-rack-today {
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid rgba(224, 159, 62, 0.35);
      color: #e09f3e;
      padding: 0.45rem 0.75rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }

    .rack-quick-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rack-stat-chip {
      font-size: 0.82rem;
      color: #cbd5e1;
      background: rgba(0, 0, 0, 0.25);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .rk-val {
      color: #e09f3e;
      margin-left: 0.3rem;
    }

    .tape-chart-card {
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .tape-chart-scroll-wrapper {
      max-height: 650px;
      overflow: auto;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .tape-chart-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 1200px;
    }

    .sticky-col-header {
      position: sticky;
      left: 0;
      top: 0;
      z-index: 20;
      background: #0d151c;
      width: 260px;
      min-width: 260px;
      padding: 0.85rem 1rem;
      text-align: left;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      border-right: 2px solid rgba(255, 255, 255, 0.1);
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }

    .day-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #0e171e;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0.5rem 0.2rem;
      text-align: center;
      width: 44px;
      min-width: 44px;
    }

    .day-header.is-today {
      background: rgba(224, 159, 62, 0.15);
      border-bottom-color: #e09f3e;
    }

    .day-header.is-weekend {
      background: rgba(255, 255, 255, 0.02);
    }

    .day-name {
      display: block;
      font-size: 0.65rem;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }

    .day-num {
      display: block;
      font-size: 0.95rem;
      color: #f1f5f9;
      font-weight: 700;
    }

    .today-marker {
      display: block;
      font-size: 0.55rem;
      background: #e09f3e;
      color: #0b1216;
      border-radius: 2px;
      font-weight: 800;
      margin-top: 0.1rem;
    }

    .sticky-room-cell {
      position: sticky;
      left: 0;
      z-index: 5;
      background: #0d151c;
      border-right: 2px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0.75rem 1rem;
    }

    .rack-room-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rack-room-thumb {
      width: 44px;
      height: 44px;
      border-radius: 6px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .rack-room-text {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      overflow: hidden;
    }

    .rack-room-name {
      font-size: 0.85rem;
      color: #f8fafc;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rack-room-meta {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .rack-hk-mini {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.15rem;
    }

    .hk-mini-text {
      font-size: 0.68rem;
      color: #cbd5e1;
    }

    .tape-day-cell {
      border-right: 1px solid rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding: 0.25rem 0.15rem;
      vertical-align: middle;
      text-align: center;
      height: 52px;
      cursor: pointer;
      position: relative;
    }

    .tape-day-cell.is-today {
      background: rgba(224, 159, 62, 0.04);
    }

    .tape-day-cell.is-weekend {
      background: rgba(255, 255, 255, 0.01);
    }

    .tape-booking-block {
      background: #10b981;
      color: #ffffff;
      padding: 0.25rem 0.3rem;
      border-radius: 4px;
      font-size: 0.68rem;
      font-weight: 700;
      height: 42px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s;
    }

    .tape-booking-block:hover {
      transform: scale(1.04);
      z-index: 2;
    }

    .bk-confirmed { background: #059669; }
    .bk-checkin { background: #3b82f6; }
    .bk-pending { background: #d97706; }
    .bk-completed { background: #475569; }

    .bk-guest-label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.68rem;
    }

    .bk-code-label {
      font-size: 0.58rem;
      opacity: 0.85;
    }

    .tape-blocked-block {
      background: #dc2626;
      color: #ffffff;
      padding: 0.2rem;
      border-radius: 4px;
      font-size: 0.65rem;
      font-weight: 700;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .blk-closed { background: rgba(239, 68, 68, 0.3); border: 1px dashed #ef4444; color: #fca5a5; }
    .blk-special { background: rgba(224, 159, 62, 0.25); border: 1px dashed #e09f3e; color: #fde68a; }

    .tape-free-slot {
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.15s;
    }

    .tape-free-slot:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .free-plus {
      color: rgba(255, 255, 255, 0.15);
      font-size: 0.9rem;
      font-weight: 300;
    }

    .tape-free-slot:hover .free-plus {
      color: #e09f3e;
    }

    .tape-legend-bar {
      padding: 1rem 1.25rem;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .legend-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    .legend-items {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      font-size: 0.78rem;
      color: #cbd5e1;
    }

    .leg-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .leg-color {
      width: 14px;
      height: 14px;
      border-radius: 3px;
    }

    .leg-free { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); }
    .leg-conf { background: #059669; }
    .leg-in { background: #3b82f6; }
    .leg-pend { background: #d97706; }
    .leg-block { background: rgba(239, 68, 68, 0.4); border: 1px dashed #ef4444; }
    .leg-special { background: rgba(224, 159, 62, 0.4); border: 1px dashed #e09f3e; }

    .legend-hint {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* BLOCKS & TEMPORADA TAB */
    .blocks-page-card {
      border-radius: 12px;
      padding: 1.5rem;
    }

    .blocks-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .blocks-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 0.35rem;
    }

    .blocks-sub {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      max-width: 700px;
    }

    .blk-room-cell strong {
      color: #f1f5f9;
      font-size: 0.88rem;
    }

    .blk-reason-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .blk-tag {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }

    .blk-tag-closed {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }

    .blk-tag-rate {
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid rgba(224, 159, 62, 0.3);
      color: #fde68a;
    }

    .blk-reason-text {
      font-size: 0.82rem;
      color: #cbd5e1;
    }

    .special-rate-tag {
      font-weight: 700;
      color: #e09f3e;
      font-size: 0.88rem;
    }

    .badge-status-active {
      font-size: 0.72rem;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .radio-card-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .radio-card {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .radio-card.selected {
      border-color: #e09f3e;
      background: rgba(224, 159, 62, 0.08);
    }

    .radio-info {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .radio-info strong {
      font-size: 0.85rem;
      color: #f1f5f9;
    }

    .radio-info span {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* VOUCHER MODAL & TICKET PRINT */
    .voucher-modal-backdrop {
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .voucher-modal-card {
      background: #0d151c;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    }

    .voucher-modal-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }

    .v-top-left {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .v-pill-code {
      font-size: 0.78rem;
      font-weight: 800;
      color: #e09f3e;
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid rgba(224, 159, 62, 0.3);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
    }

    .v-pill-status {
      font-size: 0.75rem;
      font-weight: 700;
      color: #fbbf24;
      background: rgba(245, 158, 11, 0.15);
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
    }

    .v-pill-status.v-st-paid {
      color: #34d399;
      background: rgba(16, 185, 129, 0.15);
    }

    .v-top-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-v-print {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      padding: 0.45rem 0.8rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-v-print:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }

    .btn-v-wa {
      background: #25d366;
      color: #ffffff;
      border: none;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-v-wa:hover {
      background: #1eb857;
    }

    .voucher-ticket-paper {
      padding: 1.75rem;
      background: #ffffff;
      color: #0f172a;
    }

    .v-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .v-hotel-kicker {
      display: block;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #c85a32;
    }

    .v-hotel-name {
      font-size: 1.5rem;
      font-weight: 900;
      color: #0b1216;
      margin: 0.2rem 0;
    }

    .v-hotel-sub {
      font-size: 0.78rem;
      color: #475569;
      margin: 0;
      max-width: 380px;
    }

    .v-code-box {
      text-align: right;
    }

    .v-code-label {
      display: block;
      font-size: 0.65rem;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 0.05em;
    }

    .v-code-val {
      font-size: 1.4rem;
      font-weight: 900;
      color: #e09f3e;
      font-family: monospace;
    }

    .v-date-issued {
      display: block;
      font-size: 0.7rem;
      color: #64748b;
    }

    .v-divider-dashed {
      border-top: 2px dashed #cbd5e1;
      margin: 1.25rem 0;
    }

    .v-grid-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
    }

    .v-section-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
    }

    .v-sec-title {
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.4rem;
    }

    .v-data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.35rem;
      font-size: 0.82rem;
    }

    .v-lbl {
      color: #64748b;
    }

    .v-val {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
    }

    .highlight-room {
      color: #c85a32;
    }

    .v-finance-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .v-finance-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
    }

    .v-fin-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .v-fin-lbl {
      font-size: 0.7rem;
      color: #475569;
      font-weight: 600;
    }

    .v-fin-val {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }

    .highlight-balance .balance-number {
      color: #dc2626;
      font-size: 1.05rem;
    }

    .v-footer-notes {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 6px;
      padding: 0.75rem;
      font-size: 0.78rem;
      color: #92400e;
      margin-bottom: 1rem;
    }

    .v-footer-notes p {
      margin: 0.2rem 0 0;
    }

    .v-policy-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      font-size: 0.72rem;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 0.75rem;
    }

    .voucher-modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.2);
    }

    .btn-mark-paid {
      background: #10b981;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-mark-paid:hover {
      background: #059669;
    }

    .btn-voucher-sm {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      background: rgba(224, 159, 62, 0.15);
      border: 1px solid rgba(224, 159, 62, 0.35);
      color: #e09f3e;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-voucher-sm:hover {
      background: #e09f3e;
      color: #0b1216;
    }

    /* PRINT RULES */
    @media print {
      body * {
        visibility: hidden;
      }
      #voucherPrintArea, #voucherPrintArea * {
        visibility: visible;
      }
      #voucherPrintArea {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: #ffffff !important;
        color: #000000 !important;
      }
      .no-print {
        display: none !important;
      }
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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Active tab: 'rooms' | 'rack' | 'bookings' | 'blocks' | 'profile'
  activeTab = signal<'rooms' | 'rack' | 'bookings' | 'blocks' | 'profile'>('rooms');

  selectTab(tab: 'rooms' | 'rack' | 'bookings' | 'blocks' | 'profile'): void {
    this.activeTab.set(tab);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  // Signals
  hotelInfo = this.adminService.hotelInfoSignal;
  hotelBookings = this.adminService.hotelBookingsSignal;
  hotelDateBlocks = this.adminService.hotelDateBlocksSignal;

  // Rack / Tape Chart State
  rackMonth = signal<number>(new Date().getMonth());
  rackYear = signal<number>(new Date().getFullYear());

  // Voucher Modal
  selectedVoucherBooking = signal<HotelBooking | null>(null);

  // Date Block Modal
  showBlockModal = signal<boolean>(false);
  editingBlockId: number | null = null;
  blockForm: HotelDateBlock = this.createEmptyBlock();

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

  // CENTRO DE OPERACIONES DEL DÍA (COMPUTED)
  todayFormatted = computed(() => {
    const d = new Date();
    return d.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  });

  todayDateStr = computed(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  todayCheckIns = computed(() => {
    const today = this.todayDateStr();
    return this.hotelBookings().filter(b => b.checkInDate === today && b.status !== 'Cancelled');
  });

  todayCheckOuts = computed(() => {
    const today = this.todayDateStr();
    return this.hotelBookings().filter(b => b.checkOutDate === today && b.status !== 'Cancelled');
  });

  activeOccupiedCount = computed(() => {
    return this.allRooms().filter(r => r.housekeepingStatus === 'occupied').length;
  });

  cleanRoomsCount = computed(() => {
    return this.allRooms().filter(r => (r.housekeepingStatus || 'clean') === 'clean').length;
  });

  dirtyRoomsCount = computed(() => {
    return this.allRooms().filter(r => r.housekeepingStatus === 'dirty').length;
  });

  maintenanceRoomsCount = computed(() => {
    return this.allRooms().filter(r => r.housekeepingStatus === 'maintenance').length;
  });

  occupancyRatePercent = computed(() => {
    const total = this.totalRooms();
    if (total === 0) return 0;
    const occupied = this.activeOccupiedCount();
    return Math.round((occupied / total) * 100);
  });

  // RACK TAPE CHART (COMPUTED)
  rackMonthName = computed(() => {
    const date = new Date(this.rackYear(), this.rackMonth(), 1);
    return date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  });

  rackDays = computed(() => {
    const year = this.rackYear();
    const month = this.rackMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr = this.todayDateStr();
    const days: Array<{ dayNum: number; dayName: string; dateStr: string; isToday: boolean; isWeekend: boolean }> = [];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const dayOfWeek = dt.getDay();

      days.push({
        dayNum: d,
        dayName: dayNames[dayOfWeek],
        dateStr,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      });
    }
    return days;
  });

  monthBookedNights = computed(() => {
    let count = 0;
    const days = this.rackDays();
    for (const d of days) {
      for (const room of this.allRooms()) {
        if (this.getBookingForRoomDay(room.id, d.dateStr)) {
          count++;
        }
      }
    }
    return count;
  });

  monthOccupancyPercent = computed(() => {
    const totalRoomDays = this.totalRooms() * this.rackDays().length;
    if (totalRoomDays === 0) return 0;
    const booked = this.monthBookedNights();
    return Math.round((booked / totalRoomDays) * 100);
  });

  ngOnInit(): void {
    this.loadData();
    this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab') as any;
      if (tab === 'rooms' || tab === 'rack' || tab === 'bookings' || tab === 'blocks' || tab === 'profile') {
        this.activeTab.set(tab);
      }
    });
  }

  loadData(): void {
    this.adminService.getHotelInfo(true).subscribe(info => {
      this.populateProfileForm(info);
    });
    this.adminService.getHotelBookings().subscribe();
    this.adminService.getHotelDateBlocks().subscribe();
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

  private createEmptyBlock(): HotelDateBlock {
    const today = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 3600000);
    return {
      id: 0,
      roomId: null,
      startDate: today.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      reason: '',
      isBlocked: true,
      priceOverrideSoles: undefined,
      notes: ''
    };
  }

  // --- RACK (TAPE CHART) & CALENDAR NAVIGATION ---

  prevRackMonth(): void {
    let m = this.rackMonth() - 1;
    let y = this.rackYear();
    if (m < 0) {
      m = 11;
      y--;
    }
    this.rackMonth.set(m);
    this.rackYear.set(y);
  }

  nextRackMonth(): void {
    let m = this.rackMonth() + 1;
    let y = this.rackYear();
    if (m > 11) {
      m = 0;
      y++;
    }
    this.rackMonth.set(m);
    this.rackYear.set(y);
  }

  goToTodayRack(): void {
    const now = new Date();
    this.rackMonth.set(now.getMonth());
    this.rackYear.set(now.getFullYear());
  }

  getBookingForRoomDay(roomId: number, dateStr: string): HotelBooking | undefined {
    return this.hotelBookings().find(b => {
      if (b.status === 'Cancelled') return false;
      if (b.roomId !== roomId) return false;
      // Date in range [checkInDate, checkOutDate)
      return b.checkInDate <= dateStr && dateStr < b.checkOutDate;
    });
  }

  getDateBlockForRoomDay(roomId: number, dateStr: string): HotelDateBlock | undefined {
    return this.hotelDateBlocks().find(blk => {
      if (blk.roomId && blk.roomId !== roomId) return false;
      return blk.startDate <= dateStr && dateStr <= blk.endDate;
    });
  }

  onRackCellClick(room: HotelRoom, dateStr: string): void {
    const booking = this.getBookingForRoomDay(room.id, dateStr);
    if (booking) {
      this.openGuestVoucherModal(booking);
      return;
    }

    const block = this.getDateBlockForRoomDay(room.id, dateStr);
    if (block) {
      this.openEditBlockModal(block);
      return;
    }

    // Open booking modal prefilled with room and date
    this.editingBookingId = null;
    this.bookingForm = this.createEmptyBooking();
    this.bookingForm.roomId = room.id;
    this.bookingForm.roomTitle = room.title;
    this.bookingForm.checkInDate = dateStr;
    const nextDay = new Date(new Date(dateStr).getTime() + 24 * 3600000);
    this.bookingForm.checkOutDate = nextDay.toISOString().split('T')[0];
    this.calcNightsAndTotal();
    this.showBookingModal.set(true);
  }

  // --- CENTRO DE OPERACIONES DEL DÍA (RECEPCIÓN RÁPIDA) ---

  onQuickCheckIn(b: HotelBooking): void {
    this.adminService.updateHotelBookingStatus(b.id, 'CheckedIn').subscribe(() => {
      this.adminService.updateRoomHousekeeping(b.roomId, 'occupied').subscribe();
      this.showToast(`✓ Check-In registrado para ${b.guestName}. Habitación marcada como Ocupada.`);
    });
  }

  onQuickCheckOut(b: HotelBooking): void {
    this.adminService.updateHotelBookingStatus(b.id, 'Completed').subscribe(() => {
      this.adminService.updateRoomHousekeeping(b.roomId, 'dirty').subscribe();
      this.showToast(`✓ Check-Out completado para ${b.guestName}. Habitación marcada para Limpieza.`);
    });
  }

  // --- HOUSEKEEPING CONTROL ---

  onMarkAllClean(): void {
    const rooms = this.allRooms().filter(r => r.housekeepingStatus === 'dirty');
    rooms.forEach(r => {
      this.adminService.updateRoomHousekeeping(r.id, 'clean').subscribe();
    });
    this.showToast('✓ Todas las habitaciones han sido marcadas como Limpias');
  }

  onUpdateHousekeeping(roomId: number, status: 'clean' | 'occupied' | 'dirty' | 'maintenance'): void {
    this.adminService.updateRoomHousekeeping(roomId, status).subscribe(() => {
      this.showToast(`✓ Estado de limpieza actualizado a: ${status}`);
    });
  }

  // --- FICHA DE HUÉSPED & VOUCHER ---

  openGuestVoucherModal(b: HotelBooking): void {
    this.selectedVoucherBooking.set(b);
  }

  closeGuestVoucherModal(): void {
    this.selectedVoucherBooking.set(null);
  }

  onSendVoucherWhatsApp(b: HotelBooking): void {
    const hotel = this.hotelInfo();
    const balance = b.totalPriceSoles - (b.paidAmountSoles || 0);
    const balanceMsg = balance > 0 
      ? `Saldo pendiente al ingreso: S/ ${balance}` 
      : `Estado de pago: 100% CANCELADO`;

    const text = encodeURIComponent(
      `¡Hola ${b.guestName}! Le confirmamos su reserva oficial en *${hotel?.name || 'Hotel Punto Clave'}* (Valle del Sondondo Expeditions).\n\n` +
      `*Código de Voucher:* ${b.voucherCode}\n` +
      `*Habitación:* ${b.roomTitle}\n` +
      `*Check-In:* ${b.checkInDate} (${hotel?.checkInTime || '13:00 hrs'})\n` +
      `*Check-Out:* ${b.checkOutDate} (${hotel?.checkOutTime || '12:00 hrs'})\n` +
      `*Estadía:* ${b.nights} noche(s) - ${b.numberOfGuests} huésped(es)\n` +
      `*Total:* S/ ${b.totalPriceSoles} (${balanceMsg})\n` +
      `*Ubicación:* ${hotel?.address || 'Plaza Principal'}, ${hotel?.city || 'Cabana Sur'}\n\n` +
      `¡Los esperamos con los brazos abiertos en el hermoso Valle del Sondondo!`
    );

    let phone = (b.guestPhone || '').replace(/\D/g, '');
    if (!phone.startsWith('51') && phone.length === 9) {
      phone = '51' + phone;
    }

    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
  }

  onPrintVoucher(): void {
    window.print();
  }

  onMarkBookingPaid(b: HotelBooking): void {
    const updated: HotelBooking = {
      ...b,
      paidAmountSoles: b.totalPriceSoles,
      paymentStatus: 'Pagado 100%',
      status: b.status === 'Pending' ? 'Confirmed' : b.status
    };
    this.adminService.saveHotelBooking(updated).subscribe(() => {
      this.selectedVoucherBooking.set(updated);
      this.showToast(`✓ Reserva ${b.voucherCode} marcada como Pagada 100%`);
    });
  }

  // --- BLOQUEOS DE FECHAS & TARIFAS DE TEMPORADA ---

  openCreateBlockModal(roomId?: number): void {
    this.editingBlockId = null;
    this.blockForm = this.createEmptyBlock();
    if (roomId) {
      this.blockForm.roomId = roomId;
      const room = this.allRooms().find(r => r.id === roomId);
      if (room) this.blockForm.roomTitle = room.title;
    }
    this.showBlockModal.set(true);
  }

  openEditBlockModal(block: HotelDateBlock): void {
    this.editingBlockId = block.id;
    this.blockForm = JSON.parse(JSON.stringify(block));
    this.showBlockModal.set(true);
  }

  closeBlockModal(): void {
    this.showBlockModal.set(false);
  }

  onSaveBlock(): void {
    if (!this.blockForm.startDate || !this.blockForm.endDate || !this.blockForm.reason) {
      alert('Por favor completa las fechas y el motivo.');
      return;
    }

    if (this.blockForm.roomId) {
      const room = this.allRooms().find(r => r.id === this.blockForm.roomId);
      if (room) this.blockForm.roomTitle = room.title;
    } else {
      this.blockForm.roomTitle = undefined;
    }

    this.adminService.saveHotelDateBlock(this.blockForm).subscribe(() => {
      this.showToast(this.editingBlockId ? '✓ Bloqueo o tarifa actualizada' : '✓ Nuevo bloqueo o tarifa especial configurada');
      this.closeBlockModal();
    });
  }

  onDeleteBlock(id: number): void {
    if (confirm('¿Deseas eliminar este bloqueo / tarifa especial?')) {
      this.adminService.deleteHotelDateBlock(id).subscribe(() => {
        this.showToast('✓ Bloqueo eliminado');
      });
    }
  }
}
