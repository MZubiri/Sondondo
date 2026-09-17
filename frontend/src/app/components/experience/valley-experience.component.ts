import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-valley-experience',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <section class="experience-section" id="experiencia">
      <div class="container">
        <!-- Section Header -->
        <div class="section-title-wrap">
          <span class="section-tag">Patrimonio Vivo de Ayacucho</span>
          <h2 class="section-title">El Valle del Sondondo: Un Santuario Andino</h2>
          <p class="section-subtitle">
            Ubicado en la provincia de Lucanas, Ayacucho, este valle protegido guarda una herencia viva que data de más de mil años de historia andina ininterrumpida.
          </p>
        </div>

        <!-- Four Pillars of the Valley -->
        <div class="experience-grid">
          <!-- Card 1: Cóndor -->
          <div class="exp-card">
            <div class="exp-img-box">
              <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80" alt="Cóndor Andino en Mayobamba" loading="lazy" />
              <div class="exp-badge">
                <app-icon name="feather" [size]="16" stroke="#FFFFFF"></app-icon>
                <span>Santuario Ornitológico</span>
              </div>
            </div>
            <div class="exp-content">
              <h3>El Vuelo del Cóndor en Mayobamba</h3>
              <p>
                Los cañones de Mayobamba y Aucará ofrecen uno de los mejores observatorios naturales de Sudamérica. El Cóndor Andino planea a escasos metros aprovechando las corrientes térmicas matutinas.
              </p>
            </div>
          </div>

          <!-- Card 2: Andenerías -->
          <div class="exp-card">
            <div class="exp-img-box">
              <img src="https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80" alt="Andenes Vivos de Andamarca" loading="lazy" />
              <div class="exp-badge">
                <app-icon name="landmark" [size]="16" stroke="#FFFFFF"></app-icon>
                <span>Ingeniería Prehispánica</span>
              </div>
            </div>
            <div class="exp-content">
              <h3>Colosales Andenerías Vivas de Andamarca</h3>
              <p>
                Más de 5,000 hectáreas de terrazas agrícolas escalonadas construidas por civilizaciones Wari e Inca que continúan fértiles hoy en día, alimentadas por sabios canales de regadío.
              </p>
            </div>
          </div>

          <!-- Card 3: Tijeras -->
          <div class="exp-card">
            <div class="exp-img-box">
              <img src="https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80" alt="Danza de las Tijeras UNESCO" loading="lazy" />
              <div class="exp-badge">
                <app-icon name="compass" [size]="16" stroke="#FFFFFF"></app-icon>
                <span>Patrimonio UNESCO</span>
              </div>
            </div>
            <div class="exp-content">
              <h3>Cuna Ancestral de la Danza de las Tijeras</h3>
              <p>
                El Valle del Sondondo es el vientre místico de los Danzantes de Tijeras (Galas y Tusuq). El chasquido del hierro forjado y la melodía del arpa y violín rinden tributo a las fuerzas de la naturaleza.
              </p>
            </div>
          </div>

          <!-- Card 4: Qarhuarazo -->
          <div class="exp-card">
            <div class="exp-img-box">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80" alt="Apu Qarhuarazo" loading="lazy" />
              <div class="exp-badge">
                <app-icon name="mountain" [size]="16" stroke="#FFFFFF"></app-icon>
                <span>Deidad Tutelar</span>
              </div>
            </div>
            <div class="exp-content">
              <h3>El Sagrado Volcán Apu Qarhuarazo (5,112m)</h3>
              <p>
                El coloso nevado que vigila el valle. Rodeado de bofedales con manadas de vicuñas protegidas y lagunas sagradas donde se celebran ceremonias milenarias de ofrenda al agua.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .experience-section {
      padding: 6rem 0;
      background: #FFFFFF;
    }

    .experience-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.75rem;
    }

    .exp-card {
      background: var(--earth-50);
      border-radius: var(--radius-lg);
      overflow: hidden;
      border: 1px solid var(--border-light);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: var(--transition-smooth);
    }

    .exp-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: rgba(192, 57, 43, 0.25);
    }

    .exp-img-box {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .exp-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .exp-card:hover .exp-img-box img {
      transform: scale(1.08);
    }

    .exp-badge {
      position: absolute;
      top: 0.85rem;
      left: 0.85rem;
      background: rgba(11, 19, 43, 0.85);
      backdrop-filter: blur(8px);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 700;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .exp-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    .exp-content h3 {
      font-size: 1.15rem;
      margin-bottom: 0.65rem;
      color: var(--night-900);
      line-height: 1.3;
    }

    .exp-content p {
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--earth-700);
    }

    @media (max-width: 1100px) {
      .experience-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .experience-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ValleyExperienceComponent {}
