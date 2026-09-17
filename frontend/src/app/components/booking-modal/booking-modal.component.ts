import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourSummary, BookingInquiryResponse } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-dialog glass-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <span class="modal-subtitle">Reserva & Cotización</span>
            <h3 class="modal-title">
              {{ tour ? tour.title : 'Planifica tu Expedición en Sondondo' }}
            </h3>
          </div>
          <button class="close-btn" (click)="onClose()" aria-label="Cerrar modal">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Tour Quick Summary if tour selected -->
        @if (tour) {
          <div class="modal-tour-preview">
            <img [src]="tour.mainImageUrl" [alt]="tour.title" class="preview-img" />
            <div class="preview-info">
              <div class="preview-badges">
                <span class="badge badge-terracotta">{{ tour.categoryName }}</span>
                <span class="badge badge-gold">{{ tour.duration }}</span>
              </div>
              <div class="preview-price">
                <span>Desde:</span>
                <strong>S/ {{ tour.priceSoles }}</strong>
                <small>(USD {{ tour.priceUsd }})</small>
              </div>
            </div>
          </div>
        }

        <!-- Success State -->
        @if (successResponse()) {
          <div class="success-box">
            <div class="success-icon">
              <app-icon name="check" [size]="28" stroke="#27AE60"></app-icon>
            </div>
            <h4>¡Solicitud Recibida con Éxito!</h4>
            <p>
              Gracias, <strong>{{ successResponse()?.fullName }}</strong>. Tu solicitud de cotización para 
              <em>{{ successResponse()?.tourTitle }}</em> ha sido registrada en nuestro sistema.
            </p>
            <div class="success-actions">
              <a [href]="successResponse()?.whatsAppDirectUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
                <span>Continuar por WhatsApp Inmediatamente</span>
              </a>
              <button (click)="onClose()" class="btn btn-secondary w-100 mt-2">
                Cerrar Ventana
              </button>
            </div>
          </div>
        } @else {
          <!-- Form -->
          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">Nombre y Apellido *</label>
                <input 
                  id="fullName" 
                  type="text" 
                  formControlName="fullName" 
                  placeholder="Ej. Juan Pérez" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('fullName')" />
                @if (isFieldInvalid('fullName')) {
                  <span class="error-msg">Por favor ingresa tu nombre completo.</span>
                }
              </div>

              <div class="form-group">
                <label for="phone">WhatsApp / Teléfono *</label>
                <input 
                  id="phone" 
                  type="tel" 
                  formControlName="phone" 
                  placeholder="+51 987 654 321" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('phone')" />
                @if (isFieldInvalid('phone')) {
                  <span class="error-msg">Ingresa un número para contactarte.</span>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Correo Electrónico *</label>
                <input 
                  id="email" 
                  type="email" 
                  formControlName="email" 
                  placeholder="ejemplo@correo.com" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('email')" />
                @if (isFieldInvalid('email')) {
                  <span class="error-msg">Ingresa un correo electrónico válido.</span>
                }
              </div>

              <div class="form-group">
                <label for="numberOfPeople">Nº de Pasajeros *</label>
                <input 
                  id="numberOfPeople" 
                  type="number" 
                  min="1" 
                  max="50" 
                  formControlName="numberOfPeople" 
                  class="form-control" />
              </div>
            </div>

            <div class="form-group">
              <label for="travelDate">Fecha Tentativa de Viaje</label>
              <input 
                id="travelDate" 
                type="date" 
                formControlName="travelDate" 
                class="form-control" />
            </div>

            <div class="form-group">
              <label for="message">Mensaje o Requerimientos Especiales</label>
              <textarea 
                id="message" 
                rows="3" 
                formControlName="message" 
                placeholder="¿Tienes alguna duda sobre aclimatación, salidas grupales o traslados desde Lima/Ayacucho?" 
                class="form-control"></textarea>
            </div>

            <div class="form-actions">
              <button 
                type="submit" 
                [disabled]="bookingForm.invalid || isSubmitting()" 
                class="btn btn-primary w-100">
                @if (isSubmitting()) {
                  <span>Enviando solicitud...</span>
                } @else {
                  <app-icon name="calendar" [size]="18" stroke="#FFFFFF"></app-icon>
                  <span>Enviar Cotización</span>
                }
              </button>

              <button 
                type="button" 
                (click)="openDirectWhatsApp()" 
                class="btn btn-whatsapp w-100 mt-2">
                <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
                <span>Cotizar Directo por WhatsApp</span>
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 19, 43, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.25s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 2rem;
      background: #FFFFFF;
      position: relative;
    }

    .modal-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.25rem;
    }

    .modal-subtitle {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--primary);
    }

    .modal-title {
      font-size: 1.4rem;
      color: var(--night-900);
      margin-top: 0.2rem;
    }

    .close-btn {
      background: var(--earth-100);
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--night-900);
      transition: var(--transition-smooth);
    }

    .close-btn:hover {
      background: var(--earth-200);
      color: var(--primary);
    }

    .modal-tour-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      background: var(--earth-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
    }

    .preview-img {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      object-fit: cover;
    }

    .preview-badges {
      display: flex;
      gap: 0.4rem;
      margin-bottom: 0.35rem;
    }

    .preview-price {
      font-size: 0.82rem;
      color: var(--earth-700);
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .preview-price strong {
      font-size: 1.1rem;
      color: var(--night-900);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--night-900);
      margin-bottom: 0.35rem;
    }

    .form-control {
      padding: 0.7rem 0.95rem;
      border: 1.5px solid var(--earth-200);
      border-radius: 10px;
      background: var(--earth-50);
      color: var(--night-900);
      font-size: 0.92rem;
      transition: var(--transition-smooth);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.12);
    }

    .form-control.is-invalid {
      border-color: #E74C3C;
    }

    .error-msg {
      font-size: 0.75rem;
      color: #E74C3C;
      margin-top: 0.25rem;
    }

    .form-actions {
      margin-top: 1.5rem;
    }

    .w-100 {
      width: 100%;
    }

    .mt-2 {
      margin-top: 0.65rem;
    }

    .success-box {
      text-align: center;
      padding: 1.5rem 0;
    }

    .success-icon {
      width: 64px;
      height: 64px;
      background: #E8F5E9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem auto;
    }

    .success-box h4 {
      font-size: 1.35rem;
      margin-bottom: 0.5rem;
    }

    .success-box p {
      color: var(--earth-700);
      font-size: 0.92rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      .modal-dialog {
        padding: 1.25rem;
      }
    }
  `]
})
export class BookingModalComponent {
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);

  @Input() tour: TourSummary | null = null;
  @Input() whatsAppNumber: string = '51966380590';
  @Output() close = new EventEmitter<void>();

  bookingForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    numberOfPeople: [2, [Validators.required, Validators.min(1)]],
    travelDate: [''],
    message: ['']
  });

  isSubmitting = signal(false);
  successResponse = signal<BookingInquiryResponse | null>(null);

  isFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.bookingForm.value;

    const req = {
      tourId: this.tour?.id,
      fullName: formVal.fullName,
      email: formVal.email,
      phone: formVal.phone,
      numberOfPeople: formVal.numberOfPeople,
      travelDate: formVal.travelDate,
      message: formVal.message
    };

    this.tourService.createBooking(req).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successResponse.set(res);
      },
      error: () => {
        this.isSubmitting.set(false);
        // Fallback direct WhatsApp redirect
        this.openDirectWhatsApp();
      }
    });
  }

  openDirectWhatsApp(): void {
    const val = this.bookingForm.value;
    const tourTitle = this.tour?.title || 'Tour en Valle del Sondondo';
    const text = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\n` +
      `Deseo cotizar el tour: *${tourTitle}*\n` +
      `👤 Nombre: ${val.fullName || 'Viajero'}\n` +
      `👥 Personas: ${val.numberOfPeople || 2}\n` +
      `📅 Fecha tentativa: ${val.travelDate || 'Por coordinar'}\n` +
      `📱 Teléfono: ${val.phone || ''}\n` +
      (val.message ? `💬 Consulta: ${val.message}` : '')
    );
    window.open(`https://wa.me/${this.whatsAppNumber}?text=${text}`, '_blank');
  }

  onClose(): void {
    this.close.emit();
  }
}
