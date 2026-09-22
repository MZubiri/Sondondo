import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-connectivity-guide',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="connectivity-section" id="conectividad">
      <div class="container">
        <!-- Section Header -->
        <div class="section-title-wrap">
          <span class="section-tag">{{ ts.t('connect.badge') }}</span>
          <h2 class="section-title">{{ ts.t('connect.title') }}</h2>
          <p class="section-subtitle">
            {{ ts.t('connect.subtitle') }}
          </p>
        </div>

        <!-- Main Route Journey Grid -->
        <div class="route-overview-card">
          <div class="route-header">
            <div class="route-header-left">
              <span class="route-badge">Ruta Terrestre Principal</span>
              <h3 class="route-main-title">De Lima al Valle del Sondondo (Andamarca)</h3>
              <p class="route-total-metric">
                <strong>Distancia Total:</strong> 678 km &bull; <strong>Tiempo estimado:</strong> 10 a 11 horas aprox.
              </p>
            </div>
            <div class="route-header-right">
              <span class="route-paved-tag">
                <app-icon name="check" [size]="16" stroke="var(--forest-800)"></app-icon> 
                100% Carretera Asfaltada
              </span>
            </div>
          </div>

          <!-- Segments Timeline -->
          <div class="segments-timeline">
            <!-- Tramo 1 -->
            <div class="segment-step">
              <div class="step-marker">1</div>
              <div class="step-content">
                <div class="step-meta">
                  <span class="step-distance">445 km &bull; 6 horas aprox.</span>
                  <span class="step-road">Carretera Panamericana Sur</span>
                </div>
                <h4 class="step-title">Lima &rarr; Nasca</h4>
                <p class="step-desc">
                  Recorrido por la costa sur en vía rápida asfaltada. Punto ideal para abastecimiento, 
                  refrigerio y descanso previo al ascenso andino.
                </p>
              </div>
            </div>

            <!-- Tramo 2 -->
            <div class="segment-step highlight-step">
              <div class="step-marker">2</div>
              <div class="step-content">
                <div class="step-meta">
                  <span class="step-distance">155 km &bull; 3 horas aprox.</span>
                  <span class="step-road">Carretera Interoceánica Asfaltada</span>
                </div>
                <h4 class="step-title">Nasca &rarr; Puquio</h4>
                <p class="step-desc">
                  Ascenso panorámico por la cordillera. <strong>En el km 90</strong> se cruza la 
                  <strong>Reserva Nacional Bárbara d'Achille - Pampa Galeras</strong>, que alberga 
                  la mayor concentración de vicuñas silvestres del Perú.
                </p>
              </div>
            </div>

            <!-- Tramo 3 -->
            <div class="segment-step">
              <div class="step-marker">3</div>
              <div class="step-content">
                <div class="step-meta">
                  <span class="step-distance">68 km &bull; 1 hora 30 min</span>
                  <span class="step-road">Ruta 32A (km 274 Asfaltada)</span>
                </div>
                <h4 class="step-title">Puquio &rarr; Andamarca / Cabana Sur</h4>
                <p class="step-desc">
                  Ingreso directo al corazón del cañón y terrazas del Valle del Sondondo. 
                  Este tramo cuenta con centro de visitantes oficial e informadores turísticos locales.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 4 Practical Advice Cards -->
        <div class="advice-grid">
          <!-- Card 1: ¿Qué traer? -->
          <div class="advice-card">
            <div class="advice-icon-wrap icon-sun">
              <app-icon name="sun" [size]="22" stroke="#b45309"></app-icon>
            </div>
            <div class="advice-body">
              <h4 class="advice-title">¿Qué Traer? (Clima Quechua & Suni)</h4>
              <p class="advice-text">
                El aire es seco y frío en mañanas y noches; días soleados y calurosos, con tardes de viento. 
                Recomendamos ropa abrigadora en capas, gorro de lana, sombrero de ala ancha, gafas UV, 
                bloqueador solar, repelente de mosquitos, calzado de trekking y abundante agua.
              </p>
            </div>
          </div>

          <!-- Card 2: Dinero y Efectivo -->
          <div class="advice-card alert-card">
            <div class="advice-icon-wrap icon-cash">
              <app-icon name="bank" [size]="22" stroke="#b91c1c"></app-icon>
            </div>
            <div class="advice-body">
              <div class="advice-alert-header">
                <h4 class="advice-title">Dinero en Efectivo (¡Muy Importante!)</h4>
                <span class="alert-pill">Solo Efectivo</span>
              </div>
              <p class="advice-text">
                La <strong>única agencia bancaria (Banco de la Nación)</strong> se ubica en <strong>Cabana</strong>. 
                Ningún comercio ni hospedaje cuenta con medio de pago electrónico (POS) y <strong>no hay cajeros automáticos (ATM)</strong>. 
                Lleve efectivo en soles desde Lima, Nasca o Puquio.
              </p>
            </div>
          </div>

          <!-- Card 3: Comunicaciones -->
          <div class="advice-card">
            <div class="advice-icon-wrap icon-phone">
              <app-icon name="phone" [size]="22" stroke="var(--forest-900)"></app-icon>
            </div>
            <div class="advice-body">
              <h4 class="advice-title">Comunicaciones Móviles</h4>
              <p class="advice-text">
                En los distritos y miradores del Valle del Sondondo es posible la comunicación y datos celulares 
                a través de las operadoras <strong>Bitel, Claro y Movistar</strong>, permitiendo mantenerse conectado 
                durante los circuitos.
              </p>
            </div>
          </div>

          <!-- Card 4: Combustible y Mecánica -->
          <div class="advice-card">
            <div class="advice-icon-wrap icon-services">
              <app-icon name="shield-check" [size]="22" stroke="var(--forest-900)"></app-icon>
            </div>
            <div class="advice-body">
              <h4 class="advice-title">Combustible & Auxilio Mecánico</h4>
              <p class="advice-text">
                Todas las ciudades principales cuentan con al menos una estación de servicio con provisión de 
                <strong>gasolina de 90 y 95 octanos</strong> y <strong>Diesel</strong>. Existen servicios de 
                vulcanizadora (reparación de neumáticos) y mecánica ligera.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .connectivity-section {
      padding: 6rem 0;
      background: var(--section-bg-tint, #FAFAF7);
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
      transition: background 0.3s ease;
    }

    .route-overview-card {
      background: var(--surface-card, #FFFFFF);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-md);
      padding: 2.75rem;
      margin-bottom: 3rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }

    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.25rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border-light);
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .route-badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--accent-clay);
      margin-bottom: 0.35rem;
    }

    .route-main-title {
      font-size: 1.65rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.35rem;
      line-height: 1.25;
    }

    .route-total-metric {
      font-size: 0.95rem;
      color: var(--earth-700);
    }

    .route-total-metric strong {
      color: var(--earth-900);
    }

    .route-paved-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 600;
      background: var(--forest-50);
      color: var(--forest-900);
      padding: 0.4rem 0.85rem;
      border-radius: var(--radius-full);
      border: 1px solid rgba(27, 53, 39, 0.15);
    }

    .segments-timeline {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      position: relative;
    }

    .segment-step {
      display: flex;
      gap: 1.15rem;
      position: relative;
    }

    .step-marker {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--forest-900);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      flex-shrink: 0;
      border: 3px solid var(--forest-100);
    }

    .step-meta {
      display: flex;
      flex-direction: column;
      margin-bottom: 0.35rem;
    }

    .step-distance {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--accent-clay);
    }

    .step-road {
      font-size: 0.76rem;
      color: var(--earth-600);
    }

    .step-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.45rem;
    }

    .step-desc {
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--earth-700);
    }

    .step-desc strong {
      color: var(--earth-900);
    }

    /* 4 Advice Cards */
    .advice-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.75rem;
    }

    .advice-card {
      background: var(--surface-card, #FFFFFF);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      padding: 1.85rem;
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      transition: var(--transition);
    }

    .advice-card:hover {
      border-color: var(--accent-clay);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
    }

    .alert-card {
      background: #FFFDFD;
      border-color: rgba(185, 28, 28, 0.25);
    }

    .advice-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-xs);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--cream-100);
    }

    .icon-sun {
      background: #FEF3C7;
    }

    .icon-cash {
      background: #FEE2E2;
    }

    .icon-phone {
      background: var(--forest-50);
    }

    .icon-services {
      background: var(--earth-100);
    }

    .advice-body {
      flex: 1;
    }

    .advice-alert-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.4rem;
      flex-wrap: wrap;
    }

    .alert-pill {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      background: #FEE2E2;
      color: #991B1B;
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-full);
      letter-spacing: 0.04em;
    }

    .advice-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.4rem;
    }

    .advice-text {
      font-size: 0.9rem;
      line-height: 1.65;
      color: var(--earth-700);
    }

    .advice-text strong {
      color: var(--earth-900);
    }

    @media (max-width: 992px) {
      .segments-timeline {
        grid-template-columns: 1fr;
        gap: 1.75rem;
      }
      .advice-grid {
        grid-template-columns: 1fr;
      }
      .route-overview-card {
        padding: 1.75rem;
      }
    }

    @media (max-width: 600px) {
      .connectivity-section {
        padding: 4rem 0;
      }
      .route-main-title {
        font-size: 1.35rem;
      }
    }
  `]
})
export class ConnectivityGuideComponent {
  public ts = inject(TranslationService);
}
