import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../services/translation.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <footer class="footer-wrap">
      <div class="container footer-grid">
        <!-- Col 1: Bio -->
        <div class="footer-brand">
          <span class="footer-title">{{ ts.t('footer.title') }}</span>
          <p class="footer-text">
            {{ ts.t('footer.bio') }}
          </p>
        </div>

        <!-- Col 2: Enlaces Rápidos -->
        <div class="footer-nav">
          <span class="footer-col-header">{{ ts.t('footer.navigation') }}</span>
          <ul>
            <li><a routerLink="/" fragment="tours">{{ ts.t('footer.tours') }}</a></li>
            <li><a routerLink="/" fragment="experiencia">{{ ts.t('footer.destination') }}</a></li>
            <li><a routerLink="/" fragment="habitaciones">{{ ts.t('footer.rooms') }}</a></li>
            <li><a routerLink="/" fragment="nosotros">{{ ts.t('footer.whyUs') }}</a></li>
            <li><a routerLink="/" fragment="contacto">{{ ts.t('footer.contact') }}</a></li>
            <li><a routerLink="/admin/login" class="admin-link">{{ ts.t('footer.adminLink') }}</a></li>
          </ul>
        </div>

        <!-- Col 3: Contacto & Redes -->
        <div class="footer-contact">
          <span class="footer-col-header">{{ ts.t('footer.directContact') }}</span>
          <div class="contact-links">
            <a [href]="whatsAppUrl" target="_blank" rel="noopener noreferrer" class="contact-line">
              <app-icon name="whatsapp" [size]="16" stroke="var(--whatsapp)"></app-icon>
              <span>{{ ts.t('footer.waLabel') }}</span>
            </a>
            <a [href]="'mailto:' + email" class="contact-line">
              <app-icon name="mail" [size]="16" stroke="var(--earth-500)"></app-icon>
              <span>{{ email }}</span>
            </a>
            <div class="contact-line">
              <app-icon name="map-pin" [size]="16" stroke="var(--earth-500)"></app-icon>
              <span>{{ ts.t('footer.address') }}</span>
            </div>
            <a [href]="facebookUrl" target="_blank" rel="noopener noreferrer" class="facebook-link">
              {{ ts.t('footer.facebook') }}
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container bottom-row">
          <p>{{ ts.t('footer.rights') }}</p>
          <span class="bottom-tag">{{ ts.t('footer.location') }}</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrap {
      background: var(--earth-950);
      color: #EDE8DE;
      padding-top: 4rem;
      border-top: 1px solid var(--border-light);
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1.2fr;
      gap: 3.5rem;
      padding-bottom: 3.5rem;
    }

    .footer-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      display: block;
      margin-bottom: 0.75rem;
    }

    .footer-text {
      font-size: 0.88rem;
      line-height: 1.65;
      color: #B5A89A;
      max-width: 420px;
    }

    .footer-col-header {
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-clay);
      display: block;
      margin-bottom: 1.1rem;
    }

    .footer-nav ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .footer-nav a {
      font-size: 0.88rem;
      color: #D6CEC3;
      transition: var(--transition);
    }

    .footer-nav a:hover {
      color: #FFFFFF;
      text-decoration: underline;
    }

    .admin-link {
      color: var(--accent-clay) !important;
      opacity: 0.85;
      font-size: 0.82rem !important;
      margin-top: 0.35rem;
      display: inline-block;
    }

    .admin-link:hover {
      opacity: 1;
    }

    .contact-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .contact-line {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.88rem;
      color: #D6CEC3;
    }

    .contact-line a:hover {
      color: #FFFFFF;
    }

    .facebook-link {
      display: inline-block;
      margin-top: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #FFFFFF;
      text-decoration: underline;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.5rem 0;
      font-size: 0.8rem;
      color: #8C7F72;
    }

    .bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    @media (max-width: 860px) {
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 2.2rem;
      }
    }
  `]
})
export class FooterComponent {
  public ts = inject(TranslationService);

  @Input() phoneNumber: string = '+51 966 380 590';
  @Input() email: string = 'miskichaskaperu@hotmail.com';
  @Input() whatsAppNumber: string = '51966380590';
  @Input() facebookUrl: string = 'https://www.facebook.com/valledelsondondoexpeditions';

  get whatsAppUrl(): string {
    const text = encodeURIComponent('¡Hola! Me gustaría consultar información sobre los recorridos.');
    return `https://wa.me/${this.whatsAppNumber}?text=${text}`;
  }
}
