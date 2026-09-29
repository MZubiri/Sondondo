import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-politica-cancelacion',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="legal-page">
      <header class="legal-hero">
        <div class="container hero-content">
          <a routerLink="/" class="back-link">
            <app-icon name="arrow-left" [size]="18"></app-icon>
            <span>Volver al Inicio</span>
          </a>
          <span class="legal-tag">Garantías & Transparencia</span>
          <h1>Políticas de Cancelación, Reembolso y Reprogramación</h1>
          <p class="hero-sub">Términos claros para tours, expediciones y hospedaje en Casa Grande</p>
        </div>
      </header>

      <main class="container legal-body">
        <div class="legal-card">
          <div class="meta-banner">
            <app-icon name="info" [size]="20" stroke="var(--clay-500)"></app-icon>
            <div>
              <strong>Políticas claras y justas para viajeros y comunidades locales</strong><br>
              <span>Nuestras expediciones involucran coordinación previa con guías locales, comunidades campesinas, arrieros y transporte especializado en Lucanas.</span>
            </div>
          </div>

          <section class="legal-section">
            <h2>1. Cancelaciones de Tours por Decisión del Pasajero</h2>
            <p>
              Toda solicitud de anulación o desistimiento voluntario debe ser comunicada por escrito mediante correo electrónico a <code>miskichaskaperu@hotmail.com</code> o al WhatsApp oficial de reservas (+51 966 380 590).
            </p>
            
            <div class="refund-table-wrap">
              <table class="refund-table">
                <thead>
                  <tr>
                    <th>Plazo de Notificación Previa al Tour</th>
                    <th>Porcentaje de Reembolso</th>
                    <th>Condiciones Aplicables</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Más de 15 días calendario</strong></td>
                    <td><span class="badge success">80% de Reembolso</span></td>
                    <td>Se retiene un 20% por concepto de gastos administrativos, emisión y reserva inicial.</td>
                  </tr>
                  <tr>
                    <td><strong>Entre 14 y 7 días calendario</strong></td>
                    <td><span class="badge warning">50% de Reembolso</span></td>
                    <td>Compensación por bloqueo de cupos de guías locales y transporte asignado.</td>
                  </tr>
                  <tr>
                    <td><strong>Menos de 7 días / No Show (No presentación)</strong></td>
                    <td><span class="badge danger">0% de Reembolso</span></td>
                    <td>El viaje se considera consumido debido a que la logística comunal ya se encuentra liquidada.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="legal-section">
            <h2>2. Política de Reprogramación Flexible</h2>
            <p>
              Comprendemos que imprevistos personales pueden surgir antes de su viaje a los Andes:
            </p>
            <ul>
              <li><strong>Plazo para solicitar reprogramación:</strong> El cliente puede solicitar el cambio de fecha de su expedición con un mínimo de <strong>5 días de anticipación</strong> a la fecha original del tour.</li>
              <li><strong>Costo:</strong> La primera reprogramación no genera costo administrativo adicional, sujeta a disponibilidad de cupos y temporadas operativas.</li>
              <li><strong>Vigencia:</strong> El saldo a favor podrá ser utilizado dentro de un plazo máximo de <strong>12 meses calendario</strong> a partir de la fecha pactada originalmente.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Cancelaciones de Hospedaje Casa Grande (Aucará)</h2>
            <ul>
              <li><strong>Hasta 48 horas antes del Check-in (14:00 hrs):</strong> Cancelación 100% gratuita con reembolso íntegro o crédito para estadía futura.</li>
              <li><strong>Menos de 48 horas antes del Check-in:</strong> Se cobrará el valor equivalente a la primera noche de alojamiento reservada en concepto de penalidad ("No Show").</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Cancelaciones por Fuerza Mayor o Factores Climáticos</h2>
            <p>
              En caso de que una expedición deba ser suspendida por fenómenos meteorológicos severos (huaicos, lluvias torrenciales extraordinarias), cierres de carreteras nacionales decretados por el MTC o emergencias sanitarias/sociales ajenas a ambas partes:
            </p>
            <ul>
              <li>Se ofrecerá de forma prioritaria la <strong>reprogramación integral sin penalidad</strong> en una fecha alternativa elegida por el viajero.</li>
              <li>Si el viajero no pudiera reprogramar su viaje, se emitirá una <strong>Nota de Crédito o Voucher Turístico 100% transferible</strong> a terceras personas con validez de 1 año.</li>
              <li>En caso de requerir devolución dineraria, se reembolsará el 100% deducidos únicamente los costos directos de servicios no recuperables efectivamente ya erogados a comunidades locales o comisiones bancarias de pasarela de pago.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Procedimiento y Tiempos de Reembolso</h2>
            <p>
              Los reembolsos aprobados se procesarán por el mismo medio de pago utilizado en la transacción original (transferencia bancaria nacional o reversión a través de la pasarela de pago Mercado Pago). El tiempo estimado de acreditación es de <strong>7 a 15 días hábiles</strong>, dependiendo de la entidad financiera emisora de la tarjeta del cliente.
            </p>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .legal-page {
      background: var(--bg-primary, #FAF7F2);
      min-height: 100vh;
      padding-bottom: 5rem;
    }
    .legal-hero {
      background: linear-gradient(135deg, #1C1917 0%, #292524 100%);
      color: #FFFFFF;
      padding: 4.5rem 0 3.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hero-content {
      max-width: 860px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #E7E5E4;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      transition: color 0.2s ease;
    }
    .back-link:hover {
      color: var(--accent-clay, #C05621);
    }
    .legal-tag {
      display: inline-block;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #D97706;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .legal-hero h1 {
      color: #FFFFFF !important;
      font-family: var(--font-display, serif);
      font-size: 2.2rem;
      line-height: 1.25;
      margin-bottom: 0.75rem;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }
    .hero-sub {
      color: #E2E8F0;
      font-size: 1.05rem;
    }
    .legal-body {
      max-width: 860px;
      margin-top: -2rem;
    }
    .legal-card {
      background: #FFFFFF;
      border-radius: 1rem;
      padding: 2.75rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      border: 1px solid #E7E5E4;
    }
    .meta-banner {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: #EFF6FF;
      border-left: 4px solid #3B82F6;
      border-radius: 0.5rem;
      font-size: 0.88rem;
      color: #1E3A8A;
      margin-bottom: 2.5rem;
      line-height: 1.5;
    }
    .legal-section {
      margin-bottom: 2.25rem;
    }
    .legal-section h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1C1917;
      margin-bottom: 0.85rem;
      padding-bottom: 0.4rem;
      border-bottom: 1px solid #F5F5F4;
    }
    .legal-section p {
      font-size: 0.95rem;
      line-height: 1.7;
      color: #44403C;
      margin-bottom: 0.85rem;
    }
    .legal-section ul {
      padding-left: 1.5rem;
      font-size: 0.95rem;
      line-height: 1.65;
      color: #44403C;
    }
    .legal-section li {
      margin-bottom: 0.6rem;
    }
    .refund-table-wrap {
      overflow-x: auto;
      margin: 1.5rem 0;
    }
    .refund-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    .refund-table th, .refund-table td {
      border: 1px solid #E7E5E4;
      padding: 0.85rem 1rem;
      text-align: left;
    }
    .refund-table th {
      background: #F5F5F4;
      color: #1C1917;
      font-weight: 700;
    }
    .badge {
      display: inline-block;
      padding: 0.35rem 0.65rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .badge.success { background: #DCFCE7; color: #166534; }
    .badge.warning { background: #FEF3C7; color: #92400E; }
    .badge.danger { background: #FEE2E2; color: #991B1B; }

    @media (max-width: 768px) {
      .legal-card {
        padding: 1.75rem 1.25rem;
      }
      .legal-hero h1 {
        font-size: 1.7rem;
      }
    }
  `]
})
export class PoliticaCancelacionComponent {}
