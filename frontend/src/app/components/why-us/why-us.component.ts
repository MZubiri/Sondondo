import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-why-us',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="why-us-section" id="nosotros">
      <div class="container">
        <!-- Section Header -->
        <div class="section-title-wrap">
          <span class="section-tag">Nuestra Identidad</span>
          <h2 class="section-title">¿Por Qué Viajar con Valle del Sondondo Expeditions?</h2>
          <p class="section-subtitle">
            Somos nacidos en esta tierra. Compartimos contigo los secretos de nuestros ancestros con calidez, respeto y los más altos estándares de seguridad turística.
          </p>
        </div>

        <!-- Pillars Grid -->
        <div class="pillars-grid">
          <!-- Pillar 1 -->
          <div class="pillar-card">
            <div class="pillar-icon-box bg-emerald">
              <app-icon name="shield-check" [size]="28" stroke="#1B5E20"></app-icon>
            </div>
            <div class="pillar-badge-text">Certificación Oficial</div>
            <h3 class="pillar-title">Sello Safe Travels</h3>
            <p class="pillar-desc">
              Acreditados formalmente por el WTTC y la DIRCETUR. Garantizamos protocolos de viaje responsables, transparentes y seguros en todos nuestros circuitos.
            </p>
          </div>

          <!-- Pillar 2 -->
          <div class="pillar-card">
            <div class="pillar-icon-box bg-terracotta">
              <app-icon name="feather" [size]="28" stroke="var(--primary)"></app-icon>
            </div>
            <div class="pillar-badge-text">Raíces Profundas</div>
            <h3 class="pillar-title">Guías Nativos Quechuas</h3>
            <p class="pillar-desc">
              Nuestros guías son hijos del Valle del Sondondo. Te abrirán las puertas de los pueblos, dialogarás con los maestros de tijeras y conocerás la historia viva de los andenes.
            </p>
          </div>

          <!-- Pillar 3 -->
          <div class="pillar-card">
            <div class="pillar-icon-box bg-gold">
              <app-icon name="users" [size]="28" stroke="#B9770E"></app-icon>
            </div>
            <div class="pillar-badge-text">Impacto Social</div>
            <h3 class="pillar-title">Turismo Regenerativo</h3>
            <p class="pillar-desc">
              Tu visita dinamiza directamente a las familias campesinas, hospederías comunales y tejedoras tradicionales, protegiendo este Paisaje Cultural Vivo.
            </p>
          </div>

          <!-- Pillar 4 -->
          <div class="pillar-card">
            <div class="pillar-icon-box bg-blue">
              <app-icon name="mountain" [size]="28" stroke="#2980B9"></app-icon>
            </div>
            <div class="pillar-badge-text">Seguridad en Altura</div>
            <h3 class="pillar-title">Aclimatación y Oxígeno</h3>
            <p class="pillar-desc">
              Diseñamos itinerarios con progresión gradual de altitud. Todos nuestros traslados cuentan con pulsioxímetro, botiquín completo y balón de oxígeno medicinal.
            </p>
          </div>
        </div>

        <!-- Big Banner Promo / Quote -->
        <div class="quote-banner glass-card-dark">
          <div class="quote-content">
            <span class="quote-icon">“</span>
            <p class="quote-text">
              El Valle del Sondondo no es solo un destino, es una conexión viva con el corazón sagrado de los Andes peruanos.
            </p>
            <div class="quote-author">
              <strong>Equipo de Valle del Sondondo Expeditions</strong>
              <span>Aucará • Lucanas • Ayacucho</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .why-us-section {
      padding: 6rem 0;
      background: var(--earth-100);
      position: relative;
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 4rem;
    }

    .pillar-card {
      background: #FFFFFF;
      padding: 2.2rem 1.75rem;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-light);
      transition: var(--transition-smooth);
      display: flex;
      flex-direction: column;
    }

    .pillar-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
      border-color: rgba(192, 57, 43, 0.2);
    }

    .pillar-icon-box {
      width: 58px;
      height: 58px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .bg-emerald { background: #E8F5E9; }
    .bg-terracotta { background: #FDEDEC; }
    .bg-gold { background: #FEF9E7; }
    .bg-blue { background: #EBF5FB; }

    .pillar-badge-text {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #7D8898;
      margin-bottom: 0.35rem;
    }

    .pillar-title {
      font-size: 1.25rem;
      color: var(--night-900);
      margin-bottom: 0.75rem;
    }

    .pillar-desc {
      font-size: 0.88rem;
      color: var(--earth-700);
      line-height: 1.6;
    }

    .quote-banner {
      padding: 3rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .quote-icon {
      font-family: Georgia, serif;
      font-size: 4rem;
      line-height: 1;
      color: var(--secondary);
      display: block;
      margin-bottom: -1rem;
    }

    .quote-text {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 600;
      color: #FFFFFF;
      max-width: 780px;
      margin: 0 auto 1.5rem auto;
      line-height: 1.4;
    }

    .quote-author {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .quote-author strong {
      color: var(--secondary);
      font-size: 1rem;
    }

    .quote-author span {
      color: #B0BCC8;
      font-size: 0.85rem;
    }

    @media (max-width: 992px) {
      .pillars-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .pillars-grid {
        grid-template-columns: 1fr;
      }
      .quote-banner {
        padding: 2rem 1.5rem;
      }
      .quote-text {
        font-size: 1.25rem;
      }
    }
  `]
})
export class WhyUsComponent {}
