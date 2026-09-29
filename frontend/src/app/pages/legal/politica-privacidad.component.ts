import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-politica-privacidad',
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
          <span class="legal-tag">Privacidad & Seguridad Digital</span>
          <h1>Política de Privacidad y Protección de Datos Personales</h1>
          <p class="hero-sub">Conforme a la Ley N° 29733 de la República del Perú y su Reglamento D.S. N° 003-2013-JUS</p>
        </div>
      </header>

      <main class="container legal-body">
        <div class="legal-card">
          <div class="meta-banner">
            <app-icon name="shield" [size]="20" stroke="var(--forest-600)"></app-icon>
            <div>
              <strong>Compromiso con la Confidencialidad y el Uso Ético de sus Datos</strong><br>
              <span>Valle del Sondondo Expeditions garantiza que sus datos personales son tratados con estrictas medidas de seguridad y confidencialidad.</span>
            </div>
          </div>

          <section class="legal-section">
            <h2>1. Identidad del Titular del Banco de Datos</h2>
            <p>
              El titular y responsable del tratamiento del banco de datos personales es <strong>Valle del Sondondo Expeditions</strong>, con domicilio en Av. Apu Chauccalla 402, distrito de Aucará, provincia de Lucanas, departamento de Ayacucho, Perú.
            </p>
            <p>
              Correo electrónico de contacto para temas de privacidad: <code>miskichaskaperu@hotmail.com</code>.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Información que Recopilamos</h2>
            <p>Recopilamos los datos estrictamente indispensables para la formalización y ejecución segura de sus servicios turísticos:</p>
            <ul>
              <li><strong>Datos de Identificación:</strong> Nombres, apellidos, tipo y número de documento (DNI, Pasaporte, CE), nacionalidad y fecha de nacimiento.</li>
              <li><strong>Datos de Contacto:</strong> Número de teléfono celular / WhatsApp, dirección de correo electrónico y ciudad de residencia.</li>
              <li><strong>Datos de Salud y Emergencia (Opcional/Sensible):</strong> Restricciones alimenticias, condición física, alergias severas o número de contacto de un familiar directo para contingencias en montaña.</li>
              <li><strong>Datos de Transacción:</strong> Referencia de pago, fecha, monto y comprobante electrónico emitido (no almacenamos números de tarjetas de crédito o débito; estos son procesados directamente por la infraestructura certificada PCI-DSS de Mercado Pago).</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Finalidades del Tratamiento de Datos</h2>
            <p>Sus datos personales son utilizados exclusivamente para:</p>
            <ul>
              <li>Procesar, confirmar y gestionar sus reservas de tours, expediciones y alojamiento en Hospedaje Casa Grande.</li>
              <li>Emisión obligatoria de comprobantes de pago electrónicos conforme a las disposiciones de la SUNAT.</li>
              <li>Elaboración de manifiestos de pasajeros y padrones de control exigidos por el SERNANP (Reserva Nacional Pampa Galeras Bárbara D'Achille) y la Policía de Turismo.</li>
              <li>Atención directa mediante canales de soporte oficial (WhatsApp y correo electrónico).</li>
              <li>Atención de quejas o reclamos a través del Libro de Reclamaciones Virtual.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Transferencia y Destinatarios de los Datos</h2>
            <p>
              La Agencia <strong>no vende, arrienda ni comercializa</strong> sus datos personales con terceras partes para fines publicitarios ajenos. Solo se podrán transferir datos a:
            </p>
            <ul>
              <li>Comunidades campesinas locales, arrieros y guías oficiales que operen directamente su ruta de expedición.</li>
              <li>Pasarela de pagos en línea (Mercado Pago) para la liquidación segura de transacciones.</li>
              <li>Autoridades sanitarias, policiales o de rescate exclusivamente en situaciones de emergencia médica o desastre natural en ruta.</li>
              <li>Autoridades judiciales o administrativas peruanas (SUNAT, Mincetur, PNP, INDECOPI) en cumplimiento de obligaciones legales expresas.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Ejercicio de Derechos ARCO</h2>
            <p>
              De conformidad con la Ley N° 29733, usted tiene derecho a ejercer en cualquier momento sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> respecto de su información personal.
            </p>
            <p>
              Para ejercer cualquiera de estos derechos, basta enviar una solicitud escrita al correo <code>miskichaskaperu@hotmail.com</code> adjuntando copia legible de su DNI o Pasaporte, indicando en el asunto "Solicitud Derechos ARCO - [Su Nombre]". Su solicitud será atendida en los plazos legales establecidos.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Seguridad y Almacenamiento</h2>
            <p>
              Implementamos medidas técnicas, organizativas y legales para evitar la alteración, pérdida o acceso no autorizado a su información. La transmisión de datos en nuestro portal web se encuentra cifrada de extremo a extremo mediante certificados SSL / TLS (HTTPS).
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
      color: #10B981;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .legal-hero h1 {
      font-family: var(--font-display, serif);
      font-size: 2.2rem;
      line-height: 1.25;
      margin-bottom: 0.75rem;
    }
    .hero-sub {
      color: #A8A29E;
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
      background: #ECFDF5;
      border-left: 4px solid #10B981;
      border-radius: 0.5rem;
      font-size: 0.88rem;
      color: #065F46;
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
export class PoliticaPrivacidadComponent {}
