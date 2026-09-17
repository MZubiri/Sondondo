import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-valley-experience',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="destination-section" id="experiencia">
      <div class="container">
        <!-- Editorial Header -->
        <div class="section-title-wrap">
          <span class="section-tag">Territorio & Patrimonio Andino</span>
          <h2 class="section-title">Valle del Sondondo: Paisaje Cultural Vivo de Ayacucho</h2>
          <p class="section-subtitle">
            Al sur de Ayacucho, este valle interandino milenario reúne el mayor anfiteatro de andenes 
            prehispánicos vivos de América, el vuelo del Cóndor Andino y la cuna de la Danza de Tijeras.
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
              Andamarca • Anfiteatro de Andenes Prehispánicos Vivos (3,400 msnm)
            </span>
          </div>

          <div class="feature-text">
            <h3 class="feature-title">
              Cultura Viva, Paisaje Milenario y Soberanía Andina
            </h3>
            <p class="feature-lead">
              El Valle del Sondondo abarca los distritos históricos de Andamarca, Aucará, Cabana Sur, 
              Chipao y Huancasancos. Sus terrazas agrícolas escalonadas, construidas por las culturas 
              preíncas Cabana, Andamarca y Lucanas, siguen produciendo maíz y legumbres con los mismos 
              canales de piedra que irrigaron el imperio.
            </p>
            <p>
              Operamos con guías y baquianos nacidos en el propio valle. Compartimos la historia del 
              cronista indígena Felipe Guamán Poma de Ayala, el respeto por el Apu Qarhuarazo y la 
              convivencia armónica con las comunidades campesinas de Lucanas.
            </p>
          </div>
        </div>

        <!-- Visual Alternated List of Interest Points -->
        <div class="interest-points-list">
          <div class="interest-row">
            <div class="interest-index">01</div>
            <div class="interest-body">
              <h4 class="interest-title">Anfiteatro de Andenes de Andamarca</h4>
              <p class="interest-desc">
                Terrazas agrícolas prehispánicas continuas en actividad. Miradores de Waylla y Aya Urqu, 
                con vestigios de la fortaleza de Kanichi Antamarkas y una vista panorámica sin igual en el continente.
              </p>
            </div>
            <div class="interest-tag-col">
              <span class="interest-badge">Andamarca • 3,400 msnm</span>
            </div>
          </div>

          <div class="interest-row">
            <div class="interest-index">02</div>
            <div class="interest-body">
              <h4 class="interest-title">Mirador de Cóndores de Mayobamba</h4>
              <p class="interest-desc">
                Avistamiento matutino (6:30 a 8:30 am) de cóndores andinos remontando las corrientes térmicas 
                del cañón a escasos metros del visitante, complementado con el bosque de piedras de Julián Cuaresma.
              </p>
            </div>
            <div class="interest-tag-col">
              <span class="interest-badge">Mayobamba • Kuntur Ñan</span>
            </div>
          </div>

          <div class="interest-row">
            <div class="interest-index">03</div>
            <div class="interest-body">
              <h4 class="interest-title">Cuna de la Danza de las Tijeras (UNESCO)</h4>
              <p class="interest-desc">
                Patrimonio Cultural Inmaterial de la Humanidad. El Valle del Sondondo es la cuna del ritual 
                sagrado de los Danzaq, quienes bailan al compás del arpa y el violín haciendo sonar sus tijeras de acero.
              </p>
            </div>
            <div class="interest-tag-col">
              <span class="interest-badge">Patrimonio UNESCO</span>
            </div>
          </div>

          <div class="interest-row">
            <div class="interest-index">04</div>
            <div class="interest-body">
              <h4 class="interest-title">Volcán de Pachapupum & Pampa Galeras</h4>
              <p class="interest-desc">
                Monumento natural pétreo de sal y azufre a 4,022 msnm con pozas termominero-medicinales en Sacsamarca, 
                junto a la mayor concentración de vicuñas silvestres del Perú en la Reserva Nacional Pampa Galeras.
              </p>
            </div>
            <div class="interest-tag-col">
              <span class="interest-badge">Pachapupum & Vicuñas</span>
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
      grid-template-columns: 1.3fr 1fr;
      gap: 3.5rem;
      align-items: center;
      margin-bottom: 4.5rem;
    }

    .feature-media {
      position: relative;
      background: var(--earth-100);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .feature-img {
      width: 100%;
      height: 420px;
      object-fit: cover;
    }

    .feature-caption {
      display: block;
      padding: 0.65rem 1rem;
      background: var(--cream-100);
      font-size: 0.76rem;
      color: var(--earth-700);
      letter-spacing: 0.04em;
      border-top: 1px solid var(--border-light);
    }

    .feature-text {
      display: flex;
      flex-direction: column;
    }

    .feature-title {
      font-size: 2rem;
      line-height: 1.3;
      color: var(--earth-950);
      margin-bottom: 1.25rem;
    }

    .feature-lead {
      font-size: 1.08rem;
      line-height: 1.75;
      color: var(--earth-800);
      margin-bottom: 1rem;
      font-weight: 500;
    }

    .feature-text p {
      font-size: 0.95rem;
      color: var(--earth-700);
      line-height: 1.7;
    }

    /* Lista visual sencilla sin tarjetas repetitivas */
    .interest-points-list {
      border-top: 1px solid var(--border-light);
    }

    .interest-row {
      display: grid;
      grid-template-columns: 80px 1fr 200px;
      gap: 2rem;
      align-items: baseline;
      padding: 2.2rem 0;
      border-bottom: 1px solid var(--border-light);
      transition: var(--transition);
    }

    .interest-row:hover {
      background-color: var(--cream-50);
    }

    .interest-index {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--accent-clay);
    }

    .interest-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--earth-950);
      margin-bottom: 0.45rem;
    }

    .interest-desc {
      font-size: 0.92rem;
      color: var(--earth-700);
      line-height: 1.65;
      max-width: 650px;
    }

    .interest-tag-col {
      text-align: right;
    }

    .interest-badge {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--forest-900);
      background: var(--forest-50);
      border: 1px solid rgba(27, 53, 39, 0.15);
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-xs);
    }

    @media (max-width: 992px) {
      .editorial-feature {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
      .feature-img {
        height: 320px;
      }
      .interest-row {
        grid-template-columns: 60px 1fr;
        gap: 1rem;
      }
      .interest-tag-col {
        grid-column: 2;
        text-align: left;
      }
    }

    @media (max-width: 600px) {
      .destination-section {
        padding: 4.5rem 0;
      }
      .feature-title {
        font-size: 1.55rem;
      }
      .interest-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        padding: 1.6rem 0;
      }
      .interest-tag-col {
        grid-column: 1;
      }
    }
  `]
})
export class ValleyExperienceComponent {}
