import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AdminTour, GalleryItem } from '../../models/admin.model';
import { ItineraryDay } from '../../models/tour.model';

@Component({
  selector: 'app-admin-tours',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tours-admin-page">
      <!-- HEADER -->
      <div class="page-header">
        <div class="page-header-titles">
          <div class="page-eyebrow">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <span>Catálogo Turístico</span>
          </div>
          <h1 class="page-title">Gestión de Tours & Circuitos</h1>
          <p class="page-desc">Administra los circuitos turísticos del Valle del Sondondo visibles en el portal web</p>
        </div>
        <button class="btn-adm btn-adm-primary" (click)="openCreateModal()">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Nuevo Tour</span>
        </button>
      </div>

      <!-- TOAST FEEDBACK -->
      <div *ngIf="toastMessage()" class="admin-toast">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>{{ toastMessage() }}</span>
      </div>

      <!-- FILTER CONTROLS -->
      <div class="filters-bar">
        <div class="filter-pills">
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="activeFilter() === 'all'"
            (click)="activeFilter.set('all')"
          >
            Todos ({{ allCount() }})
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="activeFilter() === 'active'"
            (click)="activeFilter.set('active')"
          >
            <span class="pill-dot is-active"></span>
            <span>Publicados ({{ activeCount() }})</span>
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="activeFilter() === 'hidden'"
            (click)="activeFilter.set('hidden')"
          >
            <span class="pill-dot is-paused"></span>
            <span>Pausados ({{ hiddenCount() }})</span>
          </button>
        </div>

        <div class="filter-hint">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>Puedes pausar un tour temporalmente (ej. por lluvias) sin perder su información.</span>
        </div>
      </div>

      <!-- TOURS TABLE -->
      <div class="table-card">
        <div class="table-responsive">
          <table class="adm-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Tour / Circuito</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Precio S/</th>
                <th>Precio USD</th>
                <th>Altitud Máx.</th>
                <th>Estado Web</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tour of filteredTours()" [class.row-hidden]="tour.isActive === false">
                <td class="thumb-cell">
                  <img [src]="tour.mainImageUrl" [alt]="tour.title" class="tour-thumb" onerror="this.src='/assets/images/hero_sondondo.jpg'" />
                </td>
                <td>
                  <div class="tour-name-box">
                    <strong class="tour-title">{{ tour.title }}</strong>
                    <span class="tour-sub">{{ tour.subtitle }}</span>
                    <div class="badge-row">
                      <span *ngIf="tour.featured" class="featured-badge">
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>Destacado</span>
                      </span>
                      <span *ngIf="tour.isActive === false" class="paused-badge">Oculto</span>
                    </div>
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
                  <span 
                    class="status-pill" 
                    [ngClass]="tour.isActive !== false ? 'active' : 'hidden'"
                  >
                    {{ tour.isActive !== false ? 'Visible' : 'Oculto' }}
                  </span>
                </td>
                <td>
                  <div class="row-actions">
                    <button 
                      *ngIf="tour.isActive !== false"
                      type="button"
                      class="btn-action-pill btn-pause" 
                      (click)="onToggleActive(tour)" 
                      title="Ocultar o pausar tour de la web pública (no se borra)"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <rect x="5" y="4" width="4" height="16" rx="1"></rect>
                        <rect x="15" y="4" width="4" height="16" rx="1"></rect>
                      </svg>
                      <span>Pausar</span>
                    </button>

                    <button 
                      *ngIf="tour.isActive === false"
                      type="button"
                      class="btn-action-pill btn-publish" 
                      (click)="onToggleActive(tour)" 
                      title="Publicar en el catálogo de la web pública"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      <span>Publicar</span>
                    </button>

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

              <!-- FOTO PRINCIPAL / PORTADA -->
              <div class="form-field full-width media-upload-section">
                <div class="media-section-header">
                  <div class="media-title-group">
                    <label class="media-label">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <span>Fotografía de Portada Principal</span>
                    </label>
                    <span class="media-hint">Imagen principal que se verá en las tarjetas del catálogo y encabezados</span>
                  </div>

                  <button type="button" class="btn-picker-link" (click)="openGalleryPicker('main')">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>Elegir de Galería</span>
                  </button>
                </div>

                <div class="main-image-uploader-box">
                  <div *ngIf="formData.mainImageUrl" class="main-image-preview-card">
                    <img [src]="formData.mainImageUrl" alt="Portada" class="preview-img" (click)="activeLightboxPhoto.set(formData.mainImageUrl!)" />
                    <div class="preview-overlay">
                      <span class="badge-cover">⭐ Portada Principal Actual</span>
                      <div class="overlay-actions">
                        <label for="mainImageUploadInput" class="btn-action-icon" title="Subir otra imagen desde tu dispositivo">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                          <span>Cambiar Foto</span>
                        </label>
                        <button type="button" class="btn-action-icon danger" (click)="removeMainImage()" title="Remover imagen">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="!formData.mainImageUrl" class="main-image-dropzone">
                    <label for="mainImageUploadInput" class="dropzone-inner">
                      <div class="drop-icon">
                        <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#e09f3e" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <span class="drop-title">Haz clic aquí para subir la foto de portada</span>
                      <span class="drop-sub">Soporta JPG, PNG, WebP directamente desde tu computadora o celular</span>
                    </label>
                  </div>

                  <input 
                    type="file" 
                    id="mainImageUploadInput" 
                    accept="image/*" 
                    (change)="onMainImageFileSelected($event)" 
                    class="hidden-file-input" 
                  />
                </div>
              </div>

              <!-- FOTOS DENTRO DEL DETALLE DEL TOUR -->
              <div class="form-field full-width media-upload-section">
                <div class="media-section-header">
                  <div class="media-title-group">
                    <label class="media-label">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                      </svg>
                      <span>Fotografías del Detalle del Tour (Galería del Circuito)</span>
                      <span class="count-pill">{{ formData.galleryImages?.length || 0 }} fotos añadidas</span>
                    </label>
                    <span class="media-hint">Estas imágenes aparecen dentro de la página del tour (/tour/{{ formData.slug || 'nombre-tour' }}) para mostrar la experiencia a los turistas</span>
                  </div>

                  <div class="gallery-action-buttons">
                    <button type="button" class="btn-picker-link" (click)="openGalleryPicker('detail')">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                      <span>Elegir de Galería</span>
                    </button>

                    <label for="detailImagesUploadInput" class="btn-upload-direct">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>+ Subir Fotos Directamente</span>
                    </label>
                    <input 
                      type="file" 
                      id="detailImagesUploadInput" 
                      multiple 
                      accept="image/*" 
                      (change)="onDetailImagesFilesSelected($event)" 
                      class="hidden-file-input" 
                    />
                  </div>
                </div>

                <div class="detail-gallery-container">
                  <div *ngIf="formData.galleryImages && formData.galleryImages.length > 0" class="detail-gallery-grid">
                    <div 
                      *ngFor="let img of formData.galleryImages; let i = index" 
                      class="detail-gallery-item"
                      [class.is-current-cover]="img === formData.mainImageUrl"
                    >
                      <img [src]="img" [alt]="'Foto ' + (i + 1)" (click)="activeLightboxPhoto.set(img)" />
                      <span *ngIf="img === formData.mainImageUrl" class="cover-tag">Portada</span>
                      <div class="item-hover-actions">
                        <button 
                          type="button" 
                          class="action-btn-circle" 
                          (click)="setAsMainImage(img)" 
                          title="Usar como Portada Principal"
                          *ngIf="img !== formData.mainImageUrl"
                        >
                          ⭐
                        </button>
                        <button 
                          type="button" 
                          class="action-btn-circle" 
                          (click)="activeLightboxPhoto.set(img)" 
                          title="Ver imagen ampliada"
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </button>
                        <button 
                          type="button" 
                          class="action-btn-circle danger" 
                          (click)="removeDetailImage(i)" 
                          title="Quitar de este tour"
                        >
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Add card inside grid -->
                    <label for="detailImagesUploadInput" class="detail-add-card">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Añadir más fotos</span>
                    </label>
                  </div>

                  <div *ngIf="!formData.galleryImages || formData.galleryImages.length === 0" class="empty-gallery-state">
                    <div class="empty-icon">
                      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <p class="empty-text">No has agregado fotos al detalle de este tour todavía.</p>
                    <label for="detailImagesUploadInput" class="btn-empty-upload">
                      Subir fotos desde mi computadora o celular
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-field full-width">
                <label>Descripción del Tour</label>
                <textarea rows="3" [(ngModel)]="formData.description" name="description" placeholder="Resumen atractivo del itinerario y atractivos..."></textarea>
              </div>

              <!-- ITINERARIO DETALLADO DÍA POR DÍA -->
              <div class="form-field full-width itinerary-config-section">
                <div class="itinerary-header">
                  <div class="itinerary-title-group">
                    <label class="media-label">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>Itinerario Detallado (Día por Día)</span>
                      <span class="count-pill">{{ formData.itineraries?.length || 0 }} día(s)</span>
                    </label>
                    <span class="media-hint">Configura el itinerario específico de este tour. Estos días se mostrarán en la web pública para tus clientes.</span>
                  </div>

                  <button type="button" class="btn-add-day" (click)="addItineraryDay()">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>+ Añadir Día</span>
                  </button>
                </div>

                <div class="itinerary-days-list" *ngIf="formData.itineraries && formData.itineraries.length > 0">
                  <div *ngFor="let day of formData.itineraries; let idx = index" class="itinerary-day-card">
                    <div class="day-card-header">
                      <div class="day-badge-chip">
                        <span class="day-chip-label">DÍA</span>
                        <strong class="day-chip-number">{{ day.dayNumber }}</strong>
                      </div>
                      <div class="day-title-input-wrapper">
                        <input 
                          type="text" 
                          [(ngModel)]="day.title" 
                          [name]="'itinerary_title_' + idx" 
                          placeholder="Ej: 06:00 AM - Partida hacia las Lagunas & Trekking"
                          class="input-day-title"
                          required
                        />
                      </div>
                      <button 
                        type="button" 
                        class="btn-delete-day" 
                        (click)="removeItineraryDay(idx)" 
                        title="Eliminar este día del itinerario"
                        *ngIf="formData.itineraries.length > 1"
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>

                    <div class="day-card-body">
                      <div class="day-form-group">
                        <label class="day-field-label">Descripción de la jornada</label>
                        <textarea 
                          rows="2" 
                          [(ngModel)]="day.description" 
                          [name]="'itinerary_desc_' + idx"
                          placeholder="Describe las paradas, atractivos, miradores, tiempos de caminata y vivencias del día..."
                          class="textarea-day-desc"
                        ></textarea>
                      </div>

                      <div class="day-meta-grid">
                        <div class="day-meta-field">
                          <label class="meta-label">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
                            <span>Actividades clave</span>
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="day.activities" 
                            [name]="'itinerary_activities_' + idx"
                            placeholder="Ej: Trekking guiado, fotografía, avistamiento"
                          />
                        </div>

                        <div class="day-meta-field">
                          <label class="meta-label">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                            <span>Alimentación</span>
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="day.meals" 
                            [name]="'itinerary_meals_' + idx"
                            placeholder="Ej: Desayuno campestre, Almuerzo andino"
                          />
                        </div>

                        <div class="day-meta-field">
                          <label class="meta-label">
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            <span>Hospedaje / Retorno</span>
                          </label>
                          <input 
                            type="text" 
                            [(ngModel)]="day.accommodation" 
                            [name]="'itinerary_accom_' + idx"
                            placeholder="Ej: Retorno a Aucará / Albergue rural"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div *ngIf="!formData.itineraries || formData.itineraries.length === 0" class="empty-itinerary-box">
                  <p>Este tour aún no tiene días de itinerario configurados.</p>
                  <button type="button" class="btn-create-first-day" (click)="addItineraryDay()">
                    + Crear Día 1 del Itinerario
                  </button>
                </div>
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

      <!-- MODAL PARA ELEGIR FOTOS DE LA GALERÍA GENERAL (SIN ESCRIBIR RUTAS) -->
      <div class="modal-backdrop-picker" *ngIf="showGalleryPicker()" (click)="showGalleryPicker.set(false)">
        <div class="picker-modal-card" (click)="$event.stopPropagation()">
          <div class="picker-header">
            <div>
              <h3>Seleccionar Foto de la Galería Multimedia</h3>
              <p class="picker-sub">
                {{ galleryPickerTarget === 'main' ? 'Haz clic en una imagen para asignarla como Portada Principal del tour' : 'Haz clic en cualquier imagen para agregarla al detalle del tour' }}
              </p>
            </div>
            <button class="btn-close" (click)="showGalleryPicker.set(false)">×</button>
          </div>

          <div class="picker-body">
            <div class="picker-grid">
              <div 
                *ngFor="let photo of galleryPhotos()" 
                class="picker-photo-card"
                (click)="selectPhotoFromPicker(photo.url)"
              >
                <img [src]="photo.url" [alt]="photo.title" />
                <div class="picker-photo-info">
                  <span class="photo-title">{{ photo.title }}</span>
                  <span class="photo-cat">{{ photo.category }}</span>
                </div>
                <div class="picker-photo-select-badge">
                  Seleccionar
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- LIGHTBOX ZOOM PREVIEW -->
      <div class="modal-backdrop-lightbox" *ngIf="activeLightboxPhoto()" (click)="activeLightboxPhoto.set(null)">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <button class="lightbox-close" (click)="activeLightboxPhoto.set(null)">✕</button>
          <img [src]="activeLightboxPhoto()!" alt="Visualización ampliada" class="lightbox-img" />
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

    .admin-toast {
      background: #1e293b;
      border: 1px solid #38bdf8;
      color: #f0f9ff;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
    }

    .filters-bar {
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
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.45rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.8rem;
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

    .pill-green.active {
      background: #15803d;
      border-color: #22c55e;
    }

    .pill-amber.active {
      background: #b45309;
      border-color: #f59e0b;
    }

    .filter-hint {
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .row-hidden {
      opacity: 0.65;
      background: rgba(0, 0, 0, 0.15);
    }

    .badge-row {
      display: flex;
      gap: 0.4rem;
      margin-top: 0.25rem;
    }

    .paused-badge {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.45rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .badge-status-web {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .badge-status-web.is-active {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.35);
    }

    .badge-status-web.is-paused {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.35);
    }

    .status-dot {
      font-size: 0.7rem;
    }

    .badge-status-web.is-active .status-dot {
      color: #22c55e;
    }

    .badge-status-web.is-paused .status-dot {
      color: #f59e0b;
    }

    .btn-action-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.65rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .btn-action-pill.btn-pause {
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.25);
    }

    .btn-action-pill.btn-pause:hover {
      background: rgba(245, 158, 11, 0.25);
      color: #ffffff;
      border-color: #f59e0b;
    }

    .btn-action-pill.btn-publish {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border-color: rgba(34, 197, 94, 0.3);
    }

    .btn-action-pill.btn-publish:hover {
      background: #16a34a;
      color: #ffffff;
      border-color: #22c55e;
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

    .row-actions {
      display: flex;
      align-items: center;
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
      max-width: 860px;
      max-height: 92vh;
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

    /* MEDIA UPLOAD SECTIONS */
    .media-upload-section {
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 10px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .media-section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .media-title-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .media-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      font-weight: 700;
      color: #f1f5f9;
    }

    .media-hint {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .count-pill {
      background: rgba(224, 159, 62, 0.2);
      border: 1px solid rgba(224, 159, 62, 0.4);
      color: #e09f3e;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      margin-left: 0.25rem;
    }

    .gallery-action-buttons {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-picker-link {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 0.45rem 0.85rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.2s ease;
    }

    .btn-picker-link:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .btn-upload-direct {
      background: #c85a32;
      color: #ffffff;
      padding: 0.45rem 0.9rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s ease;
    }

    .btn-upload-direct:hover {
      background: #b34a24;
      transform: translateY(-1px);
    }

    .hidden-file-input {
      display: none !important;
    }

    .main-image-uploader-box {
      border-radius: 8px;
      overflow: hidden;
    }

    .main-image-preview-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      max-height: 250px;
      background: #000;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .preview-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      display: block;
      cursor: pointer;
    }

    .preview-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
    }

    .badge-cover {
      background: #10b981;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    .overlay-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-action-icon {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #f1f5f9;
      padding: 0.4rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }

    .btn-action-icon:hover {
      background: #1e293b;
      border-color: #cbd5e1;
    }

    .btn-action-icon.danger:hover {
      background: #ef4444;
      border-color: #ef4444;
      color: #fff;
    }

    .main-image-dropzone {
      border: 2px dashed rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      padding: 2.25rem 1rem;
      text-align: center;
      background: rgba(0, 0, 0, 0.25);
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .main-image-dropzone:hover {
      border-color: #e09f3e;
    }

    .dropzone-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      color: #94a3b8;
    }

    .drop-icon {
      color: #e09f3e;
      margin-bottom: 0.5rem;
    }

    .drop-title {
      font-size: 0.95rem;
      color: #f1f5f9;
      margin-bottom: 0.25rem;
      font-weight: 600;
    }

    .drop-sub {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* TOUR DETAIL GALLERY GRID */
    .detail-gallery-container {
      margin-top: 0.25rem;
    }

    .detail-gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 0.85rem;
    }

    .detail-gallery-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 4 / 3;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #090f13;
      cursor: pointer;
    }

    .detail-gallery-item.is-current-cover {
      border: 2px solid #e09f3e;
      box-shadow: 0 0 10px rgba(224, 159, 62, 0.3);
    }

    .detail-gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease;
    }

    .detail-gallery-item:hover img {
      transform: scale(1.05);
    }

    .cover-tag {
      position: absolute;
      top: 6px;
      left: 6px;
      background: #e09f3e;
      color: #090f13;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.4rem;
      border-radius: 3px;
      z-index: 2;
    }

    .item-hover-actions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      opacity: 0;
      transition: opacity 0.2s ease;
      z-index: 3;
    }

    .detail-gallery-item:hover .item-hover-actions {
      opacity: 1;
    }

    .action-btn-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease, background 0.15s ease;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }

    .action-btn-circle:hover {
      transform: scale(1.15);
      background: #ffffff;
    }

    .action-btn-circle.danger:hover {
      background: #f87171;
    }

    .detail-add-card {
      border: 2px dashed rgba(255, 255, 255, 0.18);
      border-radius: 8px;
      aspect-ratio: 4 / 3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      cursor: pointer;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.2s ease;
      text-align: center;
      padding: 0.5rem;
    }

    .detail-add-card:hover {
      border-color: #e09f3e;
      color: #f1f5f9;
      background: rgba(224, 159, 62, 0.08);
    }

    .detail-add-card span {
      font-size: 0.72rem;
      font-weight: 600;
    }

    .empty-gallery-state {
      padding: 1.5rem;
      text-align: center;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .empty-icon {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }

    .empty-text {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0 0 0.85rem;
    }

    .btn-empty-upload {
      background: #c85a32;
      color: #ffffff;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-block;
      transition: background 0.2s;
    }

    .btn-empty-upload:hover {
      background: #b34a24;
    }

    /* GALLERY PICKER MODAL */
    .modal-backdrop-picker {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.82);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 1100;
    }

    .picker-modal-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      width: 100%;
      max-width: 820px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
    }

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .picker-header h3 {
      margin: 0 0 0.25rem;
      color: #f8fafc;
      font-size: 1.15rem;
    }

    .picker-sub {
      margin: 0;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .picker-body {
      padding: 1.25rem;
      overflow-y: auto;
    }

    .picker-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 1rem;
    }

    .picker-photo-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #090f13;
      cursor: pointer;
      aspect-ratio: 4 / 3;
      transition: all 0.2s ease;
    }

    .picker-photo-card:hover {
      border-color: #e09f3e;
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5);
    }

    .picker-photo-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .picker-photo-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, transparent 100%);
      display: flex;
      flex-direction: column;
    }

    .photo-title {
      font-size: 0.72rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .photo-cat {
      font-size: 0.65rem;
      color: #e09f3e;
    }

    .picker-photo-select-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      background: #e09f3e;
      color: #090f13;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .picker-photo-card:hover .picker-photo-select-badge {
      opacity: 1;
    }

    /* LIGHTBOX ZOOM */
    .modal-backdrop-lightbox {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1200;
      padding: 2rem;
    }

    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lightbox-img {
      max-width: 100%;
      max-height: 85vh;
      border-radius: 8px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
      object-fit: contain;
    }

    .lightbox-close {
      position: absolute;
      top: -2.5rem;
      right: 0;
      background: none;
      border: none;
      color: #ffffff;
      font-size: 1.75rem;
      cursor: pointer;
      line-height: 1;
    }
  `]
})
export class AdminToursComponent implements OnInit {
  private adminService = inject(AdminService);

  tours = signal<AdminTour[]>([]);
  galleryPhotos = signal<GalleryItem[]>([]);
  showModal = signal(false);
  editingTour = signal<AdminTour | null>(null);

  activeFilter = signal<'all' | 'active' | 'hidden'>('all');
  toastMessage = signal<string | null>(null);

  // Gallery Picker & Lightbox states
  showGalleryPicker = signal(false);
  galleryPickerTarget: 'main' | 'detail' = 'main';
  activeLightboxPhoto = signal<string | null>(null);

  allCount = computed(() => this.tours().length);
  activeCount = computed(() => this.tours().filter(t => t.isActive !== false).length);
  hiddenCount = computed(() => this.tours().filter(t => t.isActive === false).length);

  filteredTours = computed(() => {
    const f = this.activeFilter();
    if (f === 'active') return this.tours().filter(t => t.isActive !== false);
    if (f === 'hidden') return this.tours().filter(t => t.isActive === false);
    return this.tours();
  });

  formData: Partial<AdminTour> = {};

  ngOnInit(): void {
    this.loadTours();
    this.loadGallery();
  }

  loadTours(): void {
    this.adminService.getTours(true).subscribe(res => {
      this.tours.set(res);
    });
  }

  loadGallery(): void {
    this.adminService.getGalleryItems().subscribe(res => {
      this.galleryPhotos.set(res);
    });
  }

  showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 4500);
  }

  onToggleActive(tour: AdminTour): void {
    const nextActiveState = !(tour.isActive !== false);
    this.adminService.toggleTourActive(tour.id).subscribe(() => {
      this.tours.update(list => list.map(t => t.id === tour.id ? { ...t, isActive: nextActiveState } : t));
      this.showToast(nextActiveState 
        ? `El tour "${tour.title}" ahora está visible en el catálogo web público.` 
        : `El tour "${tour.title}" ahora está oculto / pausado de la web pública.`);
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
      galleryImages: ['/assets/images/hero_sondondo.jpg'],
      description: '',
      featured: false,
      isActive: true,
      itineraries: [
        {
          dayNumber: 1,
          title: '06:00 AM - Partida e inicio de la expedición',
          description: 'Recepción del grupo, traslado guiado y recorrido por los principales atractivos y miradores.',
          activities: 'Trekking guiado, fotografía paisajística',
          meals: 'Almuerzo andino tradicional',
          accommodation: 'Retorno a punto de partida'
        }
      ]
    };
    this.showModal.set(true);
  }

  openEditModal(tour: AdminTour): void {
    this.editingTour.set(tour);
    const existingGallery = (tour.galleryImages && tour.galleryImages.length > 0)
      ? [...tour.galleryImages]
      : (tour.mainImageUrl ? [tour.mainImageUrl] : []);

    let existingItineraries: ItineraryDay[] = [];
    if (tour.itineraries && tour.itineraries.length > 0) {
      existingItineraries = tour.itineraries.map(i => ({ ...i }));
    } else {
      const totalDays = tour.durationDays || 1;
      existingItineraries = Array.from({ length: totalDays }, (_, idx) => ({
        dayNumber: idx + 1,
        title: idx === 0 
          ? (tour.subtitle ? `Día 1: ${tour.subtitle}` : `Día 1: Expedición ${tour.title}`)
          : `Día ${idx + 1}: Continuación del circuito`,
        description: idx === 0 ? (tour.description || '') : 'Recorrido complementario y actividades guiadas.',
        activities: 'Exploración guiada, fotografía',
        meals: 'Almuerzo andino tradicional',
        accommodation: `Retorno a ${tour.startingPoint || 'Aucará / Puquio'}`
      }));
    }

    this.formData = {
      ...tour,
      description: tour.description || 'Expedición auténtica por el Valle del Sondondo.',
      isActive: tour.isActive !== false,
      galleryImages: existingGallery,
      itineraries: existingItineraries
    };
    this.showModal.set(true);
  }

  addItineraryDay(): void {
    if (!this.formData.itineraries) {
      this.formData.itineraries = [];
    }
    const nextDayNumber = this.formData.itineraries.length + 1;
    this.formData.itineraries.push({
      dayNumber: nextDayNumber,
      title: `Día ${nextDayNumber}: Continuación de la Expedición`,
      description: '',
      activities: 'Trekking guiado, exploración local',
      meals: 'Almuerzo tradicional',
      accommodation: `Hospedaje rural / Retorno`
    });

    if ((this.formData.durationDays || 1) < nextDayNumber) {
      this.formData.durationDays = nextDayNumber;
      this.formData.duration = nextDayNumber === 1 
        ? 'Full Day' 
        : `${nextDayNumber} Días / ${nextDayNumber - 1} Noches`;
    }
  }

  removeItineraryDay(index: number): void {
    if (!this.formData.itineraries) return;
    if (this.formData.itineraries.length <= 1) {
      this.showToast('El tour debe tener al menos 1 día de itinerario.');
      return;
    }
    this.formData.itineraries.splice(index, 1);
    this.formData.itineraries.forEach((day, idx) => {
      day.dayNumber = idx + 1;
    });
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  // --- COMPRESIÓN DE FOTOS DIRECTA PARA LOCALSTORAGE Y API EFICIENTE ---
  private compressImageFile(file: File, maxDim = 1200, quality = 0.75): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target.result);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // --- SUBIDA DIRECTA DE FOTO DE PORTADA ---
  async onMainImageFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    try {
      const base64 = await this.compressImageFile(file);
      this.formData.mainImageUrl = base64;
      
      if (!this.formData.galleryImages) {
        this.formData.galleryImages = [];
      }
      if (!this.formData.galleryImages.includes(base64)) {
        this.formData.galleryImages.unshift(base64);
      }
      this.showToast('Foto de portada cargada y optimizada con éxito.');
    } catch (err) {
      console.error('Error al procesar la foto:', err);
      alert('Hubo un error al procesar la imagen seleccionada.');
    } finally {
      input.value = '';
    }
  }

  removeMainImage(): void {
    this.formData.mainImageUrl = '';
  }

  // --- SUBIDA DIRECTA DE FOTOS PARA LA GALERÍA DEL DETALLE DEL TOUR ---
  async onDetailImagesFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    try {
      const processed = await Promise.all(files.map(f => this.compressImageFile(f)));
      if (!this.formData.galleryImages) {
        this.formData.galleryImages = [];
      }
      for (const img of processed) {
        if (!this.formData.galleryImages.includes(img)) {
          this.formData.galleryImages.push(img);
        }
      }
      if (!this.formData.mainImageUrl && this.formData.galleryImages.length > 0) {
        this.formData.mainImageUrl = this.formData.galleryImages[0];
      }
      this.showToast(`Se añadieron ${files.length} foto(s) al detalle del tour.`);
    } catch (err) {
      console.error('Error al procesar las fotos del detalle:', err);
      alert('Hubo un error al procesar las imágenes seleccionadas.');
    } finally {
      input.value = '';
    }
  }

  removeDetailImage(index: number): void {
    if (!this.formData.galleryImages) return;
    const removed = this.formData.galleryImages.splice(index, 1)[0];
    if (this.formData.mainImageUrl === removed) {
      this.formData.mainImageUrl = this.formData.galleryImages[0] || '';
    }
    this.showToast('Foto eliminada del detalle del tour.');
  }

  setAsMainImage(imgUrl: string): void {
    this.formData.mainImageUrl = imgUrl;
    this.showToast('Imagen fijada como Portada Principal del tour.');
  }

  // --- PICKER MODAL DE GALERÍA (ELEGIR FOTOS EXISTENTES EN 1 CLIC) ---
  openGalleryPicker(target: 'main' | 'detail'): void {
    this.galleryPickerTarget = target;
    this.showGalleryPicker.set(true);
  }

  selectPhotoFromPicker(photoUrl: string): void {
    if (this.galleryPickerTarget === 'main') {
      this.formData.mainImageUrl = photoUrl;
      if (!this.formData.galleryImages) this.formData.galleryImages = [];
      if (!this.formData.galleryImages.includes(photoUrl)) {
        this.formData.galleryImages.unshift(photoUrl);
      }
      this.showToast('Foto asignada como Portada Principal.');
    } else {
      if (!this.formData.galleryImages) this.formData.galleryImages = [];
      if (!this.formData.galleryImages.includes(photoUrl)) {
        this.formData.galleryImages.push(photoUrl);
        this.showToast('Foto agregada al detalle de este tour.');
      } else {
        this.showToast('Esta foto ya estaba incluida en el detalle del tour.');
      }
    }
    this.showGalleryPicker.set(false);
  }

  // --- GUARDAR TOUR ---
  onSaveTour(): void {
    if (!this.formData.title) {
      alert('Por favor ingrese el título del tour.');
      return;
    }

    const currentDesc = this.formData.description?.trim() 
      || this.editingTour()?.description 
      || 'Expedición auténtica por los paisajes, andenerías y miradores del Valle del Sondondo.';

    const tourToSave: AdminTour = {
      id: this.editingTour()?.id ?? 0,
      title: this.formData.title!,
      slug: this.formData.slug || this.formData.title!.toLowerCase().replace(/\s+/g, '-'),
      subtitle: this.formData.subtitle || '',
      description: currentDesc,
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
      galleryImages: this.formData.galleryImages && this.formData.galleryImages.length > 0 
        ? this.formData.galleryImages 
        : [this.formData.mainImageUrl || '/assets/images/hero_sondondo.jpg'],
      displayOrder: this.formData.displayOrder || 1,
      itineraries: (this.formData.itineraries && this.formData.itineraries.length > 0)
        ? this.formData.itineraries.map((it, idx) => ({
            id: it.id || (idx + 1),
            dayNumber: it.dayNumber || (idx + 1),
            title: it.title?.trim() || `Día ${idx + 1}`,
            description: it.description?.trim() || '',
            activities: it.activities?.trim() || '',
            meals: it.meals?.trim() || '',
            accommodation: it.accommodation?.trim() || ''
          }))
        : []
    };

    this.adminService.saveTour(tourToSave).subscribe({
      next: (savedTour) => {
        this.closeModal();
        this.loadTours();
        this.showToast(`Tour "${savedTour.title}" guardado exitosamente (Precio: S/ ${savedTour.priceSoles}).`);
      },
      error: (err) => {
        console.error('Error al guardar el tour:', err);
        this.closeModal();
        this.loadTours();
        this.showToast(`Guardado localmente. Error al sincronizar con servidor: ${err.message || 'Error de red'}`);
      }
    });
  }

  onDeleteTour(tour: AdminTour): void {
    if (confirm(`¿Estás seguro de eliminar el tour "${tour.title}"?`)) {
      this.adminService.deleteTour(tour.id).subscribe(() => {
        this.loadTours();
        this.showToast(`Tour "${tour.title}" eliminado.`);
      });
    }
  }
}

