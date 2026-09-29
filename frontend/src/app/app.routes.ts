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
import { AdminTestimonialsComponent } from './pages/admin/admin-testimonials.component';
import { AdminGalleryComponent } from './pages/admin/admin-gallery.component';
import { AdminHotelComponent } from './pages/admin/admin-hotel.component';
import { TerminosCondicionesComponent } from './pages/legal/terminos-condiciones.component';
import { PoliticaCancelacionComponent } from './pages/legal/politica-cancelacion.component';
import { PoliticaPrivacidadComponent } from './pages/legal/politica-privacidad.component';
import { LibroReclamacionesComponent } from './pages/legal/libro-reclamaciones.component';
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

  // Legal & Compliance Routes (INDECOPI / Ley 29733)
  {
    path: 'terminos-y-condiciones',
    component: TerminosCondicionesComponent,
    title: 'Términos y Condiciones | Valle del Sondondo Expeditions'
  },
  {
    path: 'politica-de-cancelacion',
    component: PoliticaCancelacionComponent,
    title: 'Políticas de Cancelación y Reembolso | Valle del Sondondo Expeditions'
  },
  {
    path: 'politica-de-privacidad',
    component: PoliticaPrivacidadComponent,
    title: 'Política de Privacidad | Valle del Sondondo Expeditions'
  },
  {
    path: 'libro-de-reclamaciones',
    component: LibroReclamacionesComponent,
    title: 'Libro de Reclamaciones Virtual | Valle del Sondondo Expeditions'
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
        path: 'hospedaje',
        component: AdminHotelComponent,
        title: 'Gestión de Hospedaje & Habitaciones | Panel de Control'
      },
      {
        path: 'mensajes',
        component: AdminMessagesComponent,
        title: 'Bandeja de Contacto | Panel de Control'
      },
      {
        path: 'testimonios',
        component: AdminTestimonialsComponent,
        title: 'Testimonios & Reseñas | Panel de Control'
      },
      {
        path: 'galeria',
        component: AdminGalleryComponent,
        title: 'Galería Multimedia | Panel de Control'
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];
