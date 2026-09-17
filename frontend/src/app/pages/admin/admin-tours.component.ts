import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminTour } from '../../models/admin.model';

@Component({
  selector: 'app-admin-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tours-admin-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Tours & Circuitos</h1>
          <p class="page-desc">Administra los circuitos turísticos del Valle del Sondondo visibles en la web</p>
        </div>
        <button class="btn-create" (click)="openCreateModal()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Nuevo Tour</span>
        </button>
      </div>

      <!-- TOURS TABLE -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Tour / Circuito</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Precio S/</th>
                <th>Precio USD</th>
                <th>Altitud Máx.</th>
                <th>Visible en Web</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tour of tours()">
                <td class="thumb-cell">
                  <img [src]="tour.mainImageUrl" [alt]="tour.title" class="tour-thumb" onerror="this.src='/assets/images/hero_sondondo.jpg'" />
                </td>
                <td>
                  <div class="tour-name-box">
                    <strong class="tour-title">{{ tour.title }}</strong>
                    <span class="tour-sub">{{ tour.subtitle }}</span>
                    <span *ngIf="tour.featured" class="featured-badge">★ Destacado</span>
                  </div>
                </td>
                <td>
                  <span class="category-pill">{{ tour.categoryName || 'Expedición' }}</span>
                </td>
                <td>{{ tour.duration }}</td>
                <td class="price-cell">S/ {{ tour.priceSoles }}</td>
                <td class="price-cell-usd">$ {{ tour.priceUsd }}</td>
                <td>{{ tour.altitudeMax }}</td>
                <td>
                  <button 
                    class="toggle-active-btn" 
                    [class.active]="tour.isActive" 
                    (click)="onToggleActive(tour)"
                    title="Clic para cambiar visibilidad en la web"
                  >
                    {{ tour.isActive ? 'Activo' : 'Oculto' }}
                  </button>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="btn-action-icon btn-edit" (click)="openEditModal(tour)" title="Editar tour">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button class="btn-action-icon btn-delete" (click)="onDeleteTour(tour)" title="Eliminar tour">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CREATE / EDIT MODAL -->
      <div class="modal-backdrop" *ngIf="showModal()" (click)="closeModal()">
        <div class="edit-modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingTour()?.id ? 'Editar Tour' : 'Crear Nuevo Tour' }}</h3>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>

          <form (ngSubmit)="onSaveTour()" class="modal-form">
            <div class="form-grid">
              <div class="form-field full-width">
                <label>Título del Tour *</label>
                <input type="text" [(ngModel)]="formData.title" name="title" required placeholder="Ej: Kuntur Ñan: El Vuelo del Cóndor" />
              </div>

              <div class="form-field full-width">
                <label>Subtítulo o Bajada</label>
                <input type="text" [(ngModel)]="formData.subtitle" name="subtitle" placeholder="Ej: Mirador de Mayobamba a 6:30 a.m. en Aucará" />
              </div>

              <div class="form-field">
                <label>Categoría</label>
                <select [(ngModel)]="formData.categoryId" name="categoryId">
                  <option [ngValue]="1">Aventura & Naturaleza</option>
                  <option [ngValue]="2">Cultura & Arqueología</option>
                  <option [ngValue]="3">Expediciones Completas</option>
                </select>
              </div>

              <div class="form-field">
                <label>Duración</label>
                <input type="text" [(ngModel)]="formData.duration" name="duration" placeholder="Ej: Full Day (8 horas) o 3 Días / 2 Noches" />
              </div>

              <div class="form-field">
                <label>Precio en Soles (S/)</label>
                <input type="number" [(ngModel)]="formData.priceSoles" name="priceSoles" min="0" />
              </div>

              <div class="form-field">
                <label>Precio en Dólares (USD $)</label>
                <input type="number" [(ngModel)]="formData.priceUsd" name="priceUsd" min="0" />
              </div>

              <div class="form-field">
                <label>Dificultad</label>
                <select [(ngModel)]="formData.difficulty" name="difficulty">
                  <option value="Fácil">Fácil</option>
                  <option value="Fácil - Moderada">Fácil - Moderada</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Moderada - Exigente">Moderada - Exigente</option>
                  <option value="Exigente">Exigente</option>
                </select>
              </div>

              <div class="form-field">
                <label>Altitud Máxima</label>
                <input type="text" [(ngModel)]="formData.altitudeMax" name="altitudeMax" placeholder="Ej: 4,022 msnm" />
              </div>

              <div class="form-field">
                <label>Punto de Partida</label>
                <input type="text" [(ngModel)]="formData.startingPoint" name="startingPoint" placeholder="Ej: Aucará / Puquio" />
              </div>

              <div class="form-field">
                <label>URL de Imagen Principal</label>
                <input type="text" [(ngModel)]="formData.mainImageUrl" name="mainImageUrl" placeholder="/assets/images/condor_mayobamba.jpg" />
              </div>

              <div class="form-field full-width">
                <label>Descripción del Tour</label>
                <textarea rows="3" [(ngModel)]="formData.description" name="description" placeholder="Resumen atractivo del itinerario y atractivos..."></textarea>
              </div>

              <div class="form-field full-width checkbox-row">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.featured" name="featured" />
                  <span>Destacar en la portada principal</span>
                </label>

                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.isActive" name="isActive" />
                  <span>Activo y visible en la web pública</span>
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tours-admin-page {
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

    .btn-create {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #c85a32;
      color: #ffffff;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-create:hover {
      background: #b34a24;
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

    .thumb-cell {
      width: 80px;
    }

    .tour-thumb {
      width: 64px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .tour-name-box {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      max-width: 260px;
    }

    .tour-title {
      color: #f8fafc;
      font-weight: 700;
      font-size: 0.9rem;
    }

    .tour-sub {
      color: #94a3b8;
      font-size: 0.75rem;
      line-height: 1.25;
    }

    .featured-badge {
      display: inline-block;
      align-self: flex-start;
      font-size: 0.68rem;
      font-weight: 700;
      color: #e09f3e;
      background: rgba(224, 159, 62, 0.12);
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      margin-top: 0.15rem;
    }

    .category-pill {
      background: rgba(255, 255, 255, 0.05);
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #cbd5e1;
    }

    .price-cell {
      font-weight: 700;
      color: #4ade80;
    }

    .price-cell-usd {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .toggle-active-btn {
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      transition: all 0.2s ease;
    }

    .toggle-active-btn.active {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
    }

    .row-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-action-icon {
      padding: 0.4rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
    }

    .btn-edit:hover {
      background: #3b82f6;
      color: #ffffff;
    }

    .btn-delete {
      background: rgba(239, 68, 68, 0.12);
      color: #f87171;
    }

    .btn-delete:hover {
      background: #ef4444;
      color: #ffffff;
    }

    /* MODAL */
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

    .edit-modal-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
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
      font-size: 1.2rem;
    }

    .btn-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .modal-form {
      padding: 1.5rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .full-width {
      grid-column: span 2;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .form-field label {
      font-size: 0.8rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .form-field input,
    .form-field select,
    .form-field textarea {
      background: #090f13;
      border: 1px solid #233440;
      border-radius: 6px;
      padding: 0.6rem 0.85rem;
      color: #f8fafc;
      font-size: 0.85rem;
      outline: none;
    }

    .form-field input:focus,
    .form-field select:focus,
    .form-field textarea:focus {
      border-color: #e09f3e;
    }

    .checkbox-row {
      display: flex;
      gap: 1.5rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.85rem;
      color: #cbd5e1;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1rem;
    }

    .btn-cancel {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #cbd5e1;
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-save {
      background: #c85a32;
      border: none;
      color: #ffffff;
      padding: 0.65rem 1.25rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
    }

    .btn-save:hover {
      background: #b34a24;
    }
  `]
})
export class AdminToursComponent implements OnInit {
  private adminService = inject(AdminService);

  tours = signal<AdminTour[]>([]);
  showModal = signal(false);
  editingTour = signal<AdminTour | null>(null);

  formData: Partial<AdminTour> = {};

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.adminService.getTours(true).subscribe(res => {
      this.tours.set(res);
    });
  }

  onToggleActive(tour: AdminTour): void {
    this.adminService.toggleTourActive(tour.id).subscribe(() => {
      tour.isActive = !tour.isActive;
    });
  }

  openCreateModal(): void {
    this.editingTour.set(null);
    this.formData = {
      title: '',
      subtitle: '',
      categoryId: 1,
      duration: 'Full Day (8 horas)',
      durationDays: 1,
      priceSoles: 180,
      priceUsd: 48,
      difficulty: 'Moderada',
      altitudeMax: '3,500 msnm',
      startingPoint: 'Aucará / Puquio',
      mainImageUrl: '/assets/images/hero_sondondo.jpg',
      description: '',
      featured: false,
      isActive: true
    };
    this.showModal.set(true);
  }

  openEditModal(tour: AdminTour): void {
    this.editingTour.set(tour);
    this.formData = { ...tour };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSaveTour(): void {
    if (!this.formData.title) {
      alert('Por favor ingrese el título del tour.');
      return;
    }

    const tourToSave: AdminTour = {
      id: this.editingTour()?.id ?? 0,
      title: this.formData.title!,
      slug: this.formData.slug || this.formData.title!.toLowerCase().replace(/\s+/g, '-'),
      subtitle: this.formData.subtitle || '',
      description: this.formData.description || '',
      categoryId: Number(this.formData.categoryId) || 1,
      duration: this.formData.duration || 'Full Day',
      durationDays: Number(this.formData.durationDays) || 1,
      priceSoles: Number(this.formData.priceSoles) || 0,
      priceUsd: Number(this.formData.priceUsd) || 0,
      difficulty: this.formData.difficulty || 'Moderada',
      altitudeMax: this.formData.altitudeMax || '3,500 msnm',
      startingPoint: this.formData.startingPoint || 'Aucará',
      featured: !!this.formData.featured,
      isActive: this.formData.isActive !== false,
      mainImageUrl: this.formData.mainImageUrl || '/assets/images/hero_sondondo.jpg',
      displayOrder: this.formData.displayOrder || 1
    };

    this.adminService.saveTour(tourToSave).subscribe(() => {
      this.closeModal();
      this.loadTours();
    });
  }

  onDeleteTour(tour: AdminTour): void {
    if (confirm(`¿Estás seguro de eliminar el tour "${tour.title}"?`)) {
      this.adminService.deleteTour(tour.id).subscribe(() => {
        this.loadTours();
      });
    }
  }
}
