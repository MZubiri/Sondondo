import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';
import { TranslationService } from '../../services/translation.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment-status',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <main class="payment-result-page">
      <div class="container">
        <div class="result-card glass-card">
          <!-- Approved State -->
          @if (status() === 'approved') {
            <div class="status-icon success-icon">
              <app-icon name="check" [size]="36" stroke="#27AE60"></app-icon>
            </div>
            <span class="status-badge success-badge">{{ ts.t('status.approvedBadge') }}</span>
            <h1 class="result-title">{{ ts.t('status.approvedTitle') }}</h1>
            <p class="result-text">
              {{ ts.t('status.approvedDesc') }}
            </p>

            <div class="receipt-box">
              <div class="receipt-line">
                <span>{{ ts.t('status.statusLabel') }}</span>
                <strong class="text-success">{{ ts.t('status.creditedVal') }}</strong>
              </div>
              @if (paymentId()) {
                <div class="receipt-line">
                  <span>{{ ts.t('status.paymentIdLabel') }}</span>
                  <strong>{{ paymentId() }}</strong>
                </div>
              }
              @if (externalReference()) {
                <div class="receipt-line">
                  <span>{{ ts.t('status.refCodeLabel') }}</span>
                  <strong>{{ externalReference() }}</strong>
                </div>
              }
              <div class="receipt-line">
                <span>{{ ts.t('status.dateLabel') }}</span>
                <span>{{ currentDate }}</span>
              </div>
            </div>

            <div class="result-actions">
              <a 
                [href]="whatsAppConfirmUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('status.sendWaReceipt') }}</span>
              </a>

              <a routerLink="/" class="btn btn-secondary w-100 mt-2">
                {{ ts.t('status.backHome') }}
              </a>
            </div>
          }

          <!-- Pending State -->
          @else if (status() === 'pending' || status() === 'in_process') {
            <div class="status-icon pending-icon">
              <app-icon name="clock" [size]="36" stroke="#D35400"></app-icon>
            </div>
            <span class="status-badge pending-badge">{{ ts.t('status.pendingBadge') }}</span>
            <h1 class="result-title">{{ ts.t('status.pendingTitle') }}</h1>
            <p class="result-text">
              {{ ts.t('status.pendingDesc') }}
            </p>

            @if (externalReference()) {
              <div class="receipt-box">
                <div class="receipt-line">
                  <span>{{ ts.t('status.refCodeLabel') }}</span>
                  <strong>{{ externalReference() }}</strong>
                </div>
              </div>
            }

            <div class="result-actions">
              <a 
                [href]="whatsAppConfirmUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('status.checkPendingWa') }}</span>
              </a>

              <a routerLink="/" class="btn btn-secondary w-100 mt-2">
                {{ ts.t('status.backHome') }}
              </a>
            </div>
          }

          <!-- Rejected or Cancelled State -->
          @else {
            <div class="status-icon error-icon">
              <app-icon name="x" [size]="36" stroke="#E74C3C"></app-icon>
            </div>
            <span class="status-badge error-badge">{{ ts.t('status.rejectedBadge') }}</span>
            <h1 class="result-title">{{ ts.t('status.rejectedTitle') }}</h1>
            <p class="result-text">
              {{ ts.t('status.rejectedDesc') }}
            </p>

            <div class="result-actions">
              <a 
                [href]="whatsAppHelpUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-whatsapp w-100">
                <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('status.helpWa') }}</span>
              </a>

              <a routerLink="/" class="btn btn-secondary w-100 mt-2">
                {{ ts.t('status.retryOrHome') }}
              </a>
            </div>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .payment-result-page {
      padding: 7rem 0 5rem 0;
      min-height: 80vh;
      display: flex;
      align-items: center;
      background: linear-gradient(180deg, #FAF8F5 0%, #F0ECE6 100%);
    }

    .result-card {
      max-width: 580px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 2.75rem 2rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(38, 31, 24, 0.08);
    }

    .status-icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.25rem auto;
    }

    .success-icon { background: #E8F8F5; }
    .pending-icon { background: #FEF9E7; }
    .error-icon { background: #FDEDEC; }

    .status-badge {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      display: inline-block;
      margin-bottom: 0.6rem;
    }

    .success-badge { background: #E8F8F5; color: #27AE60; }
    .pending-badge { background: #FEF9E7; color: #D35400; }
    .error-badge { background: #FDEDEC; color: #E74C3C; }

    .result-title {
      font-family: var(--font-display);
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--earth-950);
      margin-bottom: 0.75rem;
    }

    .result-text {
      font-size: 0.95rem;
      color: var(--earth-700);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .receipt-box {
      background: var(--cream-50);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 1.15rem;
      text-align: left;
      margin-bottom: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.88rem;
    }

    .receipt-line {
      display: flex;
      justify-content: space-between;
      color: var(--earth-800);
    }

    .text-success {
      color: #27AE60;
    }

    .result-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .w-100 { width: 100%; }
    .mt-2 { margin-top: 0.5rem; }
  `]
})
export class PaymentStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public ts = inject(TranslationService);

  status = signal<string>('approved');
  paymentId = signal<string | null>(null);
  externalReference = signal<string | null>(null);
  currentDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const qStatus = params['status'] || params['collection_status'];
      if (qStatus) {
        this.status.set(qStatus.toLowerCase());
      }
      this.paymentId.set(params['payment_id'] || params['collection_id'] || null);
      this.externalReference.set(params['external_reference'] || params['preference_id'] || null);
    });
  }

  get whatsAppConfirmUrl(): string {
    const text = encodeURIComponent(
      `¡Hola Valle del Sondondo Expeditions! 👋\n` +
      `Acabo de realizar mi pago con *Mercado Pago* para confirmar mi reserva.\n` +
      (this.paymentId() ? `💳 ID de Pago: *${this.paymentId()}*\n` : '') +
      (this.externalReference() ? `🔖 Ref: *${this.externalReference()}*\n` : '') +
      `Por favor confírmenme la recepción del comprobante. ¡Muchas gracias!`
    );
    return `https://wa.me/${environment.fallbackWhatsApp}?text=${text}`;
  }

  get whatsAppHelpUrl(): string {
    const text = encodeURIComponent(
      `¡Hola! Tuve una dificultad al intentar pagar con Mercado Pago en su web. ¿Podrían orientarme con un número de cuenta para Yape o transferencia directa?`
    );
    return `https://wa.me/${environment.fallbackWhatsApp}?text=${text}`;
  }
}
