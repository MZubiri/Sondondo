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
      <div class="login-box">
        <!-- Brand Header -->
        <div class="login-brand">
          <span class="brand-badge">Valle del Sondondo • Ayacucho</span>
          <h1 class="brand-title">Panel de Control</h1>
          <p class="brand-subtitle">Gestión de Expediciones, Reservas y Clientes</p>
        </div>

        <!-- Notification Error -->
        <div *ngIf="errorMessage()" class="login-error">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
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
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
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
            <label for="password">Contraseña</label>
            <div class="input-container">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" class="input-icon">
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
              <button type="button" class="btn-toggle-pw" (click)="togglePassword()">
                {{ showPassword() ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>

          <!-- Credentials Hint for Quick Access -->
          <div class="credentials-hint">
            <strong>Credenciales predeterminadas:</strong><br>
            Usuario: <code>admin@valledelsondondo.com</code><br>
            Clave: <code>Sondondo2026!</code>
          </div>

          <button type="submit" class="btn-login" [disabled]="loading()">
            <span *ngIf="!loading()">Iniciar Sesión</span>
            <span *ngIf="loading()">Verificando credenciales...</span>
          </button>
        </form>

        <div class="login-footer">
          <a routerLink="/" class="back-link">
            ← Volver a la web pública
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
      background: radial-gradient(circle at top right, #1b2832, #0b1216 70%);
      padding: 1.5rem;
      font-family: inherit;
    }

    .login-box {
      width: 100%;
      max-width: 440px;
      background: #121c23;
      border: 1px solid rgba(212, 160, 23, 0.2);
      border-radius: 12px;
      padding: 2.5rem 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .login-brand {
      text-align: center;
      margin-bottom: 2rem;
    }

    .brand-badge {
      display: inline-block;
      font-size: 0.75rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      font-weight: 700;
      color: #e09f3e;
      background: rgba(224, 159, 62, 0.12);
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      border: 1px solid rgba(224, 159, 62, 0.3);
      margin-bottom: 0.75rem;
    }

    .brand-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0.25rem 0 0.5rem;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 0.9rem;
      color: #94a3b8;
      margin: 0;
    }

    .login-error {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e1;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      color: #64748b;
      pointer-events: none;
    }

    .input-container input {
      width: 100%;
      background: #0b1216;
      border: 1px solid #233440;
      border-radius: 8px;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      color: #f8fafc;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .input-container input:focus {
      outline: none;
      border-color: #e09f3e;
      box-shadow: 0 0 0 3px rgba(224, 159, 62, 0.15);
    }

    .btn-toggle-pw {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 0.75rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
    }

    .credentials-hint {
      background: rgba(255, 255, 255, 0.03);
      border: 1px dashed rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.65rem 0.85rem;
      font-size: 0.78rem;
      color: #94a3b8;
      line-height: 1.45;
    }

    .credentials-hint code {
      color: #e09f3e;
      background: rgba(224, 159, 62, 0.08);
      padding: 0.1rem 0.35rem;
      border-radius: 4px;
      font-family: monospace;
    }

    .btn-login {
      background: #c85a32;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 0.85rem 1.25rem;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }

    .btn-login:hover:not(:disabled) {
      background: #b34a24;
      transform: translateY(-1px);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .login-footer {
      margin-top: 1.75rem;
      text-align: center;
    }

    .back-link {
      color: #94a3b8;
      font-size: 0.875rem;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #e09f3e;
    }
  `]
})
export class AdminLoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  username = 'admin@valledelsondondo.com';
  password = '';
  showPassword = signal(false);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Por favor complete usuario y contraseña.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
          this.router.navigateByUrl(returnUrl);
        } else {
          this.errorMessage.set(res.message || 'Credenciales no válidas.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Error al comunicarse con el servidor. Intente nuevamente.');
      }
    });
  }
}
