import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <section class="hero-section" id="hero">
      <!-- Background Overlay -->
      <div class="hero-bg-overlay"></div>
      
      <div class="container hero-container">
        <!-- Main Content -->
        <div class="hero-content">
          <!-- Safe Travels & Provenance Pill -->
          <div class="hero-pill-badge">
            <span class="pulse-dot"></span>
            <app-icon name="shield-check" [size]="16" stroke="#27AE60"></app-icon>
            <span>Operador Oficial Certificado • Safe Travels Perú</span>
          </div>

          <h1 class="hero-title">
            Descubre la Magia Oculta del <br>
            <span class="text-gradient">Valle del Sondondo</span>
          </h1>

          <p class="hero-lead">
            El vuelo libre del Cóndor Andino a metros de ti en Mayobamba, 
            el anfiteatro de andenes vivos de Andamarca y la mística ancestral de la Danza de las Tijeras. 
            Vive una expedición auténtica lejos del turismo masivo.
          </p>

          <!-- Action Buttons -->
          <div class="hero-actions">
            <a href="#tours" class="btn btn-primary btn-lg">
              <app-icon name="compass" [size]="20" stroke="#FFFFFF"></app-icon>
              <span>Explorar Circuitos 2026</span>
            </a>
            
            <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-lg">
              <app-icon name="whatsapp" [size]="20" stroke="#FFFFFF"></app-icon>
              <span>Cotizar por WhatsApp</span>
            </a>
          </div>

          <!-- Feature Highlights Bar -->
          <div class="hero-stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrap">
                <app-icon name="feather" [size]="22" stroke="var(--secondary)"></app-icon>
              </div>
              <div>
                <div class="stat-number">Kuntur Ñan</div>
                <div class="stat-label">Avistamiento de Cóndores</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap">
                <app-icon name="landmark" [size]="22" stroke="var(--primary)"></app-icon>
              </div>
              <div>
                <div class="stat-number">Andamarca</div>
                <div class="stat-label">Andenes Preíncas Vivos</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap">
                <app-icon name="mountain" [size]="22" stroke="#2980B9"></app-icon>
              </div>
              <div>
                <div class="stat-number">5,112 msnm</div>
                <div class="stat-label">Apu Sagrado Qarhuarazo</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap">
                <app-icon name="droplets" [size]="22" stroke="#27AE60"></app-icon>
              </div>
              <div>
                <div class="stat-number">Termas & Relax</div>
                <div class="stat-label">Huancas Puquio y Gollpa</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      min-height: 92vh;
      display: flex;
      align-items: center;
      padding-top: 7rem;
      padding-bottom: 4rem;
      background: linear-gradient(180deg, rgba(11, 19, 43, 0.7) 0%, rgba(11, 19, 43, 0.85) 100%),
                  url('https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1920&q=85') center/cover no-repeat;
      color: #FFFFFF;
      overflow: hidden;
    }

    .hero-bg-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 40%, rgba(192, 57, 43, 0.25) 0%, transparent 60%);
      pointer-events: none;
    }

    .hero-container {
      position: relative;
      z-index: 2;
    }

    .hero-content {
      max-width: 860px;
    }

    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: var(--radius-full);
      font-size: 0.84rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      margin-bottom: 1.5rem;
      color: #FFFFFF;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2ECC71;
      box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7);
      }
      70% {
        box-shadow: 0 0 0 8px rgba(46, 204, 113, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(46, 204, 113, 0);
      }
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      margin-bottom: 1.25rem;
    }

    .text-gradient {
      background: linear-gradient(135deg, #F39C12 0%, #E67E22 50%, #FF8A65 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-lead {
      font-size: 1.2rem;
      line-height: 1.65;
      color: #DDE4EC;
      margin-bottom: 2.2rem;
      max-width: 720px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 1.2rem;
      flex-wrap: wrap;
      margin-bottom: 3.5rem;
    }

    .btn-lg {
      padding: 0.95rem 2rem;
      font-size: 1.05rem;
    }

    .hero-stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem 1.1rem;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: var(--radius-md);
      transition: var(--transition-smooth);
    }

    .stat-card:hover {
      background: rgba(255, 255, 255, 0.14);
      transform: translateY(-3px);
    }

    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-number {
      font-family: var(--font-display);
      font-size: 1rem;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.15;
    }

    .stat-label {
      font-size: 0.72rem;
      color: #B0BCC8;
      font-weight: 500;
      margin-top: 2px;
    }

    @media (max-width: 992px) {
      .hero-title {
        font-size: 2.75rem;
      }
      .hero-stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .hero-section {
        min-height: auto;
        padding-top: 6rem;
      }
      .hero-title {
        font-size: 2.1rem;
      }
      .hero-lead {
        font-size: 1.05rem;
      }
      .hero-actions {
        flex-direction: column;
        width: 100%;
      }
      .hero-actions .btn {
        width: 100%;
      }
      .hero-stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HeroComponent {
  @Input() whatsAppNumber: string = '51966380590';

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola Valle del Sondondo Expeditions! Me gustaría cotizar un tour para conocer el valle.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }
}
