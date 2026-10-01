import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminContactMessage } from '../../models/admin.model';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="messages-page">
      <div class="page-header">
        <div class="page-header-titles">
          <div class="page-eyebrow">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Atención al Viajero</span>
          </div>
          <h1 class="page-title">Bandeja de Contacto</h1>
          <p class="page-desc">Consultas y mensajes recibidos a través del formulario general del portal web</p>
        </div>
      </div>

      <div class="messages-list">
        <div 
          *ngFor="let msg of messages()" 
          class="message-card" 
          [class.unread]="!msg.isRead"
        >
          <div class="msg-header">
            <div class="sender-info">
              <span class="sender-name">{{ msg.name }}</span>
              <span class="sender-contacts">{{ msg.email }} <span class="sep">•</span> {{ msg.phone }}</span>
            </div>
            <div class="msg-meta">
              <span class="msg-date">{{ msg.createdAt | date:'dd MMM yyyy, HH:mm' }}</span>
              <span class="status-pill" [ngClass]="msg.isRead ? 'hidden' : 'pending'">
                {{ msg.isRead ? 'Leído' : 'Nuevo' }}
              </span>
            </div>
          </div>

          <div class="msg-subject">
            <span class="subject-tag">Asunto:</span>
            <strong>{{ msg.subject }}</strong>
          </div>

          <p class="msg-body">{{ msg.message }}</p>

          <div class="msg-actions">
            <button class="btn-msg-action" (click)="onToggleRead(msg)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>{{ msg.isRead ? 'Marcar como no leído' : 'Marcar como leído' }}</span>
            </button>

            <a *ngIf="msg.phone" [href]="'https://wa.me/' + cleanPhone(msg.phone)" target="_blank" class="btn-msg-action btn-wa">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z"></path>
              </svg>
              <span>WhatsApp</span>
            </a>

            <a [href]="'mailto:' + msg.email + '?subject=Respuesta:%20' + msg.subject" class="btn-msg-action">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Responder por Correo</span>
            </a>

            <button class="btn-msg-action btn-del" (click)="onDelete(msg.id)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        <div *ngIf="messages().length === 0" class="empty-inbox">
          No hay consultas en la bandeja de entrada.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messages-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-card {
      background: var(--adm-card);
      border: 1px solid var(--adm-border);
      border-radius: var(--adm-r-lg);
      padding: 1.35rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: all 0.2s ease;
      box-shadow: var(--adm-shadow-card);
    }

    .message-card.unread {
      border-left: 3px solid var(--adm-clay);
      background: var(--adm-card-elevated);
    }

    .msg-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.5rem;
      border-bottom: 1px solid var(--adm-border-subtle);
      padding-bottom: 0.75rem;
    }

    .sender-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .sender-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--adm-text-title);
    }

    .sender-contacts {
      font-size: 0.78rem;
      color: var(--adm-text-muted);
    }

    .sender-contacts .sep {
      color: var(--adm-text-subtle);
      margin: 0 0.25rem;
    }

    .msg-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .msg-date {
      font-size: 0.75rem;
      color: var(--adm-text-muted);
    }

    .msg-subject {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--adm-text-title);
    }

    .subject-tag {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--adm-text-muted);
      font-weight: 600;
    }

    .msg-body {
      color: var(--adm-text-body);
      font-size: 0.88rem;
      line-height: 1.6;
      margin: 0;
      white-space: pre-line;
      background: rgba(0, 0, 0, 0.15);
      padding: 0.95rem 1.1rem;
      border-radius: var(--adm-r-sm);
      border: 1px solid var(--adm-border-subtle);
    }

    .msg-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .btn-msg-action {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: transparent;
      border: 1px solid var(--adm-border);
      color: var(--adm-text-body);
      font-size: 0.78rem;
      font-weight: 600;
      font-family: inherit;
      padding: 0.45rem 0.85rem;
      border-radius: var(--adm-r-sm);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-msg-action:hover {
      background: var(--adm-card-hover);
      color: var(--adm-text-title);
      border-color: var(--adm-border-hover);
    }

    .btn-msg-action.btn-wa {
      background: var(--adm-whatsapp-bg);
      color: var(--adm-whatsapp);
      border-color: var(--adm-whatsapp-border);
    }

    .btn-msg-action.btn-wa:hover {
      background: var(--adm-whatsapp);
      color: #ffffff;
    }

    .btn-msg-action.btn-del:hover {
      background: var(--adm-red-surface);
      border-color: var(--adm-red-border);
      color: var(--adm-red);
    }

    .empty-inbox {
      text-align: center;
      padding: 3.5rem 1.5rem;
      background: var(--adm-card);
      border: 1px dashed var(--adm-border);
      border-radius: var(--adm-r-lg);
      color: var(--adm-text-muted);
      font-size: 0.88rem;
    }
  `]
})
export class AdminMessagesComponent implements OnInit {
  private adminService = inject(AdminService);
  messages = signal<AdminContactMessage[]>([]);

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.adminService.getContactMessages().subscribe((res: AdminContactMessage[]) => {
      this.messages.set(res);
    });
  }

  onToggleRead(msg: AdminContactMessage): void {
    this.adminService.toggleMessageRead(msg.id).subscribe(() => {
      this.loadMessages();
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Eliminar definitivamente este mensaje de contacto?')) {
      this.adminService.deleteMessage(id).subscribe(() => {
        this.loadMessages();
      });
    }
  }

  cleanPhone(phone: string): string {
    return phone ? phone.replace(/[^0-9]/g, '') : '';
  }
}
