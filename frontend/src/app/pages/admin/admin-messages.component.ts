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
        <div>
          <h1 class="page-title">Bandeja de Contacto</h1>
          <p class="page-desc">Consultas recibidas a través del formulario general de la web</p>
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
              <span class="sender-contacts">{{ msg.email }} • {{ msg.phone }}</span>
            </div>
            <div class="msg-meta">
              <span class="msg-date">{{ msg.createdAt | date:'medium' }}</span>
              <span class="read-status" [class.is-unread]="!msg.isRead">
                {{ msg.isRead ? 'Leído' : 'Nuevo' }}
              </span>
            </div>
          </div>

          <div class="msg-subject">
            <strong>Asunto:</strong> {{ msg.subject }}
          </div>

          <p class="msg-body">{{ msg.message }}</p>

          <div class="msg-actions">
            <button class="btn-action-msg" (click)="onToggleRead(msg)">
              {{ msg.isRead ? 'Marcar como no leído' : 'Marcar como leído' }}
            </button>

            <a *ngIf="msg.phone" [href]="'https://wa.me/' + cleanPhone(msg.phone)" target="_blank" class="btn-action-msg btn-wa">
              Responder por WhatsApp
            </a>

            <a [href]="'mailto:' + msg.email + '?subject=Respuesta:%20' + msg.subject" class="btn-action-msg btn-email">
              Responder por Correo
            </a>

            <button class="btn-action-msg btn-del" (click)="onDelete(msg.id)">
              Eliminar
            </button>
          </div>
        </div>

        <div *ngIf="messages().length === 0" class="empty-inbox">
          No hay mensajes en la bandeja de entrada.
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

    .page-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 0.25rem;
      letter-spacing: -0.02em;
    }

    .page-desc {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 0;
    }

    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message-card {
      background: #121c23;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      transition: all 0.2s ease;
    }

    .message-card.unread {
      border-left: 4px solid #e09f3e;
      background: #15222b;
    }

    .msg-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.65rem;
    }

    .sender-info {
      display: flex;
      flex-direction: column;
    }

    .sender-name {
      font-size: 1rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .sender-contacts {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .msg-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .msg-date {
      font-size: 0.75rem;
      color: #64748b;
    }

    .read-status {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }

    .read-status.is-unread {
      background: rgba(224, 159, 62, 0.2);
      color: #e09f3e;
    }

    .msg-subject {
      font-size: 0.9rem;
      color: #e2e8f0;
    }

    .msg-body {
      font-size: 0.875rem;
      color: #cbd5e1;
      line-height: 1.5;
      margin: 0;
      background: rgba(0, 0, 0, 0.2);
      padding: 0.85rem;
      border-radius: 8px;
    }

    .msg-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.25rem;
    }

    .btn-action-msg {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-action-msg:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #f8fafc;
    }

    .btn-wa {
      background: rgba(37, 211, 102, 0.15);
      border-color: rgba(37, 211, 102, 0.3);
      color: #4ade80;
    }

    .btn-wa:hover {
      background: #25D366;
      color: #ffffff;
    }

    .btn-email {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.3);
      color: #60a5fa;
    }

    .btn-email:hover {
      background: #3b82f6;
      color: #ffffff;
    }

    .btn-del {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.25);
      color: #f87171;
    }

    .btn-del:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .empty-inbox {
      text-align: center;
      padding: 3rem;
      color: #64748b;
      background: #121c23;
      border-radius: 12px;
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
    this.adminService.getContactMessages().subscribe(res => {
      this.messages.set(res);
    });
  }

  onToggleRead(msg: AdminContactMessage): void {
    this.adminService.toggleMessageRead(msg.id).subscribe(() => {
      msg.isRead = !msg.isRead;
    });
  }

  onDelete(id: number): void {
    if (confirm('¿Deseas eliminar este mensaje de contacto?')) {
      this.adminService.deleteMessage(id).subscribe(() => {
        this.loadMessages();
      });
    }
  }

  cleanPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 9 && !digits.startsWith('51')) {
      return '51' + digits;
    }
    return digits;
  }
}
