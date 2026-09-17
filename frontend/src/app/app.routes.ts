import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TourDetailComponent } from './pages/tour-detail/tour-detail.component';

export const routes: Routes = [
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
    path: '**',
    redirectTo: ''
  }
];
