import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { DashboardStats, AdminBooking } from '../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Panel General</h1>
          <p class="page-desc">Métricas y cotizaciones en tiempo real para Valle del Sondondo Expeditions</p>
        </div>
        <div class="header-actions">
          <a routerLink="/admin/tours" class="btn-action btn-primary">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Crear Tour</span>
          </a>
          <a routerLink="/admin/reservas" class="btn-action btn-secondary">
            Ver Todas las Reservas
          </a>
        </div>
      </div>

      <!-- STAT CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon icon-pending">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Pendientes de Atención</span>
            <span class="stat-value text-amber">{{ stats()?.pendingBookings ?? 0 }}</span>
            <span class="stat-hint">Requieren contacto inmediato</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-confirmed">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Reservas Confirmadas</span>
            <span class="stat-value text-green">{{ stats()?.confirmedBookings ?? 0 }}</span>
            <span class="stat-hint">Tours coordinados</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-tours">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Tours Activos en Web</span>
            <span class="stat-value">{{ stats()?.activeTours ?? 0 }}</span>
            <span class="stat-hint">Circuitos en Ayacucho</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon icon-messages">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Mensajes Nuevos</span>
            <span class="stat-value text-blue">{{ stats()?.unreadMessages ?? 0 }}</span>
            <span class="stat-hint">Formulario de contacto</span>
          </div>
        </div>
      </div>

      <!-- RECENT BOOKINGS TABLE -->
      <div class="section-box">
        <div class="section-box-header">
          <div>
            <h2 class="section-title">Últimas Solicitudes de Cotización / Reserva</h2>
            <p class="section-subtitle">Cotizaciones recibidas desde la web oficial</p>
          </div>
          <a routerLink="/admin/reservas" class="view-all-link">Ver todas →</a>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Tour Solicitado</th>
                <th>Pasajeros</th>
                <th>Fecha Tentativa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of stats()?.recentBookings">
                <td>
                  <div class="client-cell">
                    <strong class="client-name">{{ booking.fullName }}</strong>
                    <span class="client-phone">{{ booking.phone }}</span>
                  </div>
                </td>
                <td>
                  <span class="tour-name-cell">{{ booking.tourTitle }}</span>
                </td>
                <td>
                  <span class="passengers-badge">{{ booking.numberOfPeople }} personas</span>
                </td>
                <td>
                  {{ booking.travelDate ? (booking.travelDate | date:'dd/MM/yyyy') : 'Por coordinar' }}
                </td>
                <td>
                  <span class="status-badge" [ngClass]="booking.status.toLowerCase()">
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <a 
                      [href]="booking.whatsAppDirectUrl" 
                      target="_blank" 
                      class="btn-table-action btn-wa" 
                      title="Contactar al cliente por WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <select 
                      [value]="booking.status" 
                      (change)="onStatusChange(booking.id, $event)"
                      class="status-select"
                    >
                      <option value="Pending">Pendiente</option>
                      <option value="Contacted">Contactado</option>
                      <option value="Confirmed">Confirmado</option>
                      <option value="Cancelled">Cancelado</option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr *ngIf="!stats()?.recentBookings?.length">
                <td colspan="6" class="text-center py-4">No hay reservas registradas aún.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
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

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.65rem 1.15rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }

    .btn-primary {
      background: #c85a32;
      color: #ffffff;
    }

    .btn-primary:hover {
      background: #b34a24;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }

    /* STATS GRID */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .stat-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-pending {
      background: rgba(224, 159, 62, 0.15);
      color: #e09f3e;
      border: 1px solid rgba(224, 159, 62, 0.3);
    }

    .icon-confirmed {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .icon-tours {
      background: rgba(200, 90, 50, 0.15);
      color: #f97316;
      border: 1px solid rgba(200, 90, 50, 0.3);
    }

    .icon-messages {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-value {
      font-size: 1.85rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0.25rem 0;
      line-height: 1.1;
    }

    .text-amber { color: #f59e0b; }
    .text-green { color: #10b981; }
    .text-blue { color: #3b82f6; }

    .stat-hint {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* SECTION BOX */
    .section-box {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .section-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding-bottom: 1rem;
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.25rem;
    }

    .section-subtitle {
      font-size: 0.82rem;
      color: #94a3b8;
      margin: 0;
    }

    .view-all-link {
      color: #e09f3e;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .view-all-link:hover {
      color: #f59e0b;
      text-decoration: underline;
    }

    /* TABLE */
    .table-responsive {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;
    }

    .data-table th {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      color: #94a3b8;
      font-weight: 600;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
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

    .client-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .client-name {
      color: #f8fafc;
      font-weight: 700;
    }

    .client-phone {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .tour-name-cell {
      font-weight: 600;
      color: #e2e8f0;
      max-width: 280px;
      display: inline-block;
    }

    .passengers-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .status-badge {
      display: inline-block;
      padding: 0.3rem 0.7rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-badge.pending {
      background: rgba(224, 159, 62, 0.15);
      color: #f59e0b;
      border: 1px solid rgba(224, 159, 62, 0.3);
    }

    .status-badge.contacted {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .status-badge.confirmed {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .status-badge.cancelled {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .table-actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .btn-table-action {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
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

    .status-select {
      background: #0e171e;
      border: 1px solid #233440;
      color: #cbd5e1;
      border-radius: 6px;
      padding: 0.35rem 0.5rem;
      font-size: 0.78rem;
      outline: none;
      cursor: pointer;
    }

    .status-select:focus {
      border-color: #e09f3e;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<DashboardStats | null>(null);

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.adminService.getDashboardStats().subscribe(res => {
      this.stats.set(res);
    });
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'Pendiente';
      case 'contacted': return 'Contactado';
      case 'confirmed': return 'Confirmado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  onStatusChange(id: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as any;
    this.adminService.updateBookingStatus(id, newStatus).subscribe(() => {
      this.loadStats();
    });
  }
}
