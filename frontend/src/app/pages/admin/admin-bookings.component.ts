import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminBooking } from '../../models/admin.model';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bookings-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Reservas & Cotizaciones</h1>
          <p class="page-desc">Gestiona las solicitudes de viajeros y contáctalos directamente vía WhatsApp</p>
        </div>
      </div>

      <!-- CONTROLS: FILTERS & SEARCH -->
      <div class="controls-bar">
        <div class="filter-pills">
          <button 
            class="pill" 
            [class.active]="selectedStatus() === 'all'" 
            (click)="setStatusFilter('all')"
          >
            Todas ({{ allCount() }})
          </button>
          <button 
            class="pill pill-pending" 
            [class.active]="selectedStatus() === 'Pending'" 
            (click)="setStatusFilter('Pending')"
          >
            Pendientes ({{ pendingCount() }})
          </button>
          <button 
            class="pill pill-contacted" 
            [class.active]="selectedStatus() === 'Contacted'" 
            (click)="setStatusFilter('Contacted')"
          >
            Contactadas
          </button>
          <button 
            class="pill pill-confirmed" 
            [class.active]="selectedStatus() === 'Confirmed'" 
            (click)="setStatusFilter('Confirmed')"
          >
            Confirmadas
          </button>
          <button 
            class="pill pill-cancelled" 
            [class.active]="selectedStatus() === 'Cancelled'" 
            (click)="setStatusFilter('Cancelled')"
          >
            Canceladas
          </button>
        </div>

        <div class="search-box">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            (ngModelChange)="onSearchChange()" 
            placeholder="Buscar por cliente, teléfono o tour..."
          />
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Tour Seleccionado</th>
                <th>Grupo</th>
                <th>Fecha Tentativa</th>
                <th>Mensaje / Consulta</th>
                <th>Estado</th>
                <th>Contacto & Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of filteredBookings()">
                <td class="id-cell">#{{ booking.id }}</td>
                <td>
                  <div class="client-info">
                    <strong class="client-name">{{ booking.fullName }}</strong>
                    <span class="client-phone">{{ booking.phone }}</span>
                    <span class="client-email">{{ booking.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="tour-badge">{{ booking.tourTitle }}</span>
                </td>
                <td>
                  <span class="passengers-pill">{{ booking.numberOfPeople }} pax</span>
                </td>
                <td>
                  <div class="date-cell">
                    <span>{{ booking.travelDate ? (booking.travelDate | date:'dd/MM/yyyy') : 'Sin fecha fija' }}</span>
                    <small class="created-at">Enviado: {{ booking.createdAt | date:'shortDate' }}</small>
                  </div>
                </td>
                <td>
                  <div class="message-preview" (click)="openDetail(booking)" title="Ver mensaje completo">
                    <span class="message-snippet">{{ booking.message || 'Sin mensaje adicional' }}</span>
                    <span *ngIf="booking.message" class="more-link">Ver más</span>
                  </div>
                </td>
                <td>
                  <select 
                    [value]="booking.status" 
                    (change)="onStatusChange(booking.id, $event)"
                    class="status-dropdown"
                    [ngClass]="booking.status.toLowerCase()"
                  >
                    <option value="Pending">⏳ Pendiente</option>
                    <option value="Contacted">💬 Contactado</option>
                    <option value="Confirmed">✅ Confirmado</option>
                    <option value="Cancelled">❌ Cancelado</option>
                  </select>
                </td>
                <td>
                  <div class="action-buttons">
                    <!-- WhatsApp Direct -->
                    <a 
                      [href]="booking.whatsAppDirectUrl" 
                      target="_blank" 
                      class="btn-icon btn-wa" 
                      title="Abrir WhatsApp con mensaje pre-redactado"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <!-- Detail Modal Trigger -->
                    <button class="btn-icon btn-detail" (click)="openDetail(booking)" title="Ver detalle completo">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <!-- Delete -->
                    <button class="btn-icon btn-delete" (click)="onDelete(booking.id)" title="Eliminar registro">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="filteredBookings().length === 0">
                <td colspan="8" class="empty-state">
                  <p>No se encontraron solicitudes con los filtros aplicados.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DETAIL MODAL -->
      <div class="modal-backdrop" *ngIf="selectedBooking()" (click)="closeDetail()">
        <div class="detail-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalle de la Solicitud #{{ selectedBooking()?.id }}</h3>
            <button class="btn-close" (click)="closeDetail()">×</button>
          </div>

          <div class="modal-body" *ngIf="selectedBooking() as b">
            <div class="detail-row">
              <span class="detail-label">Cliente:</span>
              <span class="detail-value font-bold">{{ b.fullName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Teléfono:</span>
              <span class="detail-value">{{ b.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Correo:</span>
              <span class="detail-value">{{ b.email }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tour Solicitado:</span>
              <span class="detail-value text-accent font-bold">{{ b.tourTitle }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pasajeros:</span>
              <span class="detail-value">{{ b.numberOfPeople }} persona(s)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha de Viaje:</span>
              <span class="detail-value">{{ b.travelDate ? (b.travelDate | date:'fullDate') : 'Por coordinar' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha de Envío:</span>
              <span class="detail-value">{{ b.createdAt | date:'medium' }}</span>
            </div>

            <div class="message-box">
              <span class="message-label">Mensaje o comentarios del viajero:</span>
              <p class="message-content">{{ b.message || 'El cliente no adjuntó un mensaje adicional.' }}</p>
            </div>
          </div>

          <div class="modal-footer" *ngIf="selectedBooking() as b">
            <a [href]="b.whatsAppDirectUrl" target="_blank" class="btn-modal-wa">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
              </svg>
              <span>Contactar por WhatsApp</span>
            </a>
            <button class="btn-modal-close" (click)="closeDetail()">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bookings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 0.25rem;
      letter-spacing: -0.02em;
    }

    .page-desc {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0;
    }

    /* CONTROLS */
    .controls-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
      background: #121c23;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .filter-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      border-radius: 9999px;
      padding: 0.4rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pill:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }

    .pill.active {
      background: #c85a32;
      border-color: #c85a32;
      color: #ffffff;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 280px;
    }

    .search-icon {
      position: absolute;
      left: 0.85rem;
      color: #64748b;
      pointer-events: none;
    }

    .search-box input {
      width: 100%;
      background: #090f13;
      border: 1px solid #233440;
      border-radius: 8px;
      padding: 0.5rem 0.85rem 0.5rem 2.4rem;
      color: #f8fafc;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .search-box input:focus {
      border-color: #e09f3e;
    }

    /* TABLE */
    .table-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }

    .data-table th {
      background: rgba(255, 255, 255, 0.03);
      padding: 0.85rem 1rem;
      color: #94a3b8;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      vertical-align: middle;
    }

    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .id-cell {
      font-weight: 700;
      color: #64748b;
    }

    .client-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .client-name {
      color: #f8fafc;
      font-weight: 700;
    }

    .client-phone {
      color: #94a3b8;
      font-size: 0.78rem;
    }

    .client-email {
      color: #64748b;
      font-size: 0.75rem;
    }

    .tour-badge {
      display: inline-block;
      max-width: 220px;
      font-weight: 600;
      color: #e09f3e;
      line-height: 1.3;
    }

    .passengers-pill {
      background: rgba(255, 255, 255, 0.06);
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .created-at {
      font-size: 0.72rem;
      color: #64748b;
    }

    .message-preview {
      max-width: 200px;
      cursor: pointer;
    }

    .message-snippet {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .more-link {
      font-size: 0.72rem;
      color: #e09f3e;
      display: block;
      margin-top: 0.15rem;
    }

    .status-dropdown {
      background: #090f13;
      border: 1px solid #233440;
      color: #f8fafc;
      border-radius: 6px;
      padding: 0.4rem 0.65rem;
      font-size: 0.78rem;
      font-weight: 600;
      outline: none;
      cursor: pointer;
    }

    .status-dropdown.pending { border-color: #f59e0b; color: #f59e0b; }
    .status-dropdown.contacted { border-color: #3b82f6; color: #60a5fa; }
    .status-dropdown.confirmed { border-color: #10b981; color: #4ade80; }
    .status-dropdown.cancelled { border-color: #ef4444; color: #f87171; }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      padding: 0.4rem 0.65rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-wa {
      background: #25D366;
      color: #ffffff;
    }

    .btn-wa:hover {
      background: #20ba59;
    }

    .btn-detail {
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .btn-detail:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }

    .btn-delete {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 1000;
    }

    .detail-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-header h3 {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .btn-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
      line-height: 1;
    }

    .btn-close:hover {
      color: #ffffff;
    }

    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding-bottom: 0.4rem;
    }

    .detail-label {
      color: #94a3b8;
    }

    .detail-value {
      color: #f1f5f9;
      text-align: right;
    }

    .font-bold { font-weight: 700; }
    .text-accent { color: #e09f3e; }

    .message-box {
      margin-top: 0.5rem;
      background: #090f13;
      border-radius: 8px;
      padding: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .message-label {
      font-size: 0.78rem;
      color: #94a3b8;
      font-weight: 600;
      display: block;
      margin-bottom: 0.35rem;
    }

    .message-content {
      font-size: 0.85rem;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0;
      white-space: pre-wrap;
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-modal-wa {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #25D366;
      color: #ffffff;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
    }

    .btn-modal-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #f1f5f9;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  private adminService = inject(AdminService);

  bookings = signal<AdminBooking[]>([]);
  selectedStatus = signal<string>('all');
  searchQuery = '';
  selectedBooking = signal<AdminBooking | null>(null);

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.adminService.getBookings().subscribe(res => {
      this.bookings.set(res);
    });
  }

  allCount(): number {
    return this.bookings().length;
  }

  pendingCount(): number {
    return this.bookings().filter(b => b.status === 'Pending').length;
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
  }

  onSearchChange(): void {}

  filteredBookings(): AdminBooking[] {
    let list = this.bookings();
    const status = this.selectedStatus();
    if (status !== 'all') {
      list = list.filter(b => b.status === status);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(b => 
        b.fullName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.tourTitle.toLowerCase().includes(q)
      );
    }
    return list;
  }

  onStatusChange(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as any;
    this.adminService.updateBookingStatus(id, newStatus).subscribe(() => {
      this.loadBookings();
    });
  }

  openDetail(booking: AdminBooking): void {
    this.selectedBooking.set(booking);
  }

  closeDetail(): void {
    this.selectedBooking.set(null);
  }

  onDelete(id: number): void {
    if (confirm(`¿Deseas eliminar la solicitud #${id}? Esta acción no se puede deshacer.`)) {
      this.adminService.deleteBooking(id).subscribe(() => {
        this.loadBookings();
      });
    }
  }
}
