import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="login-ambient-glow"></div>
      
      <div class="login-card">
        <!-- Brand Header -->
        <div class="login-brand">
          <div class="login-emblem">VS</div>
          <span class="brand-eyebrow">Valle del Sondondo Expeditions</span>
          <h1 class="brand-title">Panel de Operaciones</h1>
          <p class="brand-subtitle">Gestión de expediciones, reservas y sistema hotelero</p>
        </div>

        <!-- Notification Error -->
        <div *ngIf="errorMessage()" class="login-error">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ errorMessage() }}</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario o Correo Electrónico</label>
            <div class="input-container">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input 
                type="text" 
                id="username" 
                name="username" 
                [(ngModel)]="username" 
                placeholder="admin@valledelsondondo.com" 
                required 
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label for="password">Contraseña de Acceso</label>
              <button type="button" class="btn-toggle-pw" (click)="togglePassword()">
                {{ showPassword() ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            <div class="input-container">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                id="password" 
                name="password" 
                [(ngModel)]="password" 
                placeholder="••••••••••••" 
                required 
                autocomplete="current-password"
              />
            </div>
          </div>

          <!-- Credentials Quick Reference -->
          <div class="credentials-card">
            <div class="cred-header">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>Acceso Rápido de Demostración:</span>
            </div>
            <div class="cred-grid">
              <div class="cred-item">
                <span class="cred-label">Usuario:</span>
                <code>admin@valledelsondondo.com</code>
              </div>
              <div class="cred-item">
                <span class="cred-label">Clave:</span>
                <code>Sondondo2026!</code>
              </div>
            </div>
          </div>

          <button type="submit" class="btn-submit" [disabled]="loading()">
            <span *ngIf="!loading()">Iniciar Sesión en el Panel</span>
            <span *ngIf="loading()">Verificando credenciales...</span>
          </button>
        </form>

        <div class="login-footer">
          <a routerLink="/" class="back-link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Volver a la Web Principal</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0b0f0d;
      padding: 1.5rem;
      position: relative;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .login-ambient-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle 500px at 50% 10%, rgba(214, 100, 60, 0.12), transparent 70%),
        radial-gradient(circle 600px at 80% 85%, rgba(207, 161, 90, 0.08), transparent 70%);
      pointer-events: none;
    }

    .login-card {
      width: 100%;
      max-width: 440px;
      background: rgba(20, 28, 24, 0.88);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 16px;
      padding: 2.5rem 2.25rem;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 1px 2px rgba(0, 0, 0, 0.4);
      position: relative;
      z-index: 10;
    }

    .login-brand {
      text-align: center;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .login-emblem {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: linear-gradient(135deg, #24342a 0%, #151e18 100%);
      border: 1px solid rgba(214, 100, 60, 0.35);
      color: #d6643c;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 1.15rem;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
    }

    .brand-eyebrow {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #d6643c;
      margin-bottom: 0.35rem;
    }

    .brand-title {
      font-family: 'Outfit', sans-serif;
      font-size: 1.65rem;
      font-weight: 800;
      color: #f3f6f4;
      margin: 0;
      letter-spacing: -0.025em;
    }

    .brand-subtitle {
      font-size: 0.84rem;
      color: #9caaa2;
      margin: 0.4rem 0 0;
      line-height: 1.4;
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(217, 88, 78, 0.12);
      border: 1px solid rgba(217, 88, 78, 0.28);
      color: #f87171;
      padding: 0.7rem 0.9rem;
      border-radius: 8px;
      font-size: 0.84rem;
      margin-bottom: 1.5rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-group label {
      font-size: 0.78rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .btn-toggle-pw {
      background: none;
      border: none;
      color: #9caaa2;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0;
    }

    .btn-toggle-pw:hover {
      color: #f3f6f4;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 0.95rem;
      color: #64746c;
      pointer-events: none;
    }

    .input-container input {
      width: 100%;
      background: #0e1411;
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 8px;
      padding: 0.7rem 0.9rem 0.7rem 2.6rem;
      color: #f3f6f4;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
    }

    .input-container input:focus {
      background: #121915;
      border-color: #d6643c;
      box-shadow: 0 0 0 3px rgba(214, 100, 60, 0.18);
    }

    .credentials-card {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 0.85rem 1rem;
      font-size: 0.78rem;
    }

    .cred-header {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #9caaa2;
      font-weight: 600;
      margin-bottom: 0.45rem;
    }

    .cred-grid {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .cred-item {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .cred-label {
      color: #64746c;
      font-size: 0.74rem;
      min-width: 48px;
    }

    .cred-item code {
      color: #cfa15a;
      background: rgba(207, 161, 90, 0.1);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.76rem;
    }

    .btn-submit {
      margin-top: 0.5rem;
      width: 100%;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      background: #d6643c;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 0.9rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(214, 100, 60, 0.3);
      transition: all 0.2s cubic-bezier(0.2, 0, 0.2, 1);
    }

    .btn-submit:hover:not(:disabled) {
      background: #e0724b;
      box-shadow: 0 6px 20px rgba(214, 100, 60, 0.4);
      transform: translateY(-1px);
    }

    .btn-submit:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .login-footer {
      margin-top: 1.75rem;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 1.25rem;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: #9caaa2;
      text-decoration: none;
      font-size: 0.82rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #f3f6f4;
    }
  `]
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = 'admin@valledelsondondo.com';
  password = 'Sondondo2026!';
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(res.message || 'Credenciales inválidas. Revisa usuario y contraseña.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al conectar con el servidor de autenticación.');
      }
    });
  }
}
