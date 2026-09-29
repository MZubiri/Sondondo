import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-terminos-condiciones',
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
          <span class="legal-tag">Marco Regulatorio & Operativo</span>
          <h1>Términos y Condiciones Generales</h1>
          <p class="hero-sub">Vigente para expediciones, circuitos turísticos y reservas de hospedaje</p>
        </div>
      </header>

      <main class="container legal-body">
        <div class="legal-card">
          <div class="meta-banner">
            <app-icon name="info" [size]="20" stroke="var(--clay-500)"></app-icon>
            <div>
              <strong>Valle del Sondondo Expeditions & Hospedaje Casa Grande</strong><br>
              <span>Domicilio Legal: Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú | RUC: Operador Turístico Local Formalizado</span>
            </div>
          </div>

          <section class="legal-section">
            <h2>1. Ámbito de Aplicación y Aceptación</h2>
            <p>
              Los presentes Términos y Condiciones regulan la contratación de servicios turísticos, paquetes de expedición, traslados y servicios de alojamiento prestados por <strong>Valle del Sondondo Expeditions</strong> (en adelante, la "Agencia") y el <strong>Hospedaje Casa Grande</strong> a través de este portal web, canales de mensajería (WhatsApp) o de manera presencial.
            </p>
            <p>
              La solicitud de reserva, el pago de anticipos o la confirmación de cualquier servicio implica la aceptación total e irrestricta de las presentes cláusulas por parte del cliente y de todos los integrantes del grupo de viaje.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Condiciones de Reserva y Confirmación de Pago</h2>
            <ul>
              <li><strong>Reserva y Cupos:</strong> Toda reserva de tour o habitación se considera confirmada una vez recibido y verificado el pago del depósito inicial correspondiente (mínimo el 50% del valor total presupuestado).</li>
              <li><strong>Saldo Pendiente:</strong> El 50% restante deberá ser cancelado a más tardar 48 horas antes del inicio del itinerario o al momento del check-in presencial en Aucará mediante efectivo, transferencia bancaria nacional o pasarela digital.</li>
              <li><strong>Precios y Tarifas:</strong> Las tarifas se expresan en Soles Peruanos (PEN) y Dólares Estadounidenses (USD). Los precios incluyen los conceptos especificados en la ficha técnica de cada tour (transporte local, guiado certificado, alimentación programada y tickets locales según corresponda).</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>3. Requisitos y Obligaciones del Viajero</h2>
            <ul>
              <li><strong>Identificación Oficial:</strong> Todo pasajero debe portar su Documento Nacional de Identidad (DNI) físico vigente, Pasaporte o Carné de Extranjería. Para menores de edad no acompañados por ambos progenitores, se requiere autorización notarial de viaje según la normativa peruana.</li>
              <li><strong>Condición Médica y Altura:</strong> Las expediciones en el Valle del Sondondo y la Reserva de Pampa Galeras se desarrollan a altitudes entre los 3,200 y más de 4,200 msnm. El viajero declara encontrarse en condiciones de salud aptas para caminatas en altura y no presentar contraindicaciones cardiorrespiratorias severas no controladas.</li>
              <li><strong>Información Previa:</strong> Es deber del cliente informar con anterioridad a la partida sobre restricciones alimentarias, alergias, dolencias crónicas o medicamentos requeridos.</li>
              <li><strong>Seguro de Asistencia al Viajero:</strong> Se recomienda encarecidamente contar con un seguro privado de asistencia médica y accidentes durante la práctica de turismo de aventura.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Respeto al Patrimonio Arqueológico, Natural y Comunal</h2>
            <p>
              El Valle del Sondondo es un paisaje cultural vivo y milenario caracterizado por andenes prehispánicos, cañones protegidos y hábitats del Cóndor Andino y la Vicuña:
            </p>
            <ul>
              <li>Queda estrictamente prohibido dañar, extraer o alterar restos líticos, andenerías, flora endémica o perturbar la fauna silvestre.</li>
              <li>El viajero se compromete a respetar las normas de convivencia comunitaria de Aucará, Cabana, Andamarca y Chipao, solicitando autorización antes de fotografiar festividades rituales si así lo indican los guías locales.</li>
              <li>Toda la basura generada durante los trekkings debe retornar con el viajero (política "No Deje Rastro").</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>5. Circunstancias de Fuerza Mayor y Modificaciones de Ruta</h2>
            <p>
              Por tratarse de expediciones en geografía andina de alta montaña, la Agencia se reserva el derecho de modificar rutas, horarios o alternar puntos de visita en resguardo absoluto de la seguridad física de los pasajeros ante:
            </p>
            <ul>
              <li>Lluvias torrenciales, derrumbes, huaycos o crecidas fluviales imprevistas.</li>
              <li>Bloqueos de carretera, huelgas o paros convocados por gremios ajenos a la empresa.</li>
              <li>Disposiciones emitidas por el SERNANP, Ministerio de Cultura, Policía Nacional o Gobiernos Regionales.</li>
            </ul>
            <p>
              En tales eventos extraordinarios, la Agencia brindará las mejores alternativas de continuidad o reprogramación conforme a nuestra <a routerLink="/politica-de-cancelacion">Política de Cancelación</a>.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Jurisdicción y Marco Legal Aplicable</h2>
            <p>
              Para cualquier controversia derivada de la interpretación o ejecución de los servicios, las partes se someten a la legislación de la República del Perú y a la competencia de los jueces y tribunales de la provincia de Lucanas - Puquio / Ayacucho, sin perjuicio de los mecanismos de resolución del INDECOPI.
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
      font-family: var(--font-display, serif);
      font-size: 2.3rem;
      line-height: 1.2;
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
      background: #FFFBEB;
      border-left: 4px solid #D97706;
      border-radius: 0.5rem;
      font-size: 0.88rem;
      color: #78350F;
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
    .legal-section a {
      color: #C05621;
      text-decoration: underline;
      font-weight: 600;
    }
    @media (max-width: 768px) {
      .legal-card {
        padding: 1.75rem 1.25rem;
      }
      .legal-hero h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class TerminosCondicionesComponent {}
