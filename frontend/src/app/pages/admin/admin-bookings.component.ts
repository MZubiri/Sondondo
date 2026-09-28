import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminBooking, PassengerManifestItem } from '../../models/admin.model';

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
          <p class="page-desc">Control integral de reservas, manifiesto de pasajeros, vouchers y comprobantes de pago</p>
        </div>
        <div class="header-actions">
          <button type="button" class="btn-export" (click)="onExportCsv()" title="Descargar archivo compatible con Excel">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Exportar a Excel (CSV)</span>
          </button>
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
            Confirmadas ({{ confirmedCount() }})
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
            placeholder="Buscar por cliente, teléfono, tour o voucher..."
          />
        </div>
      </div>

      <!-- TABLE -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Voucher / ID</th>
                <th>Cliente</th>
                <th>Tour Seleccionado</th>
                <th>Pax</th>
                <th>Fecha Salida</th>
                <th>Pago & Comprobante</th>
                <th>Estado</th>
                <th>Operativa & Documentos</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let booking of filteredBookings()">
                <td class="id-cell">
                  <span class="voucher-tag">{{ booking.voucherCode || ('VSE-2026-' + booking.id) }}</span>
                  <small class="created-at">{{ booking.createdAt | date:'shortDate' }}</small>
                </td>
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
                    <strong>{{ booking.travelDate ? (booking.travelDate | date:'dd/MM/yyyy') : 'Por coordinar' }}</strong>
                  </div>
                </td>
                <td>
                  <div class="payment-cell">
                    <span 
                      class="pay-status-badge"
                      [class.badge-paid]="booking.paymentStatus === 'Pagado 100%'"
                      [class.badge-partial]="booking.paymentStatus === 'Adelanto 50%'"
                      [class.badge-unpaid]="!booking.paymentStatus || booking.paymentStatus === 'Pendiente'"
                    >
                      {{ booking.paymentStatus || 'Pendiente' }}
                    </span>
                    <div class="pay-figures">
                      <span class="pay-amount">S/ {{ booking.paidAmount || 0 }} de S/ {{ booking.totalAmount || 0 }}</span>
                      <small class="pay-method" *ngIf="booking.paymentMethod">{{ booking.paymentMethod }}</small>
                    </div>
                    <button class="btn-manage-pay" (click)="openPaymentModal(booking)" title="Editar pago o comprobante">
                      💳 Gestionar Pago
                    </button>
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
                    <!-- Voucher Button -->
                    <button 
                      class="btn-doc btn-voucher" 
                      (click)="openVoucher(booking)" 
                      title="Ver y generar Voucher Oficial de Confirmación"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <line x1="7" y1="15" x2="7.01" y2="15"></line>
                        <line x1="11" y1="15" x2="13" y2="15"></line>
                      </svg>
                      <span>Voucher</span>
                    </button>

                    <!-- Manifest Button -->
                    <button 
                      class="btn-doc btn-manifest" 
                      (click)="openManifest(booking)" 
                      title="Gestionar Manifiesto de Pasajeros e Imprimir para Guía / Conductor"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      <span>Manifiesto</span>
                    </button>

                    <!-- WhatsApp Direct -->
                    <a 
                      [href]="booking.whatsAppDirectUrl" 
                      target="_blank" 
                      class="btn-icon btn-wa" 
                      title="Contactar directamente por WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
                      </svg>
                    </a>

                    <!-- Detail Modal Trigger -->
                    <button class="btn-icon btn-detail" (click)="openDetail(booking)" title="Ver detalle">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <!-- Delete -->
                    <button class="btn-icon btn-delete" (click)="onDelete(booking.id)" title="Eliminar registro">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
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

      <!-- ============================================== -->
      <!-- 1. VOUCHER MODAL & PRINTABLE DOCUMENT -->
      <!-- ============================================== -->
      <div class="modal-backdrop" *ngIf="selectedBookingForVoucher() as b" (click)="closeVoucher()">
        <div class="voucher-modal-card" (click)="$event.stopPropagation()">
          <div class="no-print modal-header">
            <h3>Voucher Oficial de Reserva</h3>
            <div class="modal-header-actions">
              <button class="btn-print" (click)="printDocument()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>Imprimir / Guardar PDF</span>
              </button>
              <button class="btn-close" (click)="closeVoucher()">×</button>
            </div>
          </div>

          <!-- Printable Voucher Content -->
          <div class="printable-voucher-sheet">
            <div class="voucher-header">
              <div class="agency-brand">
                <span class="agency-tag">Operador Turístico Autorizado • Ayacucho, Perú</span>
                <h2 class="agency-title">Valle del Sondondo Expeditions</h2>
                <p class="agency-address">Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho • WhatsApp: +51 966 380 590</p>
              </div>
              <div class="voucher-code-box">
                <span class="code-label">CÓDIGO DE RESERVA</span>
                <strong class="code-value">{{ b.voucherCode || ('VSE-2026-' + b.id) }}</strong>
                <span class="seal-badge">GARANTIZADO</span>
              </div>
            </div>

            <div class="voucher-divider"></div>

            <div class="voucher-grid">
              <div class="v-section">
                <h4>Detalle del Circuito</h4>
                <div class="v-field">
                  <span class="vf-label">Tour / Circuito:</span>
                  <span class="vf-value font-bold text-primary">{{ b.tourTitle }}</span>
                </div>
                <div class="v-field">
                  <span class="vf-label">Fecha de Salida:</span>
                  <span class="vf-value font-bold">{{ b.travelDate ? (b.travelDate | date:'fullDate') : 'Coordinada con la agencia' }}</span>
                </div>
                <div class="v-field">
                  <span class="vf-label">Punto de Encuentro:</span>
                  <span class="vf-value">Plaza Principal de Aucará / Terminal Terrestre de Puquio</span>
                </div>
                <div class="v-field">
                  <span class="vf-label">N° de Pasajeros:</span>
                  <span class="vf-value">{{ b.numberOfPeople }} persona(s)</span>
                </div>
              </div>

              <div class="v-section">
                <h4>Titular de la Reserva</h4>
                <div class="v-field">
                  <span class="vf-label">Nombre Completo:</span>
                  <span class="vf-value font-bold">{{ b.fullName }}</span>
                </div>
                <div class="v-field">
                  <span class="vf-label">Teléfono / WhatsApp:</span>
                  <span class="vf-value">{{ b.phone }}</span>
                </div>
                <div class="v-field">
                  <span class="vf-label">Correo Electrónico:</span>
                  <span class="vf-value">{{ b.email }}</span>
                </div>
                <div class="v-field">
                  <span class="vf-label">Fecha de Emisión:</span>
                  <span class="vf-value">{{ b.createdAt | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>

            <!-- Financial Summary Box -->
            <div class="voucher-finances">
              <div class="vf-col">
                <span class="vf-muted">Monto Total</span>
                <strong class="vf-big">S/ {{ b.totalAmount || 0 }}</strong>
              </div>
              <div class="vf-col">
                <span class="vf-muted">Abonado ({{ b.paymentMethod || 'Yape/BCP' }})</span>
                <strong class="vf-big text-green">S/ {{ b.paidAmount || 0 }}</strong>
              </div>
              <div class="vf-col">
                <span class="vf-muted">Saldo Pendiente al Iniciar</span>
                <strong class="vf-big text-amber">S/ {{ Math.max(0, (b.totalAmount || 0) - (b.paidAmount || 0)) }}</strong>
              </div>
              <div class="vf-col status-col">
                <span class="vf-muted">Estado de la Reserva</span>
                <span class="vf-status-badge">{{ b.status === 'Confirmed' ? 'CONFIRMADA' : b.status }}</span>
              </div>
            </div>

            <!-- Important Expedition Guidelines -->
            <div class="voucher-notes">
              <h5>Indicaciones para el Viajero (Valle del Sondondo):</h5>
              <ul>
                <li>Llevar ropa abrigadora para la mañana y tarde (altitudes entre 3,200 y 4,400 msnm).</li>
                <li>Zapatillas o calzado de trekking con buen agarre para miradores y andenes.</li>
                <li>Presentar DNI o Pasaporte físico al momento de abordar la unidad de transporte.</li>
                <li>Mantenerse hidratado durante el ascenso al Mirador de Cóndores de Mayobamba o Pachapupum.</li>
              </ul>
            </div>

            <div class="voucher-footer">
              <span>Valle del Sondondo Expeditions • RUC: 20601234567 • Mincetur / Dircetur Ayacucho</span>
              <span>www.valledelsondondoexpeditions.com</span>
            </div>
          </div>

          <div class="no-print modal-bottom-actions">
            <a [href]="b.whatsAppDirectUrl" target="_blank" class="btn-wa-voucher">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
              </svg>
              <span>Enviar Confirmación por WhatsApp</span>
            </a>
            <button class="btn-secondary" (click)="closeVoucher()">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 2. MANIFEST MODAL & PRINTABLE DOCUMENT -->
      <!-- ============================================== -->
      <div class="modal-backdrop" *ngIf="selectedBookingForManifest() as b" (click)="closeManifest()">
        <div class="manifest-modal-card" (click)="$event.stopPropagation()">
          <div class="no-print modal-header">
            <div>
              <h3>Manifiesto de Pasajeros de la Expedición</h3>
              <p class="modal-sub">Hoja de ruta obligatoria para Guías Oficiales y Conductores de ruta</p>
            </div>
            <div class="modal-header-actions">
              <button class="btn-print" (click)="printDocument()">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                <span>Imprimir Manifiesto</span>
              </button>
              <button class="btn-close" (click)="closeManifest()">×</button>
            </div>
          </div>

          <!-- Printable Manifest Sheet -->
          <div class="printable-manifest-sheet">
            <div class="manifest-header">
              <div>
                <h2>MANIFIESTO OFICIAL DE PASAJEROS</h2>
                <strong class="manifest-agency">Valle del Sondondo Expeditions • Aucará, Lucanas, Ayacucho</strong>
              </div>
              <div class="manifest-meta">
                <span><strong>Circuito:</strong> {{ b.tourTitle }}</span>
                <span><strong>Fecha de Salida:</strong> {{ b.travelDate || 'Por coordinar' }}</span>
              </div>
            </div>

            <!-- Operative team assignment (editable in admin) -->
            <div class="manifest-ops-grid no-print">
              <div class="form-field">
                <label>Guía Oficial / Líder de Ruta</label>
                <input type="text" [(ngModel)]="manifestGuide" placeholder="Ej: Víctor Cárdenas" />
              </div>
              <div class="form-field">
                <label>Conductor Asignado</label>
                <input type="text" [(ngModel)]="manifestDriver" placeholder="Ej: Zenón Chauca" />
              </div>
              <div class="form-field">
                <label>Placa del Vehículo</label>
                <input type="text" [(ngModel)]="manifestVehiclePlate" placeholder="Ej: AY-4921" />
              </div>
            </div>

            <!-- Printable Ops Box -->
            <div class="manifest-ops-print">
              <span><strong>Guía Oficial:</strong> {{ manifestGuide || 'Víctor Cárdenas' }}</span>
              <span><strong>Conductor:</strong> {{ manifestDriver || 'Zenón Chauca' }}</span>
              <span><strong>Placa:</strong> {{ manifestVehiclePlate || 'AY-4921' }}</span>
              <span><strong>Pasajeros Registrados:</strong> {{ manifestPassengers.length }}</span>
            </div>

            <!-- Passengers Table -->
            <div class="manifest-table-box">
              <table class="manifest-table">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Nombres y Apellidos</th>
                    <th>Tipo Doc.</th>
                    <th>N° Documento</th>
                    <th>Nacionalidad</th>
                    <th>Edad</th>
                    <th>Teléfono de Emergencia</th>
                    <th class="no-print">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of manifestPassengers; let i = index">
                    <td class="index-cell">{{ i + 1 }}</td>
                    <td>
                      <input type="text" [(ngModel)]="p.fullName" class="m-input" placeholder="Nombre completo" />
                    </td>
                    <td>
                      <select [(ngModel)]="p.documentType" class="m-select">
                        <option value="DNI">DNI</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="Carnet Ext.">Carnet Ext.</option>
                      </select>
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.documentNumber" class="m-input" placeholder="N° Doc" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.nationality" class="m-input" placeholder="Nacionalidad" />
                    </td>
                    <td>
                      <input type="number" [(ngModel)]="p.age" class="m-input m-input-sm" min="1" max="100" />
                    </td>
                    <td>
                      <input type="text" [(ngModel)]="p.emergencyPhone" class="m-input" placeholder="+51 9..." />
                    </td>
                    <td class="no-print">
                      <button type="button" class="btn-del-pax" (click)="removePassenger(i)" title="Quitar pasajero">×</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="no-print manifest-add-bar">
              <button type="button" class="btn-add-pax" (click)="addPassenger()">
                + Agregar Pasajero al Manifiesto
              </button>
            </div>

            <!-- Signature block for printed document -->
            <div class="manifest-signatures">
              <div class="sig-box">
                <div class="sig-line"></div>
                <span>Firma del Guía Oficial</span>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <span>Firma del Conductor</span>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <span>Sello Agencia / Operaciones</span>
              </div>
            </div>
          </div>

          <div class="no-print modal-bottom-actions">
            <button class="btn-save-manifest" (click)="saveManifest()">Guardar Manifiesto</button>
            <button class="btn-secondary" (click)="closeManifest()">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 3. PAYMENT & RECEIPT MODAL -->
      <!-- ============================================== -->
      <div class="modal-backdrop" *ngIf="selectedBookingForPayment() as b" (click)="closePaymentModal()">
        <div class="payment-modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3>Gestión de Pagos & Comprobantes</h3>
              <p class="modal-sub">Reserva #{{ b.id }} • {{ b.fullName }} ({{ b.tourTitle }})</p>
            </div>
            <button class="btn-close" (click)="closePaymentModal()">×</button>
          </div>

          <form (ngSubmit)="savePayment()" class="payment-form">
            <div class="form-grid">
              <div class="form-field">
                <label>Método de Pago</label>
                <select [(ngModel)]="payFormMethod" name="payFormMethod">
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Transferencia BCP">Transferencia BCP</option>
                  <option value="Banco de la Nación">Banco de la Nación</option>
                  <option value="MercadoPago">Mercado Pago</option>
                  <option value="Efectivo">Efectivo en Oficina</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div class="form-field">
                <label>Estado del Pago</label>
                <select [(ngModel)]="payFormStatus" name="payFormStatus">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Adelanto 50%">Adelanto 50%</option>
                  <option value="Pagado 100%">Pagado 100% (Completado)</option>
                  <option value="Reembolsado">Reembolsado</option>
                </select>
              </div>

              <div class="form-field">
                <label>Monto Total del Tour (S/)</label>
                <input type="number" [(ngModel)]="payFormTotal" name="payFormTotal" min="0" />
              </div>

              <div class="form-field">
                <label>Monto Abonado (S/)</label>
                <input type="number" [(ngModel)]="payFormPaid" name="payFormPaid" min="0" />
              </div>

              <div class="form-field full-width">
                <div class="balance-callout">
                  <span>Saldo Pendiente por Cobrar:</span>
                  <strong class="balance-val">S/ {{ Math.max(0, payFormTotal - payFormPaid) }}</strong>
                </div>
              </div>

              <!-- Payment Voucher Attachment -->
              <div class="form-field full-width">
                <label>Comprobante de Pago / Captura de Yape, BCP o Transferencia</label>
                <div class="receipt-upload-box">
                  <input type="file" accept="image/*" (change)="onReceiptFileSelected($event)" id="receiptUpload" class="file-input" />
                  <label for="receiptUpload" class="upload-trigger">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Haz clic para adjuntar comprobante (Yape, BCP, captura)</span>
                  </label>
                </div>

                <!-- Preview of Attached Receipt -->
                <div *ngIf="payFormReceiptUrl" class="receipt-preview-box">
                  <span class="preview-label">Comprobante Adjunto:</span>
                  <img [src]="payFormReceiptUrl" alt="Comprobante de Pago" class="receipt-img" (click)="openReceiptZoom(payFormReceiptUrl)" title="Clic para ampliar" />
                  <button type="button" class="btn-remove-receipt" (click)="payFormReceiptUrl = ''">Quitar Comprobante</button>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closePaymentModal()">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Información de Pago</button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 4. RECEIPT ZOOM LIGHTBOX -->
      <!-- ============================================== -->
      <div class="modal-backdrop zoom-backdrop" *ngIf="zoomedReceipt()" (click)="zoomedReceipt.set(null)">
        <div class="zoom-card" (click)="$event.stopPropagation()">
          <img [src]="zoomedReceipt()!" alt="Comprobante ampliado" class="zoom-img" />
          <button class="btn-close-zoom" (click)="zoomedReceipt.set(null)">Cerrar Vista</button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 5. GENERAL DETAIL MODAL -->
      <!-- ============================================== -->
      <div class="modal-backdrop" *ngIf="selectedBooking()" (click)="closeDetail()">
        <div class="detail-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalle de la Solicitud #{{ selectedBooking()?.id }}</h3>
            <button class="btn-close" (click)="closeDetail()">×</button>
          </div>

          <div class="modal-body" *ngIf="selectedBooking() as b">
            <div class="detail-row">
              <span class="detail-label">Código Voucher:</span>
              <span class="detail-value font-bold text-accent">{{ b.voucherCode || ('VSE-2026-' + b.id) }}</span>
            </div>
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
              <span class="detail-label">Pago:</span>
              <span class="detail-value">{{ b.paymentStatus || 'Pendiente' }} (S/ {{ b.paidAmount || 0 }} de S/ {{ b.totalAmount || 0 }})</span>
            </div>

            <div class="message-box">
              <span class="message-label">Mensaje o comentarios del viajero:</span>
              <p class="message-content">{{ b.message || 'El cliente no adjuntó un mensaje adicional.' }}</p>
            </div>
          </div>

          <div class="modal-footer" *ngIf="selectedBooking() as b">
            <button class="btn-doc btn-voucher" (click)="openVoucher(b); closeDetail()">
              🎫 Ver Voucher
            </button>
            <button class="btn-doc btn-manifest" (click)="openManifest(b); closeDetail()">
              📋 Ver Manifiesto
            </button>
            <a [href]="b.whatsAppDirectUrl" target="_blank" class="btn-modal-wa">
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

    .btn-export {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f8fafc;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-export:hover {
      background: #334155;
      border-color: #38bdf8;
      color: #38bdf8;
    }

    /* CONTROLS */
    .controls-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .filter-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .pill {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .pill:hover {
      background: #334155;
      color: #ffffff;
    }

    .pill.active {
      background: #c85a32;
      color: #ffffff;
      border-color: #c85a32;
    }

    .pill-confirmed.active {
      background: #15803d;
      border-color: #22c55e;
    }

    .search-box {
      position: relative;
      min-width: 280px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .search-box input {
      width: 100%;
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.55rem 1rem 0.55rem 2.5rem;
      color: #f8fafc;
      font-size: 0.875rem;
    }

    .search-box input:focus {
      outline: none;
      border-color: #c85a32;
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
      font-size: 0.88rem;
    }

    .data-table th {
      background: #0d151a;
      color: #94a3b8;
      font-weight: 600;
      padding: 0.85rem 1.15rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .data-table td {
      padding: 1rem 1.15rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
      vertical-align: middle;
    }

    .data-table tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .voucher-tag {
      display: inline-block;
      background: rgba(200, 90, 50, 0.15);
      color: #f97316;
      font-weight: 800;
      font-size: 0.75rem;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
    }

    .created-at {
      display: block;
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 0.2rem;
    }

    .client-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .client-name {
      color: #f8fafc;
      font-size: 0.95rem;
    }

    .client-phone, .client-email {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .tour-badge {
      display: inline-block;
      color: #e2e8f0;
      font-weight: 600;
      max-width: 220px;
      line-height: 1.3;
    }

    .passengers-pill {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 600;
      color: #e2e8f0;
      white-space: nowrap;
    }

    /* PAYMENT COLUMN */
    .payment-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .pay-status-badge {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: inline-block;
      width: fit-content;
    }

    .badge-paid {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }

    .badge-partial {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }

    .badge-unpaid {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }

    .pay-figures {
      display: flex;
      flex-direction: column;
    }

    .pay-amount {
      font-size: 0.82rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .pay-method {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .btn-manage-pay {
      background: none;
      border: 1px dashed rgba(255, 255, 255, 0.2);
      color: #38bdf8;
      font-size: 0.72rem;
      padding: 0.2rem 0.45rem;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 0.2rem;
      transition: all 0.15s ease;
      width: fit-content;
    }

    .btn-manage-pay:hover {
      background: rgba(56, 189, 248, 0.15);
      border-style: solid;
    }

    /* STATUS DROPDOWN */
    .status-dropdown {
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      background: #1e293b;
      color: #f8fafc;
    }

    .status-dropdown.pending {
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.4);
    }

    .status-dropdown.confirmed {
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.4);
    }

    .status-dropdown.cancelled {
      color: #f87171;
      border-color: rgba(239, 68, 68, 0.4);
    }

    /* ACTION BUTTONS */
    .action-buttons {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .btn-doc {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
    }

    .btn-voucher {
      background: rgba(200, 90, 50, 0.2);
      color: #f97316;
      border: 1px solid rgba(200, 90, 50, 0.3);
    }

    .btn-voucher:hover {
      background: #c85a32;
      color: #ffffff;
    }

    .btn-manifest {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    .btn-manifest:hover {
      background: #0284c7;
      color: #ffffff;
    }

    .btn-icon {
      padding: 0.4rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.08);
      text-decoration: none;
    }

    .btn-wa {
      background: rgba(37, 211, 102, 0.15);
      color: #25d366;
    }

    .btn-wa:hover {
      background: #25d366;
      color: #ffffff;
    }

    .btn-detail:hover {
      background: #3b82f6;
      color: #ffffff;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* MODAL BASE */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 1000;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .modal-header h3 {
      margin: 0;
      color: #f8fafc;
      font-size: 1.25rem;
    }

    .modal-sub {
      color: #94a3b8;
      font-size: 0.8rem;
      margin: 0.2rem 0 0 0;
    }

    .modal-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: #c85a32;
      color: #ffffff;
      border: none;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-print:hover {
      background: #b34a24;
    }

    .btn-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-bottom-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #cbd5e1;
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    /* VOUCHER MODAL & PRINT */
    .voucher-modal-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 760px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .printable-voucher-sheet {
      background: #ffffff;
      color: #1a1a1a;
      padding: 2rem;
      margin: 1.5rem;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .voucher-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .agency-tag {
      font-size: 0.72rem;
      color: #c85a32;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .agency-title {
      color: #111827;
      font-size: 1.5rem;
      font-weight: 900;
      margin: 0.2rem 0;
    }

    .agency-address {
      font-size: 0.78rem;
      color: #4b5563;
      margin: 0;
    }

    .voucher-code-box {
      text-align: right;
      background: #fdf6f0;
      border: 1.5px dashed #c85a32;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .code-label {
      font-size: 0.68rem;
      color: #9a3412;
      font-weight: 800;
      display: block;
    }

    .code-value {
      font-size: 1.25rem;
      color: #c85a32;
      letter-spacing: 0.05em;
    }

    .seal-badge {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.65rem;
      background: #166534;
      color: #ffffff;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      font-weight: 800;
      text-align: center;
    }

    .voucher-divider {
      height: 2px;
      background: #f3f4f6;
      margin: 1.25rem 0;
    }

    .voucher-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .v-section h4 {
      font-size: 0.88rem;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.4rem;
      margin: 0 0 0.75rem 0;
    }

    .v-field {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.5rem;
    }

    .vf-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .vf-value {
      font-size: 0.92rem;
      color: #111827;
    }

    .text-primary {
      color: #c85a32;
    }

    .voucher-finances {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .vf-col {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .vf-muted {
      font-size: 0.72rem;
      color: #6b7280;
      text-transform: uppercase;
    }

    .vf-big {
      font-size: 1.15rem;
      color: #111827;
    }

    .text-green { color: #15803d; }
    .text-amber { color: #b45309; }

    .vf-status-badge {
      background: #166534;
      color: #ffffff;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 800;
      margin-top: 0.2rem;
    }

    .voucher-notes {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 6px;
      padding: 0.85rem 1rem;
      margin-bottom: 1.5rem;
    }

    .voucher-notes h5 {
      margin: 0 0 0.4rem 0;
      color: #92400e;
      font-size: 0.82rem;
    }

    .voucher-notes ul {
      margin: 0;
      padding-left: 1.25rem;
      font-size: 0.78rem;
      color: #78350f;
      line-height: 1.5;
    }

    .voucher-footer {
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e5e7eb;
      padding-top: 0.75rem;
      font-size: 0.72rem;
      color: #9ca3af;
    }

    .btn-wa-voucher {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #25d366;
      color: #ffffff;
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      text-decoration: none;
    }

    /* MANIFEST MODAL & PRINT */
    .manifest-modal-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 960px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .printable-manifest-sheet {
      background: #ffffff;
      color: #111827;
      padding: 2rem;
      margin: 1.5rem;
      border-radius: 8px;
    }

    .manifest-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .manifest-header h2 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 900;
      letter-spacing: -0.01em;
    }

    .manifest-agency {
      font-size: 0.82rem;
      color: #4b5563;
    }

    .manifest-meta {
      display: flex;
      flex-direction: column;
      text-align: right;
      font-size: 0.85rem;
    }

    .manifest-ops-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      border: 1px solid #e2e8f0;
    }

    .manifest-ops-grid label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #475569;
      display: block;
      margin-bottom: 0.25rem;
    }

    .manifest-ops-grid input {
      width: 100%;
      padding: 0.4rem 0.65rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    .manifest-ops-print {
      display: none;
      gap: 1.5rem;
      margin-bottom: 1rem;
      font-size: 0.85rem;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 0.5rem;
    }

    .manifest-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
    }

    .manifest-table th {
      background: #f1f5f9;
      color: #334155;
      padding: 0.65rem 0.5rem;
      border: 1px solid #cbd5e1;
      text-align: left;
      font-weight: 700;
    }

    .manifest-table td {
      border: 1px solid #e2e8f0;
      padding: 0.4rem 0.5rem;
    }

    .index-cell {
      text-align: center;
      font-weight: 700;
      color: #64748b;
    }

    .m-input {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 0.35rem 0.5rem;
      font-size: 0.82rem;
    }

    .m-input-sm {
      width: 55px;
    }

    .m-select {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 0.35rem 0.4rem;
      font-size: 0.82rem;
    }

    .btn-del-pax {
      background: #fee2e2;
      border: none;
      color: #dc2626;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-weight: bold;
    }

    .manifest-add-bar {
      margin-top: 0.75rem;
    }

    .btn-add-pax {
      background: #f1f5f9;
      border: 1px dashed #94a3b8;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      color: #334155;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .btn-add-pax:hover {
      background: #e2e8f0;
    }

    .manifest-signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 3rem;
      padding-top: 1rem;
    }

    .sig-box {
      width: 28%;
      text-align: center;
    }

    .sig-line {
      border-top: 1px solid #111827;
      margin-bottom: 0.35rem;
    }

    .sig-box span {
      font-size: 0.75rem;
      color: #4b5563;
      font-weight: 600;
    }

    .btn-save-manifest {
      background: #0284c7;
      color: #ffffff;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }

    /* PAYMENT MODAL */
    .payment-modal-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 620px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .payment-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .full-width {
      grid-column: span 2;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-field label {
      font-size: 0.8rem;
      color: #cbd5e1;
      font-weight: 600;
    }

    .form-field input, .form-field select {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.6rem 0.8rem;
      color: #f8fafc;
      font-size: 0.88rem;
    }

    .balance-callout {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #cbd5e1;
    }

    .balance-val {
      font-size: 1.25rem;
      color: #fbbf24;
    }

    .receipt-upload-box {
      border: 1.5px dashed rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }

    .file-input {
      display: none;
    }

    .upload-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      cursor: pointer;
      color: #38bdf8;
      font-size: 0.85rem;
    }

    .receipt-preview-box {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #1e293b;
      padding: 0.75rem;
      border-radius: 8px;
    }

    .receipt-img {
      max-width: 90px;
      max-height: 90px;
      border-radius: 6px;
      border: 1px solid #475569;
      cursor: pointer;
    }

    .btn-remove-receipt {
      background: #ef4444;
      border: none;
      color: #ffffff;
      padding: 0.35rem 0.65rem;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn-save {
      background: #c85a32;
      border: none;
      color: #ffffff;
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }

    /* ZOOM LIGHTBOX */
    .zoom-backdrop {
      z-index: 2000;
    }

    .zoom-card {
      background: #000000;
      border-radius: 8px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 90vw;
      max-height: 90vh;
    }

    .zoom-img {
      max-width: 80vw;
      max-height: 75vh;
      object-fit: contain;
    }

    .btn-close-zoom {
      margin-top: 0.75rem;
      background: #334155;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
    }

    /* DETAIL MODAL */
    .detail-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 580px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .detail-label { color: #94a3b8; }
    .detail-value { color: #f8fafc; }
    .text-accent { color: #c85a32; }
    .font-bold { font-weight: 700; }

    .message-box {
      margin-top: 0.5rem;
      background: #1e293b;
      padding: 1rem;
      border-radius: 8px;
    }

    .message-label {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      font-weight: 700;
    }

    .message-content {
      color: #f1f5f9;
      font-size: 0.88rem;
      margin: 0.4rem 0 0 0;
      line-height: 1.5;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.6rem;
      padding: 1.25rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-wrap: wrap;
    }

    .btn-modal-wa {
      background: #25d366;
      color: #ffffff;
      text-decoration: none;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .btn-modal-close {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #f1f5f9;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    /* PRINT STYLES */
    @media print {
      body * {
        visibility: hidden;
      }
      .printable-voucher-sheet, .printable-voucher-sheet *,
      .printable-manifest-sheet, .printable-manifest-sheet * {
        visibility: visible;
      }
      .printable-voucher-sheet, .printable-manifest-sheet {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        margin: 0;
        padding: 0;
        border: none;
      }
      .no-print {
        display: none !important;
      }
      .manifest-ops-print {
        display: flex !important;
      }
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  private adminService = inject(AdminService);
  Math = Math;

  bookings = signal<AdminBooking[]>([]);
  selectedStatus = signal<string>('all');
  searchQuery = '';
  
  selectedBooking = signal<AdminBooking | null>(null);
  selectedBookingForVoucher = signal<AdminBooking | null>(null);
  selectedBookingForManifest = signal<AdminBooking | null>(null);
  selectedBookingForPayment = signal<AdminBooking | null>(null);
  zoomedReceipt = signal<string | null>(null);

  // Manifest edit state
  manifestGuide = 'Víctor Cárdenas';
  manifestDriver = 'Zenón Chauca';
  manifestVehiclePlate = 'AY-4921';
  manifestPassengers: PassengerManifestItem[] = [];

  // Payment edit state
  payFormMethod: AdminBooking['paymentMethod'] = 'Yape';
  payFormStatus: AdminBooking['paymentStatus'] = 'Pendiente';
  payFormTotal = 0;
  payFormPaid = 0;
  payFormReceiptUrl = '';

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

  confirmedCount(): number {
    return this.bookings().filter(b => b.status === 'Confirmed').length;
  }

  setStatusFilter(status: string): void {
    this.selectedStatus.set(status);
  }

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
        b.tourTitle.toLowerCase().includes(q) ||
        (b.voucherCode && b.voucherCode.toLowerCase().includes(q))
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

  onExportCsv(): void {
    this.adminService.exportBookingsCsv();
  }

  openDetail(booking: AdminBooking): void {
    this.selectedBooking.set(booking);
  }

  closeDetail(): void {
    this.selectedBooking.set(null);
  }

  // --- VOUCHER ---
  openVoucher(booking: AdminBooking): void {
    this.selectedBookingForVoucher.set(booking);
  }

  closeVoucher(): void {
    this.selectedBookingForVoucher.set(null);
  }

  // --- MANIFEST ---
  openManifest(booking: AdminBooking): void {
    this.selectedBookingForManifest.set(booking);
    this.manifestGuide = booking.guideName || 'Víctor Cárdenas';
    this.manifestDriver = booking.driverName || 'Zenón Chauca';
    this.manifestVehiclePlate = booking.vehiclePlate || 'AY-4921';

    if (booking.passengers && booking.passengers.length > 0) {
      this.manifestPassengers = JSON.parse(JSON.stringify(booking.passengers));
    } else {
      // Auto create rows for the group count
      const rows: PassengerManifestItem[] = [];
      const count = booking.numberOfPeople || 1;
      for (let i = 0; i < count; i++) {
        rows.push({
          id: 'pax-' + (i + 1),
          fullName: i === 0 ? booking.fullName : '',
          documentType: 'DNI',
          documentNumber: '',
          nationality: 'Peruana',
          age: 30,
          emergencyPhone: booking.phone || ''
        });
      }
      this.manifestPassengers = rows;
    }
  }

  closeManifest(): void {
    this.selectedBookingForManifest.set(null);
  }

  addPassenger(): void {
    this.manifestPassengers.push({
      id: 'pax-' + (this.manifestPassengers.length + 1),
      fullName: '',
      documentType: 'DNI',
      documentNumber: '',
      nationality: 'Peruana',
      age: 28,
      emergencyPhone: ''
    });
  }

  removePassenger(index: number): void {
    this.manifestPassengers.splice(index, 1);
  }

  saveManifest(): void {
    const booking = this.selectedBookingForManifest();
    if (!booking) return;

    this.adminService.updateBookingManifest(booking.id, {
      passengers: this.manifestPassengers,
      guideName: this.manifestGuide,
      driverName: this.manifestDriver,
      vehiclePlate: this.manifestVehiclePlate
    }).subscribe(() => {
      this.closeManifest();
      this.loadBookings();
    });
  }

  // --- PAYMENTS ---
  openPaymentModal(booking: AdminBooking): void {
    this.selectedBookingForPayment.set(booking);
    this.payFormMethod = booking.paymentMethod || 'Yape';
    this.payFormStatus = booking.paymentStatus || 'Pendiente';
    this.payFormTotal = booking.totalAmount || 360;
    this.payFormPaid = booking.paidAmount || 0;
    this.payFormReceiptUrl = booking.paymentReceiptUrl || '';
  }

  closePaymentModal(): void {
    this.selectedBookingForPayment.set(null);
  }

  onReceiptFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.payFormReceiptUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openReceiptZoom(url: string): void {
    this.zoomedReceipt.set(url);
  }

  savePayment(): void {
    const booking = this.selectedBookingForPayment();
    if (!booking) return;

    this.adminService.updateBookingPayment(booking.id, {
      paymentMethod: this.payFormMethod,
      paymentStatus: this.payFormStatus,
      totalAmount: this.payFormTotal,
      paidAmount: this.payFormPaid,
      paymentReceiptUrl: this.payFormReceiptUrl
    }).subscribe(() => {
      this.closePaymentModal();
      this.loadBookings();
    });
  }

  printDocument(): void {
    window.print();
  }

  onDelete(id: number): void {
    if (confirm(`¿Deseas eliminar la solicitud #${id}? Esta acción no se puede deshacer.`)) {
      this.adminService.deleteBooking(id).subscribe(() => {
        this.loadBookings();
      });
    }
  }
}
