import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminTestimonial } from '../../models/admin.model';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="testimonials-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Gestión de Testimonios & Reseñas</h1>
          <p class="page-desc">Modera, aprueba y publica experiencias reales de viajeros en la página principal</p>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Añadir Testimonio</span>
        </button>
      </div>

      <!-- CARDS GRID -->
      <div class="testimonials-grid">
        <div 
          *ngFor="let item of testimonials()" 
          class="test-card" 
          [class.card-hidden]="!item.isApproved"
        >
          <div class="card-top">
            <div class="author-box">
              <div class="avatar-ph">
                {{ item.authorName.charAt(0) }}
              </div>
              <div>
                <strong class="author-name">{{ item.authorName }}</strong>
                <span class="author-loc">{{ item.authorCityOrCountry }}</span>
              </div>
            </div>
            <div class="rating-stars">
              <span *ngFor="let s of [1,2,3,4,5]" [class.star-lit]="s <= item.rating">★</span>
            </div>
          </div>

          <div class="tour-tag">
            <span>📍 {{ item.tourName }}</span>
            <small>{{ item.date }}</small>
          </div>

          <p class="comment-text">"{{ item.comment }}"</p>

          <div class="card-footer">
            <button 
              type="button" 
              class="btn-toggle-app" 
              [class.approved]="item.isApproved"
              (click)="onToggleApproved(item)"
              [title]="item.isApproved ? 'Ocultar testimonio de la web' : 'Publicar testimonio en la web'"
            >
              <span class="dot">●</span>
              <span>{{ item.isApproved ? 'Aprobado (Visible)' : 'En Espera / Oculto' }}</span>
            </button>

            <div class="card-actions">
              <button class="btn-icon btn-edit" (click)="openEditModal(item)" title="Editar">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-icon btn-del" (click)="onDelete(item.id)" title="Eliminar">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CREATE / EDIT MODAL -->
      <div class="modal-backdrop" *ngIf="showModal()" (click)="closeModal()">
        <div class="edit-modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingItem()?.id ? 'Editar Testimonio' : 'Nuevo Testimonio' }}</h3>
            <button class="btn-close" (click)="closeModal()">×</button>
          </div>

          <form (ngSubmit)="onSave()" class="modal-form">
            <div class="form-grid">
              <div class="form-field">
                <label>Nombre del Viajero *</label>
                <input type="text" [(ngModel)]="formData.authorName" name="authorName" required placeholder="Ej: Gabriel Sotomayor" />
              </div>

              <div class="form-field">
                <label>Ciudad o País de Origen</label>
                <input type="text" [(ngModel)]="formData.authorCityOrCountry" name="authorCityOrCountry" placeholder="Ej: Lima, Perú o París, Francia" />
              </div>

              <div class="form-field">
                <label>Puntuación (1 a 5 Estrellas)</label>
                <select [(ngModel)]="formData.rating" name="rating">
                  <option [ngValue]="5">★★★★★ (5 Estrellas - Excelente)</option>
                  <option [ngValue]="4">★★★★☆ (4 Estrellas - Muy Bueno)</option>
                  <option [ngValue]="3">★★★☆☆ (3 Estrellas - Bueno)</option>
                  <option [ngValue]="2">★★☆☆☆ (2 Estrellas - Regular)</option>
                  <option [ngValue]="1">★☆☆☆☆ (1 Estrella - Deficiente)</option>
                </select>
              </div>

              <div class="form-field">
                <label>Fecha / Mes de Viaje</label>
                <input type="text" [(ngModel)]="formData.date" name="date" placeholder="Ej: Octubre 2026" />
              </div>

              <div class="form-field full-width">
                <label>Tour o Circuito Realizado</label>
                <input type="text" [(ngModel)]="formData.tourName" name="tourName" placeholder="Ej: Kuntur Ñan: El Vuelo del Cóndor en Mayobamba" />
              </div>

              <div class="form-field full-width">
                <label>Comentario / Testimonio *</label>
                <textarea rows="4" [(ngModel)]="formData.comment" name="comment" required placeholder="Describe la experiencia del viajero..."></textarea>
              </div>

              <div class="form-field full-width">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="formData.isApproved" name="isApproved" />
                  <span>Aprobado para mostrarse en la página de inicio (Home)</span>
                </label>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button type="submit" class="btn-save">Guardar Testimonio</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .testimonials-page {
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
    }

    .page-desc {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0;
    }

    .btn-primary {
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

    .btn-primary:hover {
      background: #b34a24;
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .test-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: all 0.2s ease;
    }

    .test-card.card-hidden {
      opacity: 0.6;
      border-style: dashed;
    }

    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .author-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .avatar-ph {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #c85a32;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.1rem;
    }

    .author-name {
      display: block;
      color: #f8fafc;
      font-size: 0.95rem;
    }

    .author-loc {
      font-size: 0.78rem;
      color: #94a3b8;
    }

    .rating-stars {
      color: #64748b;
      font-size: 1.1rem;
    }

    .star-lit {
      color: #f59e0b;
    }

    .tour-tag {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.08);
      padding: 0.35rem 0.6rem;
      border-radius: 6px;
    }

    .tour-tag small {
      color: #94a3b8;
    }

    .comment-text {
      color: #cbd5e1;
      font-size: 0.88rem;
      line-height: 1.5;
      font-style: italic;
      margin: 0;
      flex: 1;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 0.75rem;
    }

    .btn-toggle-app {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-toggle-app.approved {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
    }

    .dot {
      font-size: 0.65rem;
    }

    .card-actions {
      display: flex;
      gap: 0.4rem;
    }

    .btn-icon {
      padding: 0.4rem;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      transition: all 0.2s ease;
    }

    .btn-edit:hover { background: #3b82f6; color: #ffffff; }
    .btn-del:hover { background: #ef4444; color: #ffffff; }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
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
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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

    .form-field input, .form-field select, .form-field textarea {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.6rem 0.8rem;
      color: #f8fafc;
      font-size: 0.88rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      color: #e2e8f0;
      font-size: 0.85rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
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

    .btn-save {
      background: #c85a32;
      border: none;
      color: #ffffff;
      padding: 0.6rem 1.25rem;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
  `]
})
export class AdminTestimonialsComponent implements OnInit {
  private adminService = inject(AdminService);

  testimonials = signal<AdminTestimonial[]>([]);
  showModal = signal(false);
  editingItem = signal<AdminTestimonial | null>(null);

  formData: Partial<AdminTestimonial> = {};

  ngOnInit(): void {
    this.loadTestimonials();
  }

  loadTestimonials(): void {
    this.adminService.getTestimonials().subscribe(res => {
      this.testimonials.set(res);
    });
  }

  openCreateModal(): void {
    this.editingItem.set(null);
    this.formData = {
      authorName: '',
      authorCityOrCountry: 'Lima, Perú',
      rating: 5,
      comment: '',
      tourName: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      date: 'Octubre 2026',
      isApproved: true
    };
    this.showModal.set(true);
  }

  openEditModal(item: AdminTestimonial): void {
    this.editingItem.set(item);
    this.formData = { ...item };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onToggleApproved(item: AdminTestimonial): void {
    this.adminService.toggleTestimonialApproved(item.id).subscribe(() => {
      item.isApproved = !item.isApproved;
    });
  }

  onSave(): void {
    if (!this.formData.authorName || !this.formData.comment) {
      alert('Por favor complete el nombre y el comentario.');
      return;
    }

    const itemToSave: AdminTestimonial = {
      id: this.editingItem()?.id ?? 0,
      authorName: this.formData.authorName!,
      authorCityOrCountry: this.formData.authorCityOrCountry || 'Perú',
      rating: Number(this.formData.rating) || 5,
      comment: this.formData.comment!,
      tourName: this.formData.tourName || 'Circuito Valle del Sondondo',
      date: this.formData.date || 'Octubre 2026',
      isApproved: this.formData.isApproved !== false
    };

    this.adminService.saveTestimonial(itemToSave).subscribe(() => {
      this.closeModal();
      this.loadTestimonials();
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Eliminar este testimonio?')) {
      this.adminService.deleteTestimonial(id).subscribe(() => {
        this.loadTestimonials();
      });
    }
  }
}
