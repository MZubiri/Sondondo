import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <footer class="footer-wrap">
      <div class="container footer-container">
        <!-- Column 1: Brand & Safe Travels -->
        <div class="footer-col brand-col">
          <div class="footer-logo">
            <div class="logo-icon">
              <app-icon name="feather" [size]="24" stroke="#FFFFFF"></app-icon>
            </div>
            <div>
              <span class="logo-name">VALLE DEL SONDONDO</span>
              <span class="logo-tag">EXPEDITIONS • PERÚ</span>
            </div>
          </div>
          <p class="footer-bio">
            Operador turístico local pionero y certificado en el Valle del Sondondo (Lucanas - Ayacucho). Guiamos experiencias vivenciales, ornitológicas y de alta montaña con respeto absoluto hacia las comunidades andinas y su patrimonio milenario.
          </p>

          <!-- Safe Travels Certificate Pill -->
          <div class="safe-travels-badge">
            <div class="st-icon">
              <app-icon name="shield-check" [size]="20" stroke="#1B5E20"></app-icon>
            </div>
            <div>
              <div class="st-title">CERTIFICACIÓN INTERNACIONAL</div>
              <div class="st-desc">Safe Travels • WTTC & DIRCETUR</div>
            </div>
          </div>
        </div>

        <!-- Column 2: Circuitos Destacados -->
        <div class="footer-col">
          <h4 class="col-title">Circuitos Emblemáticos</h4>
          <ul class="col-links">
            <li><a routerLink="/tour/kuntur-nan-vuelo-del-condor">Kuntur Ñan (Ruta del Cóndor)</a></li>
            <li><a routerLink="/tour/andenes-vivos-andamarca-danzantes-de-tijeras">Andenes Vivos de Andamarca</a></li>
            <li><a routerLink="/tour/expedicion-sagrada-apu-qarhuarazo">Trek Apu Qarhuarazo (5,112m)</a></li>
            <li><a routerLink="/tour/ruta-termal-canones-catarata-limayhuacho">Aguas Termales & Cañones</a></li>
            <li><a routerLink="/tour/gran-travesia-valle-del-sondondo">Gran Travesía Sondondo (4 Días)</a></li>
          </ul>
        </div>

        <!-- Column 3: Destinos del Valle -->
        <div class="footer-col">
          <h4 class="col-title">Destinos en Sondondo</h4>
          <ul class="col-links">
            <li><span>Aucará & Mirador de Mayobamba</span></li>
            <li><span>Andamarca & Casa de los Antamarkas</span></li>
            <li><span>Cabana Sur & Templo Colonial</span></li>
            <li><span>Chipao & Canteras de Piedra</span></li>
            <li><span>Puquio & Reserva Pampa Galeras</span></li>
          </ul>
        </div>

        <!-- Column 4: Contacto Oficial -->
        <div class="footer-col contact-col">
          <h4 class="col-title">Contacto Directo</h4>
          <div class="contact-item">
            <app-icon name="map-pin" [size]="18" stroke="var(--primary)"></app-icon>
            <span>Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú</span>
          </div>
          <div class="contact-item">
            <app-icon name="phone" [size]="18" stroke="var(--primary)"></app-icon>
            <a [href]="'tel:' + phoneNumber">{{ phoneNumber }}</a>
          </div>
          <div class="contact-item">
            <app-icon name="mail" [size]="18" stroke="var(--primary)"></app-icon>
            <a [href]="'mailto:' + email">{{ email }}</a>
          </div>
          <div class="contact-item">
            <app-icon name="whatsapp" [size]="18" stroke="#25D366"></app-icon>
            <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer">Atención WhatsApp 24/7</a>
          </div>

          <div class="social-row">
            <a [href]="facebookUrl" target="_blank" rel="noopener noreferrer" class="social-btn" title="Facebook">
              Facebook
            </a>
            <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="social-btn wa" title="WhatsApp">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container bottom-content">
          <p>© 2026 Valle del Sondondo Expeditions. Todos los derechos reservados.</p>
          <div class="bottom-links">
            <span>Turismo Sostenible y Comunitario</span>
            <span>•</span>
            <span>Patrimonio Cultural de Ayacucho</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrap {
      background: var(--night-900);
      color: #FFFFFF;
      padding-top: 4.5rem;
      border-top: 3px solid var(--primary);
    }

    .footer-container {
      display: grid;
      grid-template-columns: 1.8fr 1.2fr 1.1fr 1.4fr;
      gap: 3rem;
      margin-bottom: 3.5rem;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      margin-bottom: 1.2rem;
    }

    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-name {
      display: block;
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.01em;
      line-height: 1.1;
    }

    .logo-tag {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--secondary);
      letter-spacing: 0.15em;
    }

    .footer-bio {
      color: #A0AAB8;
      font-size: 0.9rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .safe-travels-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 0.75rem 1rem;
    }

    .st-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #E8F5E9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .st-title {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #81C784;
    }

    .st-desc {
      font-size: 0.8rem;
      font-weight: 600;
      color: #FFFFFF;
    }

    .col-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 1.3rem;
      position: relative;
      padding-bottom: 0.6rem;
    }

    .col-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 32px;
      height: 2px;
      background: var(--primary);
    }

    .col-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .col-links a, .col-links span {
      color: #B0BCC8;
      font-size: 0.92rem;
      transition: var(--transition-smooth);
    }

    .col-links a:hover {
      color: var(--secondary);
      padding-left: 4px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      margin-bottom: 0.85rem;
      font-size: 0.88rem;
      color: #B0BCC8;
    }

    .contact-item a {
      color: #FFFFFF;
    }

    .contact-item a:hover {
      color: var(--secondary);
    }

    .social-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }

    .social-btn {
      padding: 0.4rem 0.9rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--radius-full);
      font-size: 0.82rem;
      font-weight: 600;
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .social-btn:hover {
      background: var(--primary);
      border-color: var(--primary);
    }

    .social-btn.wa:hover {
      background: var(--whatsapp);
      border-color: var(--whatsapp);
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.5rem 0;
      font-size: 0.85rem;
      color: #7D8898;
    }

    .bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .bottom-links {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 992px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
        gap: 2.5rem;
      }
    }

    @media (max-width: 600px) {
      .footer-container {
        grid-template-columns: 1fr;
      }
      .bottom-content {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  @Input() phoneNumber: string = '+51 966 380 590';
  @Input() email: string = 'miskichaskaperu@hotmail.com';
  @Input() whatsAppNumber: string = '51966380590';
  @Input() facebookUrl: string = 'https://www.facebook.com/valledelsondondoexpeditions';

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola Valle del Sondondo Expeditions! Deseo más información sobre sus tours y salidas.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }
}
