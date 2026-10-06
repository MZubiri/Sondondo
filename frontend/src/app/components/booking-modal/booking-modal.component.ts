import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourSummary, BookingInquiryResponse } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { PaymentService } from '../../services/payment.service';
import { CreatePreferenceRequest } from '../../models/payment.model';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';
import { TouristCalendarComponent } from '../tourist-calendar/tourist-calendar.component';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent, TouristCalendarComponent],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-dialog glass-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <span class="modal-subtitle">{{ ts.t('bookModal.subtitle') }}</span>
            <h3 class="modal-title">
              {{ tour ? tour.title : ts.t('bookModal.defaultTitle') }}
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
                <span class="badge badge-nature">{{ tour.categoryName }}</span>
                <span class="badge">{{ tour.duration }}</span>
              </div>
              <div class="preview-price">
                <span>{{ ts.t('bookModal.rate') }}</span>
                <strong>
                  @if (tour.priceSoles > 0) {
                    S/ {{ tour.priceSoles }}
                  } @else {
                    {{ ts.t('bookModal.inquire') }}
                  }
                </strong>
              </div>
            </div>
          </div>
        }

        <!-- Success State (para cotizaciones sin pago inmediato) -->
        @if (successResponse()) {
          <div class="success-box">
            <div class="success-icon">
              <app-icon name="check" [size]="28" stroke="#27AE60"></app-icon>
            </div>
            <h4>{{ ts.t('bookModal.successTitle') }}</h4>
            <p>
              Gracias, <strong>{{ successResponse()?.fullName }}</strong>. Tu solicitud de cotización para 
              <em>{{ successResponse()?.tourTitle }}</em> ha sido registrada en nuestro sistema.
            </p>
            <div class="success-actions">
              <a [href]="successResponse()?.whatsAppDirectUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('bookModal.waBtn') }}</span>
              </a>
              <button (click)="onClose()" class="btn btn-secondary w-100 mt-2">
                {{ ts.t('bookModal.closeBtn') }}
              </button>
            </div>
          </div>
        } @else {
          <!-- Formulario Único de Reserva y Pago -->
          <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()" class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label for="fullName">{{ ts.t('contact.name') }}</label>
                <input 
                  id="fullName" 
                  type="text" 
                  formControlName="fullName" 
                  [placeholder]="ts.t('contact.namePlaceholder')" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('fullName')" />
                @if (isFieldInvalid('fullName')) {
                  <span class="error-msg">{{ ts.t('pay.errName') }}</span>
                }
              </div>

              <div class="form-group">
                <label for="phone">{{ ts.t('contact.phone') }}</label>
                <input 
                  id="phone" 
                  type="tel" 
                  formControlName="phone" 
                  [placeholder]="ts.t('contact.phonePlaceholder')" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('phone')" />
                @if (isFieldInvalid('phone')) {
                  <span class="error-msg">{{ ts.t('bookModal.errPhone') }}</span>
                }
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">{{ ts.t('contact.email') }}</label>
                <input 
                  id="email" 
                  type="email" 
                  formControlName="email" 
                  [placeholder]="ts.t('contact.emailPlaceholder')" 
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('email')" />
                @if (isFieldInvalid('email')) {
                  <span class="error-msg">{{ ts.t('pay.errEmail') }}</span>
                }
              </div>

              <div class="form-group">
                <label for="numberOfPeople">{{ ts.t('pay.passengers') }}</label>
                <input 
                  id="numberOfPeople" 
                  type="number" 
                  min="1" 
                  max="50" 
                  formControlName="numberOfPeople" 
                  class="form-control" />
              </div>
            </div>

            <div class="form-group cal-group">
              <label class="cal-title-label">
                <span>{{ ts.t('bookModal.travelDate') }}</span>
                <span class="cal-hint-pill">Fechas disponibles</span>
              </label>
              <app-tourist-calendar 
                [initialDate]="bookingForm.get('travelDate')?.value" 
                (dateSelected)="onDateSelected($event)">
              </app-tourist-calendar>
            </div>

            <div class="form-group">
              <label for="message">{{ ts.t('bookModal.messageLabel') }}</label>
              <textarea 
                id="message" 
                rows="2" 
                formControlName="message" 
                [placeholder]="ts.t('bookModal.messagePlaceholder')" 
                class="form-control"></textarea>
            </div>

            <!-- Desglose de Seña 50% calculado en vivo -->
            @if (tour && tour.priceSoles > 0) {
              <div class="deposit-notice-card">
                <div class="deposit-badge-row">
                  <span class="badge-deposit">
                    <app-icon name="shield-check" [size]="15" stroke="#FFFFFF"></app-icon>
                    {{ ts.t('pay.depositBadge') }}
                  </span>
                  <span class="deposit-percent-pill">50% Anticipo</span>
                </div>
                <div class="summary-line">
                  <span>{{ ts.t('pay.totalCalculated') }} ({{ bookingForm.get('numberOfPeople')?.value || 1 }} {{ (bookingForm.get('numberOfPeople')?.value || 1) === 1 ? 'persona' : 'personas' }}):</span>
                  <span>S/ {{ getTotalPrice() }} PEN</span>
                </div>
                <div class="summary-line total-highlight">
                  <span><strong>{{ ts.t('pay.toPayToday') }}</strong></span>
                  <strong class="deposit-amount-highlight">S/ {{ getDepositAmount() }} PEN</strong>
                </div>
                <div class="saldo-notice-row">
                  <app-icon name="info" [size]="15" stroke="var(--accent-clay)"></app-icon>
                  <span>{{ ts.t('pay.saldoHint') }} {{ getDepositAmount() }} PEN</span>
                </div>
              </div>
            }

            <div class="form-actions">
              @if (tour && tour.priceSoles > 0) {
                <!-- Botón Principal: Pagar Seña Directo con Mercado Pago -->
                <button 
                  type="button" 
                  (click)="onPayMercadoPago()" 
                  [disabled]="isPayingWithMP() || isSubmitting()" 
                  class="btn btn-mercadopago w-100">
                  @if (isPayingWithMP()) {
                    <span class="spinner-inline"></span>
                    <span>{{ ts.t('pay.btnConnecting') }}</span>
                  } @else {
                    <app-icon name="credit-card" [size]="19" stroke="#FFFFFF"></app-icon>
                    <span>{{ ts.t('pay.btnMp') }} S/ {{ getDepositAmount() }} {{ ts.t('pay.btnMpSuffix') }}</span>
                  }
                </button>

                <!-- Botón Secundario: Cotizar sin pago inmediato -->
                <button 
                  type="submit" 
                  [disabled]="bookingForm.invalid || isSubmitting() || isPayingWithMP()" 
                  class="btn btn-outline-quote w-100 mt-2">
                  @if (isSubmitting()) {
                    <span>{{ ts.t('bookModal.sending') }}</span>
                  } @else {
                    <app-icon name="calendar" [size]="17"></app-icon>
                    <span>{{ ts.t('bookModal.sendBtn') }} (Sin pago inmediato)</span>
                  }
                </button>
              } @else {
                <!-- Tour a cotizar -->
                <button 
                  type="submit" 
                  [disabled]="bookingForm.invalid || isSubmitting()" 
                  class="btn btn-primary w-100">
                  @if (isSubmitting()) {
                    <span>{{ ts.t('bookModal.sending') }}</span>
                  } @else {
                    <app-icon name="calendar" [size]="18" stroke="#FFFFFF"></app-icon>
                    <span>{{ ts.t('bookModal.sendBtn') }}</span>
                  }
                </button>
              }

              <!-- Botón WhatsApp Directo -->
              <button 
                type="button" 
                (click)="openDirectWhatsApp()" 
                [disabled]="isPayingWithMP() || isSubmitting()"
                class="btn btn-whatsapp w-100 mt-2">
                <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('bookModal.quoteWa') }}</span>
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
      background: transparent !important;
      border-bottom: none;
      position: static;
      padding: 0;
    }

    .modal-subtitle {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-clay);
    }

    .modal-title {
      font-size: 1.4rem;
      color: var(--earth-950);
      margin-top: 0.2rem;
    }

    .close-btn {
      background: var(--cream-100);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xs);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--earth-900);
      transition: var(--transition);
    }

    .close-btn:hover {
      background: var(--earth-200);
      color: var(--earth-950);
    }

    .modal-tour-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      background: var(--cream-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      margin-bottom: 1.25rem;
    }

    .preview-img {
      width: 65px;
      height: 65px;
      border-radius: var(--radius-xs);
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
      color: var(--forest-900);
      white-space: nowrap;
    }

    .deposit-notice-card {
      background: linear-gradient(135deg, var(--forest-50), var(--cream-100));
      border: 1px solid var(--border-light);
      border-left: 4px solid var(--forest-900);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin: 1rem 0 1rem 0;
    }

    .deposit-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.4rem;
    }

    .badge-deposit {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--forest-900);
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-xs);
      letter-spacing: 0.03em;
    }

    .deposit-percent-pill {
      font-size: 0.76rem;
      font-weight: 800;
      color: var(--accent-clay);
      background: var(--surface-card);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      border: 1px solid var(--border-light);
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      color: var(--earth-700);
      margin-bottom: 0.35rem;
    }

    .total-highlight {
      font-size: 1.05rem;
      color: var(--forest-900);
      border-top: 1px solid var(--border-light);
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      align-items: center;
    }

    .deposit-amount-highlight {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--forest-900);
    }

    .saldo-notice-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      color: var(--accent-clay);
      font-weight: 600;
      margin-top: 0.45rem;
      background: var(--surface-card);
      padding: 0.4rem 0.65rem;
      border-radius: var(--radius-xs);
      border: 1px dashed var(--border-light);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 0.85rem;
      display: flex;
      flex-direction: column;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--earth-950);
      margin-bottom: 0.35rem;
    }

    .cal-title-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .cal-hint-pill {
      background: #eef7f0;
      color: #27ae60;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.15rem 0.55rem;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .form-control {
      padding: 0.65rem 0.95rem;
      min-height: 44px;
      border: 1px solid var(--earth-200);
      border-radius: var(--radius-sm);
      background: var(--cream-50);
      color: var(--earth-950);
      font-size: 0.92rem;
      transition: var(--transition);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--forest-900);
      background: #FFFFFF;
      box-shadow: 0 0 0 2px rgba(27, 53, 39, 0.1);
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
      margin-top: 1.25rem;
    }

    .btn-mercadopago {
      background: #009EE3;
      color: #FFFFFF;
      font-weight: 700;
      border: none;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 46px;
      font-size: 0.95rem;
      box-shadow: 0 4px 12px rgba(0, 158, 227, 0.25);
    }

    .btn-mercadopago:hover {
      background: #0087C4;
      color: #FFFFFF;
    }

    .btn-mercadopago:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-outline-quote {
      background: #FFFFFF;
      border: 1.5px solid var(--forest-900);
      color: var(--forest-900);
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: var(--transition);
      cursor: pointer;
      padding: 0.65rem 1rem;
      border-radius: var(--radius-sm);
      min-height: 44px;
    }

    .btn-outline-quote:hover {
      background: var(--forest-50);
      color: var(--forest-900);
    }

    .btn-outline-quote:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner-inline {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      display: inline-block;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
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
  private paymentService = inject(PaymentService);
  public ts = inject(TranslationService);

  @Input() tour: TourSummary | null = null;
  @Input() whatsAppNumber: string = '51966380590';
  @Output() close = new EventEmitter<void>();
  @Output() payMercadoPago = new EventEmitter<TourSummary>();

  bookingForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    numberOfPeople: [1, [Validators.required, Validators.min(1)]],
    travelDate: [''],
    message: ['']
  });

  isSubmitting = signal(false);
  isPayingWithMP = signal(false);
  successResponse = signal<BookingInquiryResponse | null>(null);

  getTotalPrice(): number {
    const base = this.tour?.priceSoles || 0;
    const people = this.bookingForm.get('numberOfPeople')?.value || 1;
    return base * Math.max(1, people);
  }

  getDepositAmount(): number {
    const total = this.getTotalPrice();
    if (total <= 5) return total;
    return Math.max(1, Math.round(total / 2));
  }

  isFieldInvalid(field: string): boolean {
    const control = this.bookingForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onDateSelected(dateStr: string): void {
    this.bookingForm.get('travelDate')?.setValue(dateStr);
  }

  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.bookingForm.value;
    const totalAmount = this.getTotalPrice();

    const req = {
      tourId: this.tour?.id,
      fullName: formVal.fullName,
      email: formVal.email,
      phone: formVal.phone,
      numberOfPeople: formVal.numberOfPeople || 1,
      travelDate: formVal.travelDate,
      message: formVal.message,
      totalAmount: totalAmount,
      paidAmount: 0,
      paymentStatus: 'Pendiente',
      paymentMethod: 'Pendiente'
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

  onPayMercadoPago(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    if (!this.tour) return;

    this.isPayingWithMP.set(true);
    const formVal = this.bookingForm.value;
    const depositAmount = this.getDepositAmount();
    const totalAmount = this.getTotalPrice();
    const tempVoucher = 'VSE-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const bookingReq = {
      tourId: this.tour.id,
      fullName: formVal.fullName,
      email: formVal.email,
      phone: formVal.phone,
      numberOfPeople: formVal.numberOfPeople || 1,
      travelDate: formVal.travelDate,
      message: formVal.message,
      voucherCode: tempVoucher,
      totalAmount: totalAmount,
      paidAmount: 0,
      paymentStatus: 'Pendiente',
      paymentMethod: 'MercadoPago'
    };

    // Primero registramos la reserva en el sistema/panel admin
    this.tourService.createBooking(bookingReq).subscribe({
      next: (bookingRes) => {
        const ref = bookingRes?.voucherCode || (bookingRes?.id ? `VSE-2026-${bookingRes.id}` : tempVoucher);
        this.executeMercadoPagoCheckout(ref, depositAmount, totalAmount);
      },
      error: () => {
        // En caso de incidencia en el backend, continúa al checkout de pago seguro
        this.executeMercadoPagoCheckout(tempVoucher, depositAmount, totalAmount);
      }
    });
  }

  private executeMercadoPagoCheckout(voucherCode: string, depositAmount: number, totalAmount: number): void {
    const formVal = this.bookingForm.value;
    const isDeposit = depositAmount < totalAmount;
    const balanceRemaining = Math.max(0, totalAmount - depositAmount);

    const prefReq: CreatePreferenceRequest = {
      title: isDeposit ? `${this.tour!.title} (Seña de Reserva 50%)` : `${this.tour!.title} (Pago Total)`,
      description: isDeposit
        ? `Seña 50% para ${formVal.numberOfPeople || 1} persona(s) - Fecha: ${formVal.travelDate || 'Por coordinar'} (Saldo restante: S/ ${balanceRemaining} PEN al llegar)`
        : `Pago total para ${formVal.numberOfPeople || 1} persona(s) - Fecha: ${formVal.travelDate || 'Por coordinar'}`,
      unitPrice: depositAmount,
      quantity: 1,
      payerName: formVal.fullName,
      payerEmail: formVal.email,
      payerPhone: formVal.phone,
      isDepositOnly: isDeposit,
      paymentCategory: 'Tour',
      tourId: this.tour!.id,
      bookingReference: voucherCode
    };

    this.paymentService.createPreference(prefReq).subscribe({
      next: (res) => {
        this.isPayingWithMP.set(false);
        const targetUrl = res.mode === 'sandbox'
          ? (res.sandboxInitPoint || res.initPoint)
          : (res.initPoint || res.sandboxInitPoint);
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      },
      error: (err) => {
        this.isPayingWithMP.set(false);
        console.warn('Mercado Pago preference error, falling back to WhatsApp:', err);
        this.openWhatsAppPaymentFallback(depositAmount);
      }
    });
  }

  private openWhatsAppPaymentFallback(depositAmount: number): void {
    const val = this.bookingForm.value;
    const total = this.getTotalPrice();
    const tourTitle = this.tour?.title || 'Tour en Valle del Sondondo';
    const text = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\n` +
      `Deseo pagar la *Seña de Reserva (50%)* para el tour: *${tourTitle}*\n` +
      `👤 Pasajero: ${val.fullName || 'Viajero'}\n` +
      `📱 Teléfono: ${val.phone || ''}\n` +
      `📧 Email: ${val.email || ''}\n` +
      `👥 Personas: ${val.numberOfPeople || 1}\n` +
      `📅 Fecha: ${val.travelDate || 'Por coordinar'}\n` +
      `💰 Total: S/ ${total} PEN\n` +
      `💳 Seña 50%: S/ ${depositAmount} PEN\n` +
      `💵 Saldo restante al llegar: S/ ${depositAmount} PEN\n\n` +
      `Por favor indíquenme las cuentas bancarias o enlace de pago para abonar la seña y confirmar mi cupo.`
    );
    window.open(`https://wa.me/${this.whatsAppNumber}?text=${text}`, '_blank');
  }

  openDirectWhatsApp(): void {
    const val = this.bookingForm.value;
    const tourTitle = this.tour?.title || 'Tour en Valle del Sondondo';
    const text = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\n` +
      `Deseo cotizar el tour: *${tourTitle}*\n` +
      `👤 Nombre: ${val.fullName || 'Viajero'}\n` +
      `👥 Personas: ${val.numberOfPeople || 1}\n` +
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
