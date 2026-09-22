import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';
import { CreatePreferenceRequest } from '../../models/payment.model';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

export interface PaymentTarget {
  type: 'Tour' | 'HotelRoom';
  id?: number;
  title: string;
  unitPriceSoles: number;
  subtitle?: string;
  image?: string;
}

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-dialog glass-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div>
            <div class="mp-badge-header">
              <span class="mp-logo-text">{{ ts.t('pay.headerLogo') }}</span>
              <span class="secure-tag">{{ ts.t('pay.headerSecure') }}</span>
            </div>
            <h3 class="modal-title">{{ ts.t('pay.title') }}</h3>
            <p class="modal-subtitle">{{ ts.t('pay.subtitle') }}</p>
          </div>
          <button class="close-btn" (click)="onClose()" aria-label="Cerrar modal">
            <app-icon name="x" [size]="20"></app-icon>
          </button>
        </div>

        <!-- Selected Item Preview -->
        <div class="selected-item-box">
          @if (target.image) {
            <img [src]="target.image" [alt]="target.title" class="target-img" />
          }
          <div class="target-info">
            <span class="target-type-badge">
              {{ target.type === 'Tour' ? ts.t('pay.tourBadge') : ts.t('pay.roomBadge') }}
            </span>
            <h4 class="target-title">{{ target.title }}</h4>
            <div class="target-price-row">
              <span>{{ ts.t('pay.baseRate') }}</span>
              <strong>S/ {{ target.unitPriceSoles }} PEN</strong>
            </div>
          </div>
        </div>

        <!-- Seña de Reserva (50%) Banner -->
        <div class="deposit-notice-card">
          <div class="deposit-badge-row">
            <span class="badge-deposit">
              <app-icon name="shield-check" [size]="15" stroke="#FFFFFF"></app-icon>
              {{ ts.t('pay.depositBadge') }}
            </span>
            <span class="deposit-percent-pill">50% Anticipo</span>
          </div>
          <p class="deposit-notice-text">{{ ts.t('pay.depositNotice') }}</p>
        </div>

        <!-- Payer Form -->
        <form [formGroup]="payerForm" (ngSubmit)="onProcessPayment()" class="payer-form">
          <div class="form-row">
            <div class="form-group">
              <label for="payerName">{{ ts.t('pay.fullName') }}</label>
              <input 
                id="payerName" 
                type="text" 
                formControlName="name" 
                [placeholder]="ts.t('pay.namePlaceholder')" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('name')" />
              @if (isFieldInvalid('name')) {
                <span class="error-msg">{{ ts.t('pay.errName') }}</span>
              }
            </div>

            <div class="form-group">
              <label for="payerEmail">{{ ts.t('pay.emailReceipt') }}</label>
              <input 
                id="payerEmail" 
                type="email" 
                formControlName="email" 
                [placeholder]="ts.t('pay.emailPlaceholder')" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('email')" />
              @if (isFieldInvalid('email')) {
                <span class="error-msg">{{ ts.t('pay.errEmail') }}</span>
              }
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="payerPhone">{{ ts.t('pay.phone') }}</label>
              <input 
                id="payerPhone" 
                type="tel" 
                formControlName="phone" 
                [placeholder]="ts.t('pay.phonePlaceholder')" 
                class="form-control"
                [class.is-invalid]="isFieldInvalid('phone')" />
            </div>

            <div class="form-group">
              <label for="quantity">
                {{ target.type === 'Tour' ? ts.t('pay.passengers') : ts.t('pay.nights') }}
              </label>
              <input 
                id="quantity" 
                type="number" 
                min="1" 
                max="20" 
                formControlName="quantity" 
                class="form-control" />
            </div>
          </div>

          <div class="form-group">
            <label for="resDate">{{ ts.t('pay.travelDate') }}</label>
            <input 
              id="resDate" 
              type="date" 
              formControlName="travelDate" 
              class="form-control" />
          </div>

          <!-- Total Calculation & Deposit Breakdown -->
          <div class="summary-box">
            <div class="summary-line">
              <span>{{ ts.t('pay.totalCalculated') }}</span>
              <span>S/ {{ calculateTotal() }} PEN</span>
            </div>
            <div class="summary-line total-highlight">
              <span><strong>{{ ts.t('pay.toPayToday') }}</strong></span>
              <strong class="deposit-amount-highlight">S/ {{ getPayableAmount() }} PEN</strong>
            </div>
            <div class="saldo-notice-row">
              <app-icon name="info" [size]="15" stroke="var(--accent-clay)"></app-icon>
              <span>{{ ts.t('pay.saldoHint') }} {{ getPayableAmount() }} PEN</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button 
              type="submit" 
              [disabled]="payerForm.invalid || isLoading()" 
              class="btn btn-mercadopago w-100">
              @if (isLoading()) {
                <span>{{ ts.t('pay.btnConnecting') }}</span>
              } @else {
                <app-icon name="credit-card" [size]="19" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('pay.btnMp') }} S/ {{ getPayableAmount() }} {{ ts.t('pay.btnMpSuffix') }}</span>
              }
            </button>

            <button 
              type="button" 
              (click)="onWhatsAppPay()" 
              class="btn btn-whatsapp w-100 mt-2">
              <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
              <span>{{ ts.t('pay.btnWa') }}</span>
            </button>
          </div>

          <!-- Security Footnote -->
          <div class="security-footnote">
            <app-icon name="shield-check" [size]="16" stroke="var(--forest-900)"></app-icon>
            <span>{{ ts.t('pay.securityFootnote') }}</span>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 19, 43, 0.75);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 2200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      width: 100%;
      max-width: 600px;
      max-height: 92vh;
      overflow-y: auto;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 2rem;
      position: relative;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .mp-badge-header {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.35rem;
    }

    .mp-logo-text {
      background: #009EE3;
      color: #FFFFFF;
      font-weight: 800;
      font-size: 0.8rem;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      letter-spacing: -0.01em;
    }

    .secure-tag {
      font-size: 0.75rem;
      font-weight: 700;
      color: #27AE60;
      letter-spacing: 0.04em;
    }

    .modal-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--earth-950);
      line-height: 1.2;
    }

    .modal-subtitle {
      font-size: 0.85rem;
      color: var(--earth-700);
      margin-top: 0.2rem;
    }

    .close-btn {
      background: var(--cream-100);
      border: none;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--earth-800);
      transition: var(--transition);
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: var(--earth-200);
    }

    .selected-item-box {
      display: flex;
      gap: 1rem;
      background: var(--cream-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 1rem;
    }

    .target-img {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-xs);
      object-fit: cover;
    }

    .target-info {
      flex: 1;
    }

    .target-type-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--forest-900);
    }

    .target-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--earth-950);
      margin: 0.15rem 0 0.35rem 0;
    }

    .target-price-row {
      font-size: 0.85rem;
      color: var(--earth-700);
      display: flex;
      gap: 0.4rem;
    }

    .target-price-row strong {
      color: var(--forest-900);
    }

    /* Deposit Notice Card */
    .deposit-notice-card {
      background: linear-gradient(135deg, var(--forest-50), var(--cream-100));
      border: 1px solid var(--border-light);
      border-left: 4px solid var(--forest-900);
      border-radius: var(--radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 1.25rem;
    }

    .deposit-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.35rem;
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

    .deposit-notice-text {
      font-size: 0.82rem;
      color: var(--earth-800);
      line-height: 1.45;
      margin: 0;
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
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--earth-950);
      margin-bottom: 0.3rem;
    }

    .form-control {
      padding: 0.65rem 0.85rem;
      min-height: 42px;
      border: 1px solid var(--earth-200);
      border-radius: var(--radius-sm);
      background: var(--cream-50);
      color: var(--earth-950);
      font-size: 0.9rem;
      transition: var(--transition);
    }

    .form-control:focus {
      outline: none;
      border-color: #009EE3;
      background: #FFFFFF;
      box-shadow: 0 0 0 2px rgba(0, 158, 227, 0.15);
    }

    .form-control.is-invalid {
      border-color: #E74C3C;
    }

    .error-msg {
      font-size: 0.72rem;
      color: #E74C3C;
      margin-top: 0.2rem;
    }

    .summary-box {
      background: var(--cream-100);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 1.1rem;
      margin: 1rem 0 1.25rem 0;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      color: var(--earth-700);
      margin-bottom: 0.35rem;
    }

    .total-highlight {
      font-size: 1.15rem;
      color: var(--forest-900);
      border-top: 1px solid var(--border-light);
      padding-top: 0.6rem;
      margin-top: 0.6rem;
      align-items: center;
    }

    .deposit-amount-highlight {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--forest-900);
    }

    .saldo-notice-row {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--accent-clay);
      font-weight: 600;
      margin-top: 0.5rem;
      background: var(--surface-card);
      padding: 0.45rem 0.75rem;
      border-radius: var(--radius-xs);
      border: 1px dashed var(--border-light);
    }

    .btn-mercadopago {
      background: #009EE3;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.85rem 1.2rem;
      border: none;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      cursor: pointer;
      transition: var(--transition);
      box-shadow: 0 4px 12px rgba(0, 158, 227, 0.25);
    }

    .btn-mercadopago:hover {
      background: #0087C4;
      color: #FFFFFF;
    }

    .security-footnote {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      margin-top: 1rem;
      font-size: 0.78rem;
      color: var(--earth-700);
    }

    .w-100 { width: 100%; }
    .mt-2 { margin-top: 0.6rem; }

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
export class PaymentModalComponent {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  public ts = inject(TranslationService);

  @Input({ required: true }) target!: PaymentTarget;
  @Input() whatsAppNumber: string = '51966380590';
  @Output() close = new EventEmitter<void>();

  isLoading = signal(false);

  payerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    travelDate: ['']
  });

  calculateTotal(): number {
    const qty = this.payerForm.get('quantity')?.value || 1;
    return this.target.unitPriceSoles * qty;
  }

  getPayableAmount(): number {
    const total = this.calculateTotal();
    return Math.round(total / 2);
  }

  isFieldInvalid(field: string): boolean {
    const c = this.payerForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onProcessPayment(): void {
    if (this.payerForm.invalid) {
      this.payerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const formVal = this.payerForm.value;
    const amount = this.getPayableAmount();

    const req: CreatePreferenceRequest = {
      title: `${this.target.title} (Seña de Reserva 50%)`,
      description: `Seña 50% para ${formVal.quantity} ${this.target.type === 'Tour' ? 'persona(s)' : 'noche(s)'} - Fecha: ${formVal.travelDate || 'Por coordinar'} (Saldo restante: S/ ${amount} PEN al llegar)`,
      unitPrice: amount,
      quantity: 1,
      payerName: formVal.name,
      payerEmail: formVal.email,
      payerPhone: formVal.phone,
      isDepositOnly: true,
      paymentCategory: this.target.type,
      tourId: this.target.type === 'Tour' ? this.target.id : undefined,
      roomId: this.target.type === 'HotelRoom' ? this.target.id : undefined,
      bookingReference: `VS-${Date.now()}`
    };

    this.paymentService.createPreference(req).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const targetUrl = res.initPoint || res.sandboxInitPoint;
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.onWhatsAppPay();
      }
    });
  }

  onWhatsAppPay(): void {
    const formVal = this.payerForm.value;
    const depositAmount = this.getPayableAmount();
    const totalAmount = this.calculateTotal();

    const text = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\n` +
      `Deseo coordinar el pago de la *Seña de Reserva (50%)*:\n` +
      `📌 *Ítem:* ${this.target.title} (${this.target.type === 'Tour' ? 'Tour' : 'Hotel Punto Clave'})\n` +
      `👤 *Cliente:* ${formVal.name || 'Viajero'}\n` +
      `📱 *Teléfono:* ${formVal.phone || ''}\n` +
      `📅 *Fecha:* ${formVal.travelDate || 'Por coordinar'}\n` +
      `🔢 *Cantidad:* ${formVal.quantity || 1} ${this.target.type === 'Tour' ? 'persona(s)' : 'noche(s)'}\n` +
      `💰 *Total del Servicio:* S/ ${totalAmount} PEN\n` +
      `💳 *Seña a Pagar Hoy (50%):* S/ ${depositAmount} PEN\n` +
      `💵 *Saldo al Llegar (50%):* S/ ${depositAmount} PEN\n\n` +
      `Por favor indíquenme las cuentas bancarias o enlace de pago para abonar la seña y confirmar mi cupo.`
    );
    window.open(`https://wa.me/${this.whatsAppNumber}?text=${text}`, '_blank');
  }

  onClose(): void {
    this.close.emit();
  }
}
