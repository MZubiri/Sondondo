import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { GalleryItem } from '../../models/admin.model';

@Component({
  selector: 'app-admin-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="gallery-admin-page">
      <!-- HEADER -->
      <div class="page-header">
        <div class="page-header-titles">
          <div class="page-eyebrow">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>Recursos Multimedia</span>
          </div>
          <h1 class="page-title">Galería Multimedia Oficial</h1>
          <p class="page-desc">Administra el banco fotográfico oficial del Valle del Sondondo para usar en circuitos y portadas</p>
        </div>
        <button class="btn-adm btn-adm-primary" (click)="showUploadModal.set(true)">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Subir Fotografía</span>
        </button>
      </div>

      <!-- TOAST FEEDBACK -->
      <div *ngIf="copyFeedback()" class="copy-toast">
        <span>✓ {{ copyFeedback() }}</span>
      </div>

      <!-- FILTER CONTROLS -->
      <div class="filters-bar">
        <div class="filter-pills">
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory() === 'all'"
            (click)="selectedCategory.set('all')"
          >
            Todas ({{ allCount() }})
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory() === 'Fauna'"
            (click)="selectedCategory.set('Fauna')"
          >
            Fauna & Cóndores
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory() === 'Paisajes'"
            (click)="selectedCategory.set('Paisajes')"
          >
            Paisajes & Volcanes
          </button>
          <button 
            type="button" 
            class="pill-btn" 
            [class.active]="selectedCategory() === 'Cultura'"
            (click)="selectedCategory.set('Cultura')"
          >
            Cultura & Pueblos
          </button>
        </div>
      </div>

      <!-- PHOTO GRID -->
      <div class="photos-grid">
        <div *ngFor="let photo of filteredPhotos()" class="photo-card">
          <div class="photo-img-wrapper" (click)="openLightbox(photo)">
            <img [src]="photo.url" [alt]="photo.title" loading="lazy" />
            <span class="category-badge">{{ photo.category }}</span>
            <div class="hover-overlay">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <span>Ampliar fotografía</span>
            </div>
          </div>

          <div class="photo-details">
            <h4 class="photo-title">{{ photo.title }}</h4>
            <span class="photo-loc">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ photo.location }}</span>
            </span>
            <code class="photo-path">{{ photo.url }}</code>
          </div>

          <div class="photo-actions">
            <button 
              type="button" 
              class="btn-copy" 
              (click)="copyUrl(photo.url)" 
              title="Copiar ruta para pegarla en tours o portadas"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copiar Ruta</span>
            </button>
            <button 
              type="button" 
              class="btn-del-photo" 
              (click)="onDeletePhoto(photo.id)" 
              title="Eliminar fotografía"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- UPLOAD MODAL -->
      <div class="modal-backdrop" *ngIf="showUploadModal()" (click)="showUploadModal.set(false)">
        <div class="upload-modal-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Subir Nueva Fotografía</h3>
            <button class="btn-close" (click)="showUploadModal.set(false)">×</button>
          </div>

          <form (ngSubmit)="onSavePhoto()" class="upload-form">
            <div class="form-field">
              <label>Título de la Fotografía *</label>
              <input type="text" [(ngModel)]="newPhotoTitle" name="newPhotoTitle" required placeholder="Ej: Mirador de Cóndores Mayobamba al amanecer" />
            </div>

            <div class="form-grid">
              <div class="form-field">
                <label>Categoría</label>
                <select [(ngModel)]="newPhotoCategory" name="newPhotoCategory">
                  <option value="Fauna">Fauna & Cóndores</option>
                  <option value="Paisajes">Paisajes & Andenes</option>
                  <option value="Cultura">Cultura & Tradiciones</option>
                  <option value="Aventura">Aventura & Expediciones</option>
                </select>
              </div>

              <div class="form-field">
                <label>Ubicación / Comunidad</label>
                <input type="text" [(ngModel)]="newPhotoLocation" name="newPhotoLocation" placeholder="Ej: Aucará, Andamarca, Chipao, Sacsamarca" />
              </div>
            </div>

            <div class="form-field">
              <label>Archivo de Imagen (PNG, JPG o WebP)</label>
              <div class="dropzone">
                <input type="file" accept="image/*" (change)="onFileSelected($event)" id="photoFileInput" class="file-input" />
                <label for="photoFileInput" class="dropzone-label">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#c85a32" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Seleccionar archivo o soltar imagen aquí</span>
                </label>
              </div>
            </div>

            <div *ngIf="newPhotoPreviewUrl" class="preview-box">
              <span class="preview-tag">Vista Previa:</span>
              <img [src]="newPhotoPreviewUrl" alt="Preview" class="preview-thumbnail" />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showUploadModal.set(false)">Cancelar</button>
              <button type="submit" class="btn-save" [disabled]="!newPhotoTitle || !newPhotoPreviewUrl">Guardar en Galería</button>
            </div>
          </form>
        </div>
      </div>

      <!-- LIGHTBOX MODAL -->
      <div class="modal-backdrop lightbox-backdrop" *ngIf="activeLightboxPhoto()" (click)="activeLightboxPhoto.set(null)">
        <div class="lightbox-card" (click)="$event.stopPropagation()">
          <img [src]="activeLightboxPhoto()!.url" [alt]="activeLightboxPhoto()!.title" class="lightbox-img" />
          <div class="lightbox-caption">
            <h3>{{ activeLightboxPhoto()!.title }}</h3>
            <p>{{ activeLightboxPhoto()!.location }} • Categoría: {{ activeLightboxPhoto()!.category }}</p>
            <button class="btn-copy-white" (click)="copyUrl(activeLightboxPhoto()!.url)">Copiar Ruta de Imagen</button>
          </div>
          <button class="btn-close-lightbox" (click)="activeLightboxPhoto.set(null)">×</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gallery-admin-page {
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

    .copy-toast {
      background: #166534;
      color: #ffffff;
      padding: 0.65rem 1rem;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      animation: fadeIn 0.2s ease-out;
    }

    .filter-bar {
      display: flex;
      gap: 0.5rem;
    }

    .category-pills {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .cat-pill {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
      padding: 0.45rem 0.9rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cat-pill:hover {
      background: #334155;
      color: #ffffff;
    }

    .cat-pill.active {
      background: #c85a32;
      color: #ffffff;
      border-color: #c85a32;
    }

    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.25rem;
    }

    .photo-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: all 0.2s ease;
    }

    .photo-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .photo-img-wrapper {
      position: relative;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      cursor: pointer;
    }

    .photo-img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .photo-img-wrapper:hover img {
      transform: scale(1.05);
    }

    .category-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(18, 35, 26, 0.85);
      backdrop-filter: blur(4px);
      color: #4ade80;
      padding: 0.2rem 0.55rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-weight: 700;
    }

    .hover-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .photo-img-wrapper:hover .hover-overlay {
      opacity: 1;
    }

    .photo-details {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      flex: 1;
    }

    .photo-title {
      margin: 0;
      color: #f8fafc;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .photo-loc {
      color: #94a3b8;
      font-size: 0.78rem;
    }

    .photo-path {
      background: #1e293b;
      padding: 0.25rem 0.45rem;
      border-radius: 4px;
      color: #38bdf8;
      font-size: 0.75rem;
      word-break: break-all;
      margin-top: 0.3rem;
    }

    .photo-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(0, 0, 0, 0.15);
    }

    .btn-copy {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-copy:hover {
      background: #0284c7;
      color: #ffffff;
    }

    .btn-del-photo {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: none;
      padding: 0.35rem;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-del-photo:hover {
      background: #ef4444;
      color: #ffffff;
    }

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

    .upload-modal-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      width: 100%;
      max-width: 540px;
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

    .upload-form {
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

    .dropzone {
      border: 1.5px dashed rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1.5rem 1rem;
      text-align: center;
    }

    .file-input { display: none; }

    .dropzone-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .preview-box {
      background: #1e293b;
      padding: 0.75rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-tag {
      font-size: 0.75rem;
      color: #38bdf8;
      font-weight: 700;
    }

    .preview-thumbnail {
      max-height: 140px;
      object-fit: contain;
      border-radius: 6px;
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

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* LIGHTBOX */
    .lightbox-backdrop {
      background: rgba(0, 0, 0, 0.9);
      z-index: 2000;
    }

    .lightbox-card {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .lightbox-img {
      max-width: 85vw;
      max-height: 75vh;
      object-fit: contain;
      border-radius: 8px;
    }

    .lightbox-caption {
      margin-top: 1rem;
      text-align: center;
      color: #ffffff;
    }

    .lightbox-caption h3 {
      margin: 0 0 0.3rem 0;
      font-size: 1.15rem;
    }

    .lightbox-caption p {
      margin: 0 0 0.75rem 0;
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .btn-copy-white {
      background: #38bdf8;
      color: #0f172a;
      border: none;
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .btn-close-lightbox {
      position: absolute;
      top: -35px;
      right: 0;
      background: none;
      border: none;
      color: #ffffff;
      font-size: 2rem;
      cursor: pointer;
    }
  `]
})
export class AdminGalleryComponent implements OnInit {
  private adminService = inject(AdminService);

  photos = signal<GalleryItem[]>([]);
  selectedCategory = signal<string>('all');
  activeLightboxPhoto = signal<GalleryItem | null>(null);
  showUploadModal = signal(false);
  copyFeedback = signal<string | null>(null);

  // Upload Form
  newPhotoTitle = '';
  newPhotoCategory: GalleryItem['category'] = 'Paisajes';
  newPhotoLocation = '';
  newPhotoPreviewUrl = '';

  allCount = computed(() => this.photos().length);

  filteredPhotos = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'all') return this.photos();
    return this.photos().filter(p => p.category === cat);
  });

  ngOnInit(): void {
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.adminService.getGalleryItems().subscribe(items => {
      this.photos.set(items);
    });
  }

  copyUrl(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.copyFeedback.set(`Ruta copiada al portapapeles: "${url}"`);
      setTimeout(() => this.copyFeedback.set(null), 3000);
    });
  }

  openLightbox(photo: GalleryItem): void {
    this.activeLightboxPhoto.set(photo);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.newPhotoPreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSavePhoto(): void {
    if (!this.newPhotoTitle || !this.newPhotoPreviewUrl) return;

    const newItem: GalleryItem = {
      id: 'custom-' + Date.now(),
      title: this.newPhotoTitle,
      category: this.newPhotoCategory,
      location: this.newPhotoLocation || 'Valle del Sondondo',
      url: this.newPhotoPreviewUrl,
      altText: this.newPhotoTitle,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    this.adminService.addGalleryItem(newItem).subscribe(() => {
      this.showUploadModal.set(false);
      this.newPhotoTitle = '';
      this.newPhotoLocation = '';
      this.newPhotoPreviewUrl = '';
      this.loadPhotos();
      this.copyFeedback.set('¡Fotografía agregada con éxito a la galería!');
      setTimeout(() => this.copyFeedback.set(null), 3000);
    });
  }

  onDeletePhoto(id: string): void {
    if (confirm('¿Eliminar esta fotografía de la galería?')) {
      this.adminService.deleteGalleryItem(id).subscribe(() => {
        this.loadPhotos();
      });
    }
  }
}
