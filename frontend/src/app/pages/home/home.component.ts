import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourSummary, Category, Testimonial, AgencyInfo } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { HeroComponent } from '../../components/hero/hero.component';
import { TourListComponent } from '../../components/tour-list/tour-list.component';
import { ValleyExperienceComponent } from '../../components/experience/valley-experience.component';
import { WhyUsComponent } from '../../components/why-us/why-us.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { ContactSectionComponent } from '../../components/contact/contact.component';
import { BookingModalComponent } from '../../components/booking-modal/booking-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    TourListComponent,
    ValleyExperienceComponent,
    WhyUsComponent,
    TestimonialsComponent,
    ContactSectionComponent,
    BookingModalComponent
  ],
  template: `
    <main>
      <!-- 1. Hero Section -->
      <app-hero 
        [whatsAppNumber]="agency()?.whatsappNumber || '51966380590'">
      </app-hero>

      <!-- 2. Tour List & Filter Catalog -->
      <app-tour-list 
        [allTours]="tours()" 
        [categories]="categories()"
        (onBook)="openBooking($event)">
      </app-tour-list>

      <!-- 3. Experiencia Sondondo: Los 4 Pilares -->
      <app-valley-experience></app-valley-experience>

      <!-- 4. Por Qué Elegirnos (Safe Travels, Guías Nativos) -->
      <app-why-us></app-why-us>

      <!-- 5. Testimonios Reales -->
      <app-testimonials 
        [testimonials]="testimonials()">
      </app-testimonials>

      <!-- 6. Sección de Contacto -->
      <app-contact-section
        [address]="agency()?.address || 'Av. Apu Chauccalla 402, Aucará, Lucanas, Ayacucho, Perú'"
        [phoneNumber]="agency()?.phoneNumber || '+51 966 380 590'"
        [email]="agency()?.email || 'miskichaskaperu@hotmail.com'"
        [whatsAppNumber]="agency()?.whatsappNumber || '51966380590'">
      </app-contact-section>

      <!-- Booking Modal Triggered from any Tour Card -->
      @if (selectedTourForBooking()) {
        <app-booking-modal 
          [tour]="selectedTourForBooking()" 
          [whatsAppNumber]="agency()?.whatsappNumber || '51966380590'"
          (close)="closeBooking()">
        </app-booking-modal>
      }
    </main>
  `
})
export class HomeComponent implements OnInit {
  private tourService = inject(TourService);

  tours = signal<TourSummary[]>([]);
  categories = signal<Category[]>([]);
  testimonials = signal<Testimonial[]>([]);
  agency = signal<AgencyInfo | null>(null);

  selectedTourForBooking = signal<TourSummary | null>(null);

  ngOnInit(): void {
    this.tourService.getTours().subscribe(data => this.tours.set(data));
    this.tourService.getCategories().subscribe(data => this.categories.set(data));
    this.tourService.getTestimonials().subscribe(data => this.testimonials.set(data));
    this.tourService.getAgencyInfo().subscribe(data => this.agency.set(data));
  }

  openBooking(tour: TourSummary): void {
    this.selectedTourForBooking.set(tour);
  }

  closeBooking(): void {
    this.selectedTourForBooking.set(null);
  }
}
