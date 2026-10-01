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
        <div class="page-header-titles">
          <div class="page-eyebrow">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Operaciones de Expediciones</span>
          </div>
          <h1 class="page-title">Dashboard General</h1>
          <p class="page-desc">Métricas operativas, solicitudes de viaje y cotizaciones en tiempo real</p>
        </div>

        <div class="header-actions">
          <a routerLink="/admin/tours" class="btn-adm btn-adm-primary">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Crear Tour</span>
          </a>

          <a routerLink="/admin/reservas" class="btn-adm btn-adm-secondary">
            <span>Ver Todas las Reservas</span>
          </a>
        </div>
      </div>

      <!-- KPI METRIC CARDS -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Por Atender</span>
            <div class="stat-card-icon icon-amber">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-card-value text-amber">{{ stats()?.pendingBookings ?? 0 }}</div>
          <div class="stat-card-hint">
            <span>Requieren contacto directo</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Confirmadas</span>
            <div class="stat-card-icon icon-green">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-card-value text-green">{{ stats()?.confirmedBookings ?? 0 }}</div>
          <div class="stat-card-hint">
            <span>Circuitos coordinados</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Circuitos Activos</span>
            <div class="stat-card-icon icon-clay">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-card-value">{{ stats()?.activeTours ?? 0 }}</div>
          <div class="stat-card-hint">
            <span>Publicados en la web oficial</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-label">Bandeja de Contacto</span>
            <div class="stat-card-icon icon-blue">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
          </div>
          <div class="stat-card-value text-blue">{{ stats()?.unreadMessages ?? 0 }}</div>
          <div class="stat-card-hint">
            <span>Mensajes pendientes de lectura</span>
          </div>
        </div>
      </div>

      <!-- RECENT BOOKINGS TABLE -->
      <div class="table-card">
        <div class="table-card-header">
          <div>
            <h2 class="table-card-title">Últimas Solicitudes de Cotización / Reserva</h2>
            <p class="table-card-subtitle">Solicitudes ingresadas recientemente por pasajeros</p>
          </div>
          <a routerLink="/admin/reservas" class="view-all-link">Ver todas las solicitudes →</a>
        </div>

        <div class="table-responsive">
          <table class="adm-table">
            <thead>
              <tr>
                <th>Pasajero / Contacto</th>
                <th>Tour Seleccionado</th>
                <th>Grupo</th>
                <th>Fecha Tentativa</th>
                <th>Estado</th>
                <th>Gestión</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of stats()?.recentBookings">
                <td>
                  <div class="client-cell">
                    <strong class="client-name">{{ booking.fullName }}</strong>
                    <span class="client-meta">{{ booking.phone || booking.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="tour-name-cell">{{ booking.tourTitle }}</span>
                </td>
                <td>
                  <span class="passenger-chip">{{ booking.numberOfPeople }} {{ booking.numberOfPeople === 1 ? 'persona' : 'personas' }}</span>
                </td>
                <td>
                  <span class="date-cell">
                    {{ booking.travelDate ? (booking.travelDate | date:'dd MMM yyyy') : 'A coordinar' }}
                  </span>
                </td>
                <td>
                  <span class="status-pill" [ngClass]="booking.status.toLowerCase()">
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </td>
                <td>
                  <div class="actions-group">
                    <a 
                      [href]="booking.whatsAppDirectUrl" 
                      target="_blank" 
                      class="btn-wa-compact" 
                      title="Abrir chat en WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <select 
                      [value]="booking.status" 
                      (change)="onStatusChange(booking.id, $event)"
                      class="adm-select select-compact"
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
                <td colspan="6" class="empty-state-cell">No hay solicitudes registradas aún.</td>
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
      gap: 0.5rem;
    }

    .text-amber { color: var(--adm-amber) !important; }
    .text-green { color: var(--adm-green) !important; }
    .text-blue { color: var(--adm-blue) !important; }

    .view-all-link {
      color: var(--adm-clay);
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 600;
      transition: color 0.2s ease;
    }

    .view-all-link:hover {
      color: var(--adm-clay-hover);
      text-decoration: underline;
    }

    .client-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .client-name {
      color: var(--adm-text-title);
      font-weight: 600;
      font-size: 0.88rem;
    }

    .client-meta {
      font-size: 0.76rem;
      color: var(--adm-text-muted);
    }

    .tour-name-cell {
      font-weight: 500;
      color: var(--adm-text-title);
      max-width: 260px;
      display: inline-block;
    }

    .passenger-chip {
      display: inline-block;
      padding: 0.2rem 0.55rem;
      border-radius: var(--adm-r-full);
      font-size: 0.74rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      color: var(--adm-text-body);
      border: 1px solid var(--adm-border-subtle);
    }

    .date-cell {
      font-size: 0.82rem;
      color: var(--adm-text-body);
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-wa-compact {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.65rem;
      border-radius: var(--adm-r-sm);
      font-size: 0.76rem;
      font-weight: 600;
      text-decoration: none;
      background: var(--adm-whatsapp-bg);
      color: var(--adm-whatsapp);
      border: 1px solid var(--adm-whatsapp-border);
      transition: all 0.2s ease;
    }

    .btn-wa-compact:hover {
      background: var(--adm-whatsapp);
      color: #ffffff;
    }

    .select-compact {
      padding: 0.35rem 0.6rem;
      font-size: 0.76rem;
      width: auto;
      min-width: 110px;
    }

    .empty-state-cell {
      text-align: center;
      padding: 3rem 1.5rem !important;
      color: var(--adm-text-muted);
      font-size: 0.86rem;
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
