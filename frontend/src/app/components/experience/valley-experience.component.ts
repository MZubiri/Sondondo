import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-valley-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="destination-section" id="experiencia">
      <div class="container">
        <!-- Editorial Header -->
        <div class="section-title-wrap">
          <span class="section-tag">{{ ts.t('exp.badge') }}</span>
          <h2 class="section-title">{{ ts.t('exp.title') }}</h2>
          <p class="section-subtitle">
            {{ ts.t('exp.subtitle') }}
          </p>
        </div>

        <!-- Wide Photographic Showcase with Editorial Narrative -->
        <div class="editorial-feature">
          <div class="feature-media">
            <img 
              src="/assets/images/andenes_andamarca.jpg" 
              alt="Andenerías preíncas vivas de Andamarca en el Valle del Sondondo" 
              loading="lazy" 
              class="feature-img" />
            <span class="feature-caption">
              Andamarca &bull; Colosal anfiteatro de andenes prehispánicos en uso agrícola continuo (3,300 msnm)
            </span>
          </div>

          <div class="feature-text">
            <h3 class="feature-title">
              {{ ts.t('exp.andenesTitle') }}
            </h3>
            <p class="feature-lead">
              {{ ts.t('exp.andenesDesc') }}
            </p>
            <p>
              Operamos directamente con guías y baquianos nacidos en la mancomunidad. Respetamos los ciclos 
              del agua, las festividades como la Fiesta de las Cruces y el Yarqa Qallay, y preservamos el legado 
              de nuestro célebre cronista indígena Felipe Guamán Poma de Ayala.
            </p>
          </div>
        </div>

        <!-- 6 Canonical Cultural & Natural Destinations -->
        <div class="attractions-editorial-grid">
          <!-- 01: Andenes de Andamarca -->
          <div class="attraction-card">
            <div class="attraction-img-box">
              <img 
                src="/assets/images/andenes_andamarca.jpg" 
                alt="Andenes de Andamarca" 
                class="attraction-img" />
              <span class="attraction-altitude">3,300 msnm &bull; Andamarca</span>
            </div>
            <div class="attraction-info">
              <div class="attraction-badge-row">
                <span class="attraction-num">01</span>
                <span class="attraction-type">Patrimonio Agrícola Vivo</span>
              </div>
              <h4 class="attraction-name">{{ ts.t('exp.andenesTitle') }}</h4>
              <p class="attraction-desc">{{ ts.t('exp.andenesDesc') }}</p>
              <div class="attraction-festivities">
                <strong>Festividades:</strong> Fiesta de las Cruces (Mayo) y Yarqa Qallay / Fiesta del Agua (Agosto), siempre acompañadas por la Danza de Tijeras.
              </div>
            </div>
          </div>

          <!-- 02: Mirador de Cóndores de Mayobamba -->
          <div class="attraction-card">
            <div class="attraction-img-box">
              <img 
                src="/assets/images/condor_mayobamba.jpg" 
                alt="Mirador de Cóndores de Mayobamba" 
                class="attraction-img" />
              <span class="attraction-altitude">3,200 msnm &bull; Chipao</span>
            </div>
            <div class="attraction-info">
              <div class="attraction-badge-row">
                <span class="attraction-num">02</span>
                <span class="attraction-type">Kuntur Ñan &bull; Santuario Silvestre</span>
              </div>
              <h4 class="attraction-name">{{ ts.t('exp.condorTitle') }}</h4>
              <p class="attraction-desc">{{ ts.t('exp.condorDesc') }}</p>
              <div class="attraction-festivities">
                <strong>Tradición oral:</strong> Mitos andinos y literatura oral de los comuneros sobre el ave sagrada tutelar.
              </div>
            </div>
          </div>

          <!-- 03: Pueblo Histórico de Andamarca & Caniche -->
          <div class="attraction-card">
            <div class="attraction-img-box">
              <img 
                src="/assets/images/pueblo_andamarca.jpg" 
                alt="Pueblo de Andamarca y Sitio de Caniche" 
                class="attraction-img" />
              <span class="attraction-altitude">3,459 msnm &bull; Andamarca</span>
            </div>
            <div class="attraction-info">
              <div class="attraction-badge-row">
                <span class="attraction-num">03</span>
                <span class="attraction-type">Patrimonio Histórico & Arqueológico</span>
              </div>
              <h4 class="attraction-name">{{ ts.t('exp.pueblosTitle') }}</h4>
              <p class="attraction-desc">{{ ts.t('exp.pueblosDesc') }}</p>
              <div class="attraction-festivities">
                <strong>Historia:</strong> Cuna de ayllus ancestrales, miradores Aya Urqu y Waylla con vistas al valle.
              </div>
            </div>
          </div>

          <!-- 04: Cuna de la Danza de las Tijeras -->
          <div class="attraction-card">
            <div class="attraction-img-box">
              <img 
                src="/assets/images/danza_tijeras.jpg" 
                alt="Danzante de Tijeras en Ayacucho" 
                class="attraction-img" />
              <span class="attraction-altitude">Patrimonio UNESCO</span>
            </div>
            <div class="attraction-info">
              <div class="attraction-badge-row">
                <span class="attraction-num">04</span>
                <span class="attraction-type">Patrimonio Cultural Inmaterial</span>
              </div>
              <h4 class="attraction-name">{{ ts.t('exp.danzaTitle') }}</h4>
              <p class="attraction-desc">{{ ts.t('exp.danzaDesc') }}</p>
              <div class="attraction-festivities">
                <strong>Vivencia:</strong> Demostraciones íntimas con maestros galas y aprendizaje del simbolismo ancestral.
              </div>
            </div>
          </div>

          <!-- 05: Volcán Pétreo de Pachapupum & Termas -->
          <div class="attraction-card">
            <div class="attraction-img-box">
              <img 
                src="/assets/images/volcan_pachapupum.jpg" 
                alt="Volcán de Pachapupum" 
                class="attraction-img" />
              <span class="attraction-altitude">4,022 msnm &bull; Sacsamarca</span>
            </div>
            <div class="attraction-info">
              <div class="attraction-badge-row">
                <span class="attraction-num">05</span>
                <span class="attraction-type">Monumento Geológico & Termal</span>
              </div>
              <h4 class="attraction-name">{{ ts.t('exp.volcanTitle') }}</h4>
              <p class="attraction-desc">{{ ts.t('exp.volcanDesc') }}</p>
              <div class="attraction-festivities">
                <strong>Termalismo:</strong> Pozas naturales con propiedades terapéuticas para articulaciones y relajación.
              </div>
            </div>
          </div>

          <!-- 06: Pampa Galeras & Bosque de Piedras -->
          <div class="attraction-card">
            <div class="attraction-img-box">
              <img 
                src="/assets/images/pampa_galeras_vicunas.jpg" 
                alt="Reserva Nacional Pampa Galeras" 
                class="attraction-img" />
              <span class="attraction-altitude">4,100 msnm &bull; Lucanas</span>
            </div>
            <div class="attraction-info">
              <div class="attraction-badge-row">
                <span class="attraction-num">06</span>
                <span class="attraction-type">Reserva Nacional & Fauna Andina</span>
              </div>
              <h4 class="attraction-name">{{ ts.t('exp.galerasTitle') }}</h4>
              <p class="attraction-desc">{{ ts.t('exp.galerasDesc') }}</p>
              <div class="attraction-festivities">
                <strong>Conservación:</strong> Observación de vicuñas en bofedales andinos bajo la protección comunal.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .destination-section {
      padding: 6.5rem 0;
      background: #FFFFFF;
      border-top: 1px solid var(--border-light);
      border-bottom: 1px solid var(--border-light);
    }

    .editorial-feature {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 3.5rem;
      align-items: center;
      margin-bottom: 5rem;
    }

    .feature-media {
      position: relative;
      background: var(--earth-100);
      border-radius: var(--radius-sm);
      overflow: hidden;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
    }

    .feature-img {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .feature-caption {
      display: block;
      padding: 0.75rem 1.25rem;
      background: var(--cream-100);
      font-size: 0.8rem;
      color: var(--earth-800);
      letter-spacing: 0.03em;
      border-top: 1px solid var(--border-light);
      font-weight: 500;
    }

    .feature-text {
      display: flex;
      flex-direction: column;
    }

    .feature-title {
      font-size: 2rem;
      line-height: 1.25;
      color: var(--earth-950);
      margin-bottom: 1.25rem;
    }

    .feature-lead {
      font-size: 1.05rem;
      line-height: 1.75;
      color: var(--earth-800);
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .feature-text p {
      font-size: 0.94rem;
      color: var(--earth-700);
      line-height: 1.7;
    }

    /* 6 Attractions Grid */
    .attractions-editorial-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2.25rem;
    }

    .attraction-card {
      background: #FFFFFF;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: var(--transition);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
    }

    .attraction-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
      border-color: rgba(27, 53, 39, 0.25);
    }

    .attraction-img-box {
      position: relative;
      width: 100%;
      height: 200px;
      background: var(--earth-100);
      overflow: hidden;
    }

    .attraction-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .attraction-card:hover .attraction-img {
      transform: scale(1.05);
    }

    .attraction-altitude {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(18, 20, 19, 0.78);
      color: #FFFFFF;
      font-size: 0.74rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-xs);
      backdrop-filter: blur(4px);
    }

    .attraction-info {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .attraction-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.65rem;
    }

    .attraction-num {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent-clay);
    }

    .attraction-type {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--forest-900);
      background: var(--forest-50);
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
      border: 1px solid rgba(27, 53, 39, 0.12);
    }

    .attraction-name {
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.65rem;
      line-height: 1.3;
    }

    .attraction-desc {
      font-size: 0.88rem;
      line-height: 1.65;
      color: var(--earth-700);
      margin-bottom: 1rem;
      flex: 1;
    }

    .attraction-festivities {
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--earth-600);
      background: var(--cream-50);
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-xs);
      border-left: 3px solid var(--accent-clay);
    }

    .attraction-festivities strong {
      color: var(--earth-900);
    }

    @media (max-width: 1100px) {
      .attractions-editorial-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .editorial-feature {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }

    @media (max-width: 650px) {
      .destination-section {
        padding: 4.5rem 0;
      }
      .attractions-editorial-grid {
        grid-template-columns: 1fr;
      }
      .feature-title {
        font-size: 1.55rem;
      }
    }
  `]
})
export class ValleyExperienceComponent {
  public ts = inject(TranslationService);
}
