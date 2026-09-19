import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourService } from '../../services/tour.service';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <section class="contact-section" id="contacto">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-tag">{{ ts.t('contact.badge') }}</span>
          <h2 class="section-title">{{ ts.t('contact.title') }}</h2>
          <p class="section-subtitle">
            {{ ts.t('contact.subtitle') }}
          </p>
        </div>

        <div class="contact-layout">
          <!-- Info Column -->
          <div class="contact-info-panel">
            <h3 class="panel-heading">{{ ts.t('contact.officialHeader') }}</h3>

            <!-- WhatsApp Direct Card -->
            <div class="wa-direct-card">
              <div class="wa-header">
                <app-icon name="whatsapp" [size]="24" stroke="var(--whatsapp)"></app-icon>
                <div>
                  <strong>{{ ts.t('contact.waCardTitle') }}</strong>
                  <p>{{ ts.t('contact.waCardSubtitle') }}</p>
                </div>
              </div>
              <a 
                [href]="whatsAppUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-whatsapp wa-btn">
                <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
                <span>{{ ts.t('contact.waChatBtn') }}</span>
              </a>
            </div>

            <!-- Detail List -->
            <div class="contact-details-list">
              <div class="detail-row">
                <span class="detail-label">{{ ts.t('contact.zoneLabel') }}</span>
                <span class="detail-val">{{ ts.t('contact.zoneValue') }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{ ts.t('contact.hoursLabel') }}</span>
                <span class="detail-val">{{ ts.t('contact.hoursValue') }}</span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{ ts.t('contact.phoneDirect') }}</span>
                <span class="detail-val"><a [href]="'tel:' + phoneNumber">{{ phoneNumber }}</a></span>
              </div>

              <div class="detail-row">
                <span class="detail-label">{{ ts.t('contact.emailDirect') }}</span>
                <span class="detail-val"><a [href]="'mailto:' + email">{{ email }}</a></span>
              </div>
            </div>
          </div>

          <!-- Form Column -->
          <div class="contact-form-panel">
            <h3 class="panel-heading">{{ ts.t('contact.formHeader') }}</h3>

            @if (isSent()) {
              <div class="alert-success">
                <app-icon name="check" [size]="22" stroke="var(--forest-900)"></app-icon>
                <div>
                  <strong>{{ ts.t('contact.sentTitle') }}</strong>
                  <p>{{ ts.t('contact.sentDesc') }}</p>
                </div>
              </div>
            } @else {
              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
                <div class="form-field">
                  <label for="c-name">{{ ts.t('contact.name') }}</label>
                  <input 
                    id="c-name" 
                    type="text" 
                    formControlName="name" 
                    [placeholder]="ts.t('contact.namePlaceholder')" 
                    class="input-control" />
                </div>

                <div class="form-row">
                  <div class="form-field">
                    <label for="c-phone">{{ ts.t('contact.phone') }}</label>
                    <input 
                      id="c-phone" 
                      type="tel" 
                      formControlName="phone" 
                      [placeholder]="ts.t('contact.phonePlaceholder')" 
                      class="input-control" />
                  </div>

                  <div class="form-field">
                    <label for="c-email">{{ ts.t('contact.email') }}</label>
                    <input 
                      id="c-email" 
                      type="email" 
                      formControlName="email" 
                      [placeholder]="ts.t('contact.emailPlaceholder')" 
                      class="input-control" />
                  </div>
                </div>

                <div class="form-field">
                  <label for="c-subject">{{ ts.t('contact.tourInterest') }}</label>
                  <select id="c-subject" formControlName="subject" class="input-control">
                    <option value="">{{ ts.t('contact.tourSelect') }}</option>
                    <option value="Kuntur Ñan: El Vuelo del Cóndor en Mayobamba">Kuntur Ñan: El Vuelo del Cóndor en Mayobamba</option>
                    <option value="Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras">Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras</option>
                    <option value="Minivolcanes de Pachapupum & Termas Medicinales">Minivolcanes de Pachapupum & Termas Medicinales</option>
                    <option value="Trek Pampa Galeras & Bofedales del Apu Qarhuarazo">Trek Pampa Galeras & Bofedales del Apu Qarhuarazo</option>
                    <option value="Ruta de los Pueblos Mágicos: Aucará, Cabana Sur & Chipao">Ruta de los Pueblos Mágicos: Aucará, Cabana Sur & Chipao</option>
                    <option value="Gran Travesía Valle del Sondondo (3 Días / 2 Noches)">Gran Travesía Valle del Sondondo (3 Días / 2 Noches)</option>
                    <option value="Consulta General">{{ ts.t('contact.tourGeneral') }}</option>
                  </select>
                </div>

                <div class="form-field">
                  <label for="c-message">{{ ts.t('contact.message') }}</label>
                  <textarea 
                    id="c-message" 
                    rows="4" 
                    formControlName="message" 
                    [placeholder]="ts.t('contact.messagePlaceholder')" 
                    class="input-control"></textarea>
                </div>

                <button 
                  type="submit" 
                  [disabled]="contactForm.invalid || isSending()" 
                  class="btn btn-primary submit-btn">
                  @if (isSending()) {
                    <span>{{ ts.t('contact.sending') }}</span>
                  } @else {
                    <span>{{ ts.t('contact.send') }}</span>
                  }
                </button>
              </form>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-section {
      padding: 6rem 0;
      background: #FFFFFF;
      border-top: 1px solid var(--border-light);
    }

    .contact-layout {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 3.5rem;
      align-items: flex-start;
    }

    .panel-heading {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 1.5rem;
    }

    /* Tarjeta WhatsApp Directo */
    .wa-direct-card {
      background: var(--forest-50);
      border: 1px solid rgba(27, 53, 39, 0.15);
      border-radius: var(--radius-sm);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .wa-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.25rem;
    }

    .wa-header strong {
      display: block;
      font-size: 0.98rem;
      color: var(--earth-950);
    }

    .wa-header p {
      font-size: 0.82rem;
      color: var(--earth-700);
      margin: 0;
    }

    .wa-btn {
      width: 100%;
    }

    /* Lista de Detalles de Contacto */
    .contact-details-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-light);
    }

    .detail-label {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--earth-500);
    }

    .detail-val {
      font-size: 0.95rem;
      color: var(--earth-900);
      font-weight: 500;
    }

    .detail-val a:hover {
      color: var(--forest-900);
      text-decoration: underline;
    }

    /* Formulario */
    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--earth-900);
    }

    .input-control {
      width: 100%;
      min-height: 44px;
      padding: 0.65rem 0.95rem;
      border: 1px solid var(--earth-200);
      border-radius: var(--radius-sm);
      background: var(--cream-50);
      font-size: 0.92rem;
      color: var(--earth-900);
      transition: var(--transition);
    }

    .input-control:focus {
      outline: none;
      background: #FFFFFF;
      border-color: var(--forest-900);
      box-shadow: 0 0 0 2px rgba(27, 53, 39, 0.1);
    }

    textarea.input-control {
      min-height: 100px;
      resize: vertical;
    }

    .submit-btn {
      min-height: 48px;
      font-size: 1rem;
      margin-top: 0.5rem;
    }

    .alert-success {
      display: flex;
      gap: 0.85rem;
      padding: 1.5rem;
      background: var(--forest-50);
      border: 1px solid rgba(27, 53, 39, 0.2);
      border-radius: var(--radius-sm);
      color: var(--forest-900);
    }

    .alert-success strong {
      display: block;
      margin-bottom: 0.25rem;
    }

    .alert-success p {
      font-size: 0.9rem;
      color: var(--forest-900);
    }

    @media (max-width: 992px) {
      .contact-layout {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactSectionComponent {
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);
  public ts = inject(TranslationService);

  @Input() address: string = 'Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú';
  @Input() phoneNumber: string = '+51 966 380 590';
  @Input() email: string = 'miskichaskaperu@hotmail.com';
  @Input() whatsAppNumber: string = '51966380590';

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    subject: [''],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  isSending = signal(false);
  isSent = signal(false);

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola! Me comunico desde el sitio web para solicitar información y tarifas de los recorridos guiados.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSending.set(true);
    this.tourService.sendContactMessage(this.contactForm.value).subscribe({
      next: () => {
        this.isSending.set(false);
        this.isSent.set(true);
      },
      error: () => {
        this.isSending.set(false);
        this.isSent.set(true);
      }
    });
  }
}
