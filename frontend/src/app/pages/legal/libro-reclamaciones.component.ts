import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-libro-reclamaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, IconComponent],
  template: `
    <div class="legal-page">
      <header class="legal-hero">
        <div class="container hero-content">
          <a routerLink="/" class="back-link">
            <app-icon name="arrow-left" [size]="18"></app-icon>
            <span>Volver al Inicio</span>
          </a>
          <div class="indecopi-badge">
            <span class="indecopi-text">Conforme a D.S. N° 011-2011-PCM & Ley N° 29571</span>
          </div>
          <h1>Libro de Reclamaciones Virtual</h1>
          <p class="hero-sub">Hoja de Reclamación Virtual para Consumidores y Usuarios</p>
        </div>
      </header>

      <main class="container legal-body">
        <!-- Tarjeta de Información del Proveedor -->
        <div class="supplier-card">
          <div class="supplier-header">
            <div>
              <h3>Valle del Sondondo Expeditions & Hospedaje Casa Grande</h3>
              <p>Operador Turístico & Servicios Hoteleros en Lucanas, Ayacucho</p>
            </div>
            <div class="book-number-badge">
              <span>LIBRO N°: <strong>001-2026</strong></span>
            </div>
          </div>
          <div class="supplier-details">
            <div><strong>Razón Comercial:</strong> Valle del Sondondo Expeditions</div>
            <div><strong>Dirección:</strong> Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú</div>
            <div><strong>Canal Oficial:</strong> miskichaskaperu@hotmail.com | +51 966 380 590</div>
            <div><strong>Fecha Actual:</strong> {{ todayDate | date:'dd/MM/yyyy' }}</div>
          </div>
        </div>

        <!-- Banner de Diferenciación Legal Reclamo vs Queja -->
        <div class="diff-banner">
          <div class="diff-col">
            <strong>📌 RECLAMO:</strong>
            <p>Disconformidad relacionada directamente a los productos o servicios contratados (rutas, guías, habitación, traslados).</p>
          </div>
          <div class="diff-col">
            <strong>💬 QUEJA:</strong>
            <p>Disconformidad que no incide directamente en el servicio contratado; malestar o descontento respecto a la atención recibida.</p>
          </div>
        </div>

        <!-- FORMULARIO O CONSTANCIA DE ENVÍO -->
        @if (!submittedReceipt) {
          <form [formGroup]="claimForm" (ngSubmit)="submitClaim()" class="claim-form">
            <!-- SECCIÓN 1: Identificación del Consumidor -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="step-num">1</span>
                <span>Identificación del Consumidor Reclamante</span>
              </h3>
              
              <div class="grid-2">
                <div class="form-group">
                  <label>Nombre y Apellidos Completos *</label>
                  <input type="text" formControlName="fullName" placeholder="Ej. Juan Pérez Quispe" class="form-control">
                  @if (f['fullName'].touched && f['fullName'].invalid) {
                    <span class="err-msg">El nombre completo es obligatorio</span>
                  }
                </div>

                <div class="form-group">
                  <label>Tipo de Documento *</label>
                  <select formControlName="docType" class="form-control">
                    <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="CarnetExtranjeria">Carné de Extranjería</option>
                  </select>
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label>Número de Documento *</label>
                  <input type="text" formControlName="docNumber" placeholder="Número de DNI / Pasaporte" class="form-control">
                  @if (f['docNumber'].touched && f['docNumber'].invalid) {
                    <span class="err-msg">Ingrese el número de documento</span>
                  }
                </div>

                <div class="form-group">
                  <label>Teléfono Celular / WhatsApp *</label>
                  <input type="tel" formControlName="phone" placeholder="Ej. 966380590" class="form-control">
                  @if (f['phone'].touched && f['phone'].invalid) {
                    <span class="err-msg">Ingrese un número telefónico</span>
                  }
                </div>

                <div class="form-group">
                  <label>Correo Electrónico *</label>
                  <input type="email" formControlName="email" placeholder="ejemplo@correo.com" class="form-control">
                  @if (f['email'].touched && f['email'].invalid) {
                    <span class="err-msg">Correo electrónico válido requerido</span>
                  }
                </div>
              </div>

              <div class="form-group">
                <label>Domicilio (Dirección, Distrito, Ciudad) *</label>
                <input type="text" formControlName="address" placeholder="Ej. Av. Los Próceres 123, Huamanga, Ayacucho" class="form-control">
                @if (f['address'].touched && f['address'].invalid) {
                  <span class="err-msg">La dirección domiciliaria es obligatoria</span>
                }
              </div>

              <div class="form-group is-minor-wrap">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="isMinor">
                  <span>El reclamante es menor de edad (llenar apoderado)</span>
                </label>
              </div>

              @if (claimForm.get('isMinor')?.value) {
                <div class="form-group">
                  <label>Nombre del Padre, Madre o Apoderado</label>
                  <input type="text" formControlName="guardianName" placeholder="Nombres y DNI del representante legal" class="form-control">
                </div>
              }
            </div>

            <!-- SECCIÓN 2: Identificación del Bien Contratado -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="step-num">2</span>
                <span>Identificación del Bien Contratado</span>
              </h3>

              <div class="grid-3">
                <div class="form-group">
                  <label>Tipo de Bien *</label>
                  <select formControlName="contractType" class="form-control">
                    <option value="Servicio">Servicio Turístico / Tour / Trekking</option>
                    <option value="Producto">Alojamiento / Hospedaje Casa Grande</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Monto Reclamado (Opcional)</label>
                  <input type="text" formControlName="amount" placeholder="Ej. S/ 350.00 o $ 95.00" class="form-control">
                </div>

                <div class="form-group">
                  <label>Código de Reserva / Voucher (Opcional)</label>
                  <input type="text" formControlName="voucherCode" placeholder="Ej. VS-2026-001 o HPC-001" class="form-control">
                </div>
              </div>

              <div class="form-group">
                <label>Descripción del Tour o Habitación Contratada *</label>
                <input type="text" formControlName="itemDescription" placeholder="Ej. Tour Expedición Valle del Sondondo 3D2N / Habitación Matrimonial" class="form-control">
                @if (f['itemDescription'].touched && f['itemDescription'].invalid) {
                  <span class="err-msg">Describa el servicio contratado</span>
                }
              </div>
            </div>

            <!-- SECCIÓN 3: Detalle de la Reclamación -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="step-num">3</span>
                <span>Detalle de la Reclamación y Pedido del Consumidor</span>
              </h3>

              <div class="claim-type-selector">
                <label class="radio-card" [class.selected]="f['claimType'].value === 'Reclamo'">
                  <input type="radio" formControlName="claimType" value="Reclamo">
                  <div class="radio-content">
                    <span class="radio-title">RECLAMO</span>
                    <span class="radio-desc">Disconformidad con el servicio o producto prestado</span>
                  </div>
                </label>

                <label class="radio-card" [class.selected]="f['claimType'].value === 'Queja'">
                  <input type="radio" formControlName="claimType" value="Queja">
                  <div class="radio-content">
                    <span class="radio-title">QUEJA</span>
                    <span class="radio-desc">Disconformidad con la atención o trato al cliente</span>
                  </div>
                </label>
              </div>

              <div class="form-group">
                <label>Detalle de los Hechos Suscitados *</label>
                <textarea formControlName="detail" rows="4" placeholder="Explique de manera clara y cronológica lo sucedido durante su experiencia..." class="form-control"></textarea>
                @if (f['detail'].touched && f['detail'].invalid) {
                  <span class="err-msg">El detalle de los hechos es requerido (mínimo 20 caracteres)</span>
                }
              </div>

              <div class="form-group">
                <label>Pedido Concreto del Consumidor *</label>
                <textarea formControlName="consumerRequest" rows="3" placeholder="Indique qué solución, rectificación o compensación solicita a la empresa..." class="form-control"></textarea>
                @if (f['consumerRequest'].touched && f['consumerRequest'].invalid) {
                  <span class="err-msg">Por favor indique qué solución espera</span>
                }
              </div>
            </div>

            <!-- DECLARACIÓN JURADA -->
            <div class="legal-statement">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="acceptedTerms">
                <span>Declaro que todos los datos consignados en la presente hoja de reclamación son verídicos, y autorizo a Valle del Sondondo Expeditions a contactarme formalmente mediante el correo electrónico o teléfono proporcionados conforme a la Ley N° 29571 y Ley N° 29733.</span>
              </label>
              @if (f['acceptedTerms'].touched && f['acceptedTerms'].invalid) {
                <span class="err-msg">Debe declarar la veracidad de la información para presentar el reclamo</span>
              }
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="claimForm.invalid || isSubmitting" class="btn-submit">
                @if (isSubmitting) {
                  <span>Enviando Hoja de Reclamación...</span>
                } @else {
                  <app-icon name="send" [size]="18"></app-icon>
                  <span>Enviar Hoja de Reclamación Virtual</span>
                }
              </button>
            </div>
          </form>
        } @else {
          <!-- CONSTANCIA GENERADA DE HOJA DE RECLAMACIÓN -->
          <div class="receipt-card">
            <div class="receipt-header">
              <div class="receipt-icon">
                <app-icon name="check-circle" [size]="48" stroke="#16A34A"></app-icon>
              </div>
              <h2>Hoja de Reclamación Registrada con Éxito</h2>
              <p>Conforme a la Ley N° 29571 y el D.S. N° 011-2011-PCM del INDECOPI</p>
              <div class="claim-code-pill">
                CÓDIGO DE REGISTRO: <strong>{{ submittedReceipt.code }}</strong>
              </div>
            </div>

            <div class="receipt-body">
              <div class="receipt-row">
                <span class="label">Fecha y Hora de Emisión:</span>
                <span class="val">{{ submittedReceipt.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Consumidor Reclamante:</span>
                <span class="val">{{ submittedReceipt.fullName }} ({{ submittedReceipt.docType }}: {{ submittedReceipt.docNumber }})</span>
              </div>
              <div class="receipt-row">
                <span class="label">Correo / Teléfono:</span>
                <span class="val">{{ submittedReceipt.email }} | {{ submittedReceipt.phone }}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Tipo de Solicitud:</span>
                <span class="val highlight">{{ submittedReceipt.claimType | uppercase }}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Bien / Servicio Contratado:</span>
                <span class="val">{{ submittedReceipt.itemDescription }}</span>
              </div>
              <div class="receipt-row">
                <span class="label">Pedido del Consumidor:</span>
                <span class="val">{{ submittedReceipt.consumerRequest }}</span>
              </div>
            </div>

            <div class="receipt-legal-note">
              <app-icon name="info" [size]="20" stroke="#0284C7"></app-icon>
              <p>
                <strong>Plazo de Respuesta Legal:</strong> De conformidad con la Ley N° 31435 que modifica el Código de Protección y Defensa del Consumidor, el proveedor dará respuesta formal a su queja o reclamo en un plazo <strong>no mayor a quince (15) días hábiles</strong> improrrogables, remitida al correo electrónico consignado.
              </p>
            </div>

            <div class="receipt-actions">
              <button (click)="printReceipt()" class="btn-print">
                <app-icon name="printer" [size]="18"></app-icon>
                <span>Imprimir / Guardar Constancia en PDF</span>
              </button>
              <a [href]="whatsAppReceiptUrl" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
                <app-icon name="whatsapp" [size]="18"></app-icon>
                <span>Enviar Notificación a la Agencia</span>
              </a>
              <button (click)="resetForm()" class="btn-new">
                <span>Registrar otra reclamación</span>
              </button>
            </div>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .legal-page {
      background: var(--bg-primary, #FAF7F2);
      min-height: 100vh;
      padding-bottom: 5rem;
    }
    .legal-hero {
      background: linear-gradient(135deg, #1C1917 0%, #292524 100%);
      color: #FFFFFF;
      padding: 4rem 0 3rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hero-content {
      max-width: 900px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #E7E5E4;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 1.5rem;
      transition: color 0.2s ease;
    }
    .back-link:hover {
      color: var(--accent-clay, #C05621);
    }
    .indecopi-badge {
      display: inline-block;
      background: rgba(217, 119, 6, 0.2);
      border: 1px solid rgba(217, 119, 6, 0.4);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      margin-bottom: 0.85rem;
    }
    .indecopi-text {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #FBBF24;
      font-weight: 700;
    }
    .legal-hero h1 {
      font-family: var(--font-display, serif);
      font-size: 2.2rem;
      line-height: 1.25;
      margin-bottom: 0.5rem;
    }
    .hero-sub {
      color: #A8A29E;
      font-size: 1.05rem;
    }
    .legal-body {
      max-width: 900px;
      margin-top: -2rem;
    }
    .supplier-card {
      background: #FFFFFF;
      border-radius: 1rem;
      padding: 1.75rem 2rem;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
      border: 1px solid #E7E5E4;
      margin-bottom: 1.5rem;
    }
    .supplier-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #F5F5F4;
      margin-bottom: 1rem;
    }
    .supplier-header h3 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1C1917;
      margin-bottom: 0.25rem;
    }
    .supplier-header p {
      font-size: 0.88rem;
      color: #78716C;
    }
    .book-number-badge {
      background: #FEF3C7;
      color: #92400E;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
    }
    .supplier-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.75rem;
      font-size: 0.85rem;
      color: #44403C;
    }
    .diff-banner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }
    .diff-col strong {
      font-size: 0.85rem;
      color: #0F172A;
      display: block;
      margin-bottom: 0.35rem;
    }
    .diff-col p {
      font-size: 0.83rem;
      color: #475569;
      line-height: 1.45;
      margin: 0;
    }
    .claim-form {
      background: #FFFFFF;
      border-radius: 1rem;
      padding: 2.5rem;
      border: 1px solid #E7E5E4;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    }
    .form-section {
      margin-bottom: 2.5rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #F5F5F4;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1C1917;
      margin-bottom: 1.5rem;
    }
    .step-num {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #C05621;
      color: #FFFFFF;
      border-radius: 50%;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.25rem;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #44403C;
      margin-bottom: 0.4rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 0.92rem;
      border: 1.5px solid #D6D3D1;
      border-radius: 0.5rem;
      background: #FAFAF9;
      color: #1C1917;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .form-control:focus {
      border-color: #C05621;
      background: #FFFFFF;
      outline: none;
      box-shadow: 0 0 0 3px rgba(192, 86, 33, 0.15);
    }
    .is-minor-wrap {
      margin-top: 0.5rem;
    }
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      font-size: 0.88rem;
      color: #44403C;
      cursor: pointer;
      line-height: 1.5;
    }
    .checkbox-label input {
      margin-top: 0.2rem;
      accent-color: #C05621;
      width: 18px;
      height: 18px;
    }
    .err-msg {
      display: block;
      color: #DC2626;
      font-size: 0.78rem;
      margin-top: 0.35rem;
      font-weight: 500;
    }
    .claim-type-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .radio-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border: 2px solid #E7E5E4;
      border-radius: 0.75rem;
      padding: 1.1rem;
      cursor: pointer;
      background: #FAFAF9;
      transition: all 0.2s ease;
    }
    .radio-card input {
      accent-color: #C05621;
      width: 18px;
      height: 18px;
    }
    .radio-card.selected {
      border-color: #C05621;
      background: #FFF7ED;
    }
    .radio-title {
      display: block;
      font-weight: 700;
      font-size: 0.95rem;
      color: #1C1917;
    }
    .radio-desc {
      display: block;
      font-size: 0.8rem;
      color: #78716C;
      margin-top: 0.15rem;
    }
    .legal-statement {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }
    .btn-submit {
      width: 100%;
      background: #C05621;
      color: #FFFFFF;
      padding: 1rem 2rem;
      border-radius: 0.6rem;
      font-size: 1rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      transition: background 0.2s ease;
    }
    .btn-submit:hover:not(:disabled) {
      background: #9C4221;
    }
    .btn-submit:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    /* Constancia recibida */
    .receipt-card {
      background: #FFFFFF;
      border-radius: 1rem;
      padding: 3rem 2.5rem;
      border: 1px solid #E7E5E4;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
    }
    .receipt-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .receipt-icon {
      margin-bottom: 1rem;
    }
    .receipt-header h2 {
      font-family: var(--font-display, serif);
      font-size: 1.8rem;
      color: #1C1917;
      margin-bottom: 0.4rem;
    }
    .receipt-header p {
      color: #78716C;
      font-size: 0.95rem;
      margin-bottom: 1.25rem;
    }
    .claim-code-pill {
      display: inline-block;
      background: #DCFCE7;
      color: #166534;
      padding: 0.6rem 1.5rem;
      border-radius: 9999px;
      font-size: 1.05rem;
      border: 1px solid #86EFAC;
    }
    .receipt-body {
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.75rem;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 0.65rem 0;
      border-bottom: 1px dashed #CBD5E1;
      font-size: 0.9rem;
    }
    .receipt-row:last-child {
      border-bottom: none;
    }
    .receipt-row .label {
      color: #64748B;
      font-weight: 500;
    }
    .receipt-row .val {
      color: #0F172A;
      font-weight: 600;
      text-align: right;
      max-width: 60%;
    }
    .receipt-row .val.highlight {
      color: #C05621;
    }
    .receipt-legal-note {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: #F0F9FF;
      border-left: 4px solid #0284C7;
      border-radius: 0.5rem;
      padding: 1.25rem;
      margin-bottom: 2rem;
      font-size: 0.88rem;
      color: #0369A1;
      line-height: 1.55;
    }
    .receipt-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .btn-print {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #1E293B;
      color: #FFFFFF;
      padding: 0.85rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.92rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }
    .btn-whatsapp {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: #25D366;
      color: #FFFFFF;
      padding: 0.85rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 0.92rem;
      font-weight: 600;
      text-decoration: none;
    }
    .btn-new {
      width: 100%;
      background: transparent;
      border: 1px solid #CBD5E1;
      color: #475569;
      padding: 0.65rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    @media (max-width: 768px) {
      .diff-banner, .grid-2, .grid-3, .claim-type-selector {
        grid-template-columns: 1fr;
      }
      .claim-form, .receipt-card {
        padding: 1.75rem 1.25rem;
      }
      .receipt-row {
        flex-direction: column;
        gap: 0.25rem;
      }
      .receipt-row .val {
        text-align: left;
        max-width: 100%;
      }
      .receipt-actions {
        flex-direction: column;
      }
    }
    @media print {
      :host {
        display: block;
        background: #FFFFFF !important;
        color: #000000 !important;
      }
      .legal-page {
        background: #FFFFFF !important;
        padding: 0 !important;
      }
      .legal-hero,
      .back-link,
      .supplier-card,
      .diff-banner,
      .receipt-actions,
      .btn-new,
      .legal-banner {
        display: none !important;
      }
      .legal-body {
        max-width: 100% !important;
        margin-top: 0 !important;
        padding: 0 !important;
      }
      .receipt-card {
        border: 2px solid #000000 !important;
        box-shadow: none !important;
        padding: 1.5rem !important;
        page-break-inside: avoid;
      }
      .receipt-badge {
        background: #F0FDF4 !important;
        border: 1px solid #16A34A !important;
        color: #15803D !important;
      }
      .receipt-block {
        border-color: #CBD5E1 !important;
      }
      .val {
        color: #000000 !important;
      }
    }
  `]
})
export class LibroReclamacionesComponent {
  private fb = inject(FormBuilder);

  public todayDate = new Date();
  public isSubmitting = false;
  public submittedReceipt: any = null;

  public claimForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    docType: ['DNI', Validators.required],
    docNumber: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    isMinor: [false],
    guardianName: [''],
    contractType: ['Servicio', Validators.required],
    amount: [''],
    voucherCode: [''],
    itemDescription: ['', [Validators.required, Validators.minLength(5)]],
    claimType: ['Reclamo', Validators.required],
    detail: ['', [Validators.required, Validators.minLength(20)]],
    consumerRequest: ['', [Validators.required, Validators.minLength(10)]],
    acceptedTerms: [false, Validators.requiredTrue]
  });

  get f() {
    return this.claimForm.controls;
  }

  get whatsAppReceiptUrl(): string {
    if (!this.submittedReceipt) return '#';
    const text = encodeURIComponent(
      `*CONSTANCIA DE HOJA DE RECLAMACIÓN*\n` +
      `Código: *${this.submittedReceipt.code}*\n` +
      `Consumidor: *${this.submittedReceipt.fullName}*\n` +
      `Doc: ${this.submittedReceipt.docType} ${this.submittedReceipt.docNumber}\n` +
      `Tipo: ${this.submittedReceipt.claimType}\n` +
      `Bien: ${this.submittedReceipt.itemDescription}\n\n` +
      `He registrado mi hoja de reclamación virtual conforme a ley.`
    );
    return `https://wa.me/51966380590?text=${text}`;
  }

  submitClaim() {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    // Generar código correlativo formal
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const code = `LR-${new Date().getFullYear()}-${randomDigits}`;

    setTimeout(() => {
      this.submittedReceipt = {
        ...this.claimForm.value,
        code,
        timestamp: new Date()
      };
      this.isSubmitting = false;
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }, 600);
  }

  printReceipt() {
    window.print();
  }

  resetForm() {
    this.submittedReceipt = null;
    this.claimForm.reset({
      docType: 'DNI',
      contractType: 'Servicio',
      claimType: 'Reclamo',
      isMinor: false,
      acceptedTerms: false
    });
  }
}
