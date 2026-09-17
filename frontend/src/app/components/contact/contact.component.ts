import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TourService } from '../../services/tour.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  template: `
    <section class="contact-section" id="contacto">
      <div class="container">
        <div class="section-title-wrap">
          <span class="section-tag">Estamos Para Ayudarte</span>
          <h2 class="section-title">¿Listo para Conocer el Valle del Sondondo?</h2>
          <p class="section-subtitle">
            Escríbenos para resolver tus dudas sobre traslados, temporadas de avistamiento de cóndores o reservas para grupos y familias.
          </p>
        </div>

        <div class="contact-layout">
          <!-- Info Column -->
          <div class="contact-info-col">
            <div class="info-card glass-card">
              <h3 class="info-title">Sede y Punto de Partida</h3>
              
              <div class="info-row">
                <div class="info-icon">
                  <app-icon name="map-pin" [size]="20" stroke="var(--primary)"></app-icon>
                </div>
                <div>
                  <strong>Dirección Central:</strong>
                  <p>{{ address }}</p>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon">
                  <app-icon name="phone" [size]="20" stroke="var(--primary)"></app-icon>
                </div>
                <div>
                  <strong>Teléfono Oficial:</strong>
                  <p><a [href]="'tel:' + phoneNumber">{{ phoneNumber }}</a></p>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon">
                  <app-icon name="mail" [size]="20" stroke="var(--primary)"></app-icon>
                </div>
                <div>
                  <strong>Correo Electrónico:</strong>
                  <p><a [href]="'mailto:' + email">{{ email }}</a></p>
                </div>
              </div>

              <div class="info-row">
                <div class="info-icon">
                  <app-icon name="clock" [size]="20" stroke="var(--primary)"></app-icon>
                </div>
                <div>
                  <strong>Horario de Atención:</strong>
                  <p>Lunes a Domingo: 7:00 AM – 9:00 PM</p>
                </div>
              </div>

              <!-- WhatsApp Quick Action Box -->
              <div class="wa-action-box">
                <div class="wa-box-header">
                  <app-icon name="whatsapp" [size]="24" stroke="#25D366"></app-icon>
                  <div>
                    <div class="wa-box-title">¿Respuesta Inmediata?</div>
                    <div class="wa-box-sub">Chatea con nuestro equipo de Aucará</div>
                  </div>
                </div>
                <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp w-100">
                  <app-icon name="whatsapp" [size]="18" stroke="#FFFFFF"></app-icon>
                  <span>Abrir WhatsApp (+51)</span>
                </a>
              </div>
            </div>

            <!-- How to Get There Quick Guide -->
            <div class="how-to-arrive-box">
              <h4>¿Cómo llegar al Valle del Sondondo?</h4>
              <p>
                <strong>Desde Lima:</strong> Vía Panamericana Sur hasta Nasca y luego carretera Interoceánica hacia Puquio (6 a 7 hrs en bus/auto).
              </p>
              <p class="mt-1">
                <strong>Desde Puquio:</strong> Servicio de colectivos y vans turísticas hacia Aucará, Cabana Sur y Andamarca (1.5 a 2.5 hrs).
              </p>
            </div>
          </div>

          <!-- Contact Form Column -->
          <div class="contact-form-col">
            <div class="form-wrapper glass-card">
              <h3 class="form-title">Envíanos un Mensaje</h3>
              <p class="form-desc">Te responderemos a tu correo o WhatsApp en menos de 2 horas.</p>

              @if (isSent()) {
                <div class="alert-success">
                  <app-icon name="check" [size]="24" stroke="#1B5E20"></app-icon>
                  <div>
                    <strong>¡Mensaje Enviado con Éxito!</strong>
                    <p>Muchas gracias por contactar a Valle del Sondondo Expeditions. Nos comunicaremos contigo pronto.</p>
                  </div>
                </div>
              } @else {
                <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
                  <div class="form-group">
                    <label for="c-name">Nombre Completo *</label>
                    <input 
                      id="c-name" 
                      type="text" 
                      formControlName="name" 
                      placeholder="Tu nombre y apellido" 
                      class="form-control" />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="c-email">Correo Electrónico *</label>
                      <input 
                        id="c-email" 
                        type="email" 
                        formControlName="email" 
                        placeholder="tu@correo.com" 
                        class="form-control" />
                    </div>

                    <div class="form-group">
                      <label for="c-phone">Teléfono / WhatsApp</label>
                      <input 
                        id="c-phone" 
                        type="tel" 
                        formControlName="phone" 
                        placeholder="+51 9XX XXX XXX" 
                        class="form-control" />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="c-subject">Asunto *</label>
                    <input 
                      id="c-subject" 
                      type="text" 
                      formControlName="subject" 
                      placeholder="Ej. Consulta sobre ruta del cóndor en julio" 
                      class="form-control" />
                  </div>

                  <div class="form-group">
                    <label for="c-message">Mensaje *</label>
                    <textarea 
                      id="c-message" 
                      rows="4" 
                      formControlName="message" 
                      placeholder="Cuéntanos cuántas personas viajan, fechas estimadas o cualquier consulta..." 
                      class="form-control"></textarea>
                  </div>

                  <button 
                    type="submit" 
                    [disabled]="contactForm.invalid || isSending()" 
                    class="btn btn-primary w-100 mt-2">
                    @if (isSending()) {
                      <span>Enviando mensaje...</span>
                    } @else {
                      <app-icon name="mail" [size]="18" stroke="#FFFFFF"></app-icon>
                      <span>Enviar Consulta</span>
                    }
                  </button>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .contact-section {
      padding: 6rem 0;
      background: var(--earth-100);
    }

    .contact-layout {
      display: grid;
      grid-template-columns: 1fr 1.3fr;
      gap: 2.5rem;
      align-items: flex-start;
    }

    .info-card {
      padding: 2.5rem;
      background: #FFFFFF;
      margin-bottom: 1.5rem;
    }

    .info-title {
      font-size: 1.35rem;
      color: var(--night-900);
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--primary);
      display: inline-block;
    }

    .info-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      align-items: flex-start;
    }

    .info-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(192, 57, 43, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-row strong {
      display: block;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #7D8898;
    }

    .info-row p, .info-row a {
      font-size: 0.95rem;
      color: var(--night-900);
      font-weight: 500;
    }

    .info-row a:hover {
      color: var(--primary);
    }

    .wa-action-box {
      margin-top: 2rem;
      padding: 1.25rem;
      border-radius: var(--radius-md);
      background: rgba(37, 211, 102, 0.08);
      border: 1px solid rgba(37, 211, 102, 0.25);
    }

    .wa-box-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .wa-box-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--night-900);
    }

    .wa-box-sub {
      font-size: 0.78rem;
      color: var(--earth-700);
    }

    .how-to-arrive-box {
      padding: 1.75rem;
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-light);
    }

    .how-to-arrive-box h4 {
      font-size: 1.05rem;
      margin-bottom: 0.75rem;
      color: var(--night-900);
    }

    .how-to-arrive-box p {
      font-size: 0.85rem;
      line-height: 1.55;
      color: var(--earth-700);
    }

    .form-wrapper {
      padding: 2.5rem;
      background: #FFFFFF;
    }

    .form-title {
      font-size: 1.5rem;
      color: var(--night-900);
      margin-bottom: 0.35rem;
    }

    .form-desc {
      font-size: 0.9rem;
      color: var(--earth-700);
      margin-bottom: 1.75rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1.1rem;
    }

    label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--night-900);
      margin-bottom: 0.35rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1.5px solid var(--earth-200);
      border-radius: 10px;
      background: var(--earth-50);
      font-size: 0.92rem;
      transition: var(--transition-smooth);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1);
    }

    .w-100 { width: 100%; }
    .mt-1 { margin-top: 0.5rem; }
    .mt-2 { margin-top: 1rem; }

    .alert-success {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: #E8F5E9;
      border: 1px solid #A5D6A7;
      border-radius: var(--radius-md);
      color: #1B5E20;
    }

    @media (max-width: 992px) {
      .contact-layout {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 600px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      .form-wrapper, .info-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class ContactSectionComponent {
  private fb = inject(FormBuilder);
  private tourService = inject(TourService);

  @Input() address: string = 'Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú';
  @Input() phoneNumber: string = '+51 966 380 590';
  @Input() email: string = 'miskichaskaperu@hotmail.com';
  @Input() whatsAppNumber: string = '51966380590';

  contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  isSending = signal(false);
  isSent = signal(false);

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola Valle del Sondondo Expeditions! Quisiera información y asistencia para viajar a Sondondo.');
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
