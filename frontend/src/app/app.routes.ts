import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TourDetailComponent } from './pages/tour-detail/tour-detail.component';
import { PaymentStatusComponent } from './pages/payment-status/payment-status.component';
import { AdminLoginComponent } from './pages/admin/admin-login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminBookingsComponent } from './pages/admin/admin-bookings.component';
import { AdminToursComponent } from './pages/admin/admin-tours.component';
import { AdminMessagesComponent } from './pages/admin/admin-messages.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public Routes
  {
    path: '',
    component: HomeComponent,
    title: 'Valle del Sondondo Expeditions | Tours y Circuitos en Ayacucho'
  },
  {
    path: 'tour/:slug',
    component: TourDetailComponent,
    title: 'Detalle de Tour | Valle del Sondondo Expeditions'
  },
  {
    path: 'pago/resultado',
    component: PaymentStatusComponent,
    title: 'Estado del Pago | Valle del Sondondo Expeditions'
  },
  {
    path: 'pago/:status',
    component: PaymentStatusComponent,
    title: 'Resultado de Pago | Valle del Sondondo Expeditions'
  },

  // Admin Routes
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    title: 'Iniciar Sesión | Panel de Control Valle del Sondondo'
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent,
        title: 'Dashboard | Panel de Control'
      },
      {
        path: 'reservas',
        component: AdminBookingsComponent,
        title: 'Reservas & Cotizaciones | Panel de Control'
      },
      {
        path: 'tours',
        component: AdminToursComponent,
        title: 'Gestión de Tours | Panel de Control'
      },
      {
        path: 'mensajes',
        component: AdminMessagesComponent,
        title: 'Bandeja de Contacto | Panel de Control'
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
