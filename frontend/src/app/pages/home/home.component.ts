import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TourSummary, Category, Testimonial, AgencyInfo } from '../../models/tour.model';
import { TourService } from '../../services/tour.service';
import { HotelService } from '../../services/hotel.service';
import { HotelInfo, HotelRoom } from '../../models/hotel.model';
import { HeroComponent } from '../../components/hero/hero.component';
import { TourListComponent } from '../../components/tour-list/tour-list.component';
import { ValleyExperienceComponent } from '../../components/experience/valley-experience.component';
import { HotelRoomsComponent } from '../../components/hotel-rooms/hotel-rooms.component';
import { ConnectivityGuideComponent } from '../../components/connectivity/connectivity-guide.component';
import { WhyUsComponent } from '../../components/why-us/why-us.component';
import { TestimonialsComponent } from '../../components/testimonials/testimonials.component';
import { ContactSectionComponent } from '../../components/contact/contact.component';
import { BookingModalComponent } from '../../components/booking-modal/booking-modal.component';
import { PaymentModalComponent, PaymentTarget } from '../../components/payment-modal/payment-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    TourListComponent,
    ValleyExperienceComponent,
    HotelRoomsComponent,
    ConnectivityGuideComponent,
    WhyUsComponent,
    TestimonialsComponent,
    ContactSectionComponent,
    BookingModalComponent,
    PaymentModalComponent
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

      <!-- 3. Experiencia Sondondo: Los 6 Atractivos Canónicos -->
      <app-valley-experience></app-valley-experience>

      <!-- 4. Habitaciones & Alojamiento: Hotel Punto Clave -->
      @if (hotelInfo()) {
        <app-hotel-rooms 
          [hotelInfo]="hotelInfo()!"
          (bookWithMercadoPago)="openRoomPayment($event)">
        </app-hotel-rooms>
      }

      <!-- 5. Conectividad & Guía Práctica del Viajero -->
      <app-connectivity-guide></app-connectivity-guide>

      <!-- 6. Por Qué Elegirnos (Safe Travels, Guías Nativos) -->
      <app-why-us></app-why-us>

      <!-- 7. Testimonios Reales -->
      <app-testimonials 
        [testimonials]="testimonials()">
      </app-testimonials>

      <!-- 8. Sección de Contacto -->
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
          (payMercadoPago)="openTourPayment($event)"
          (close)="closeBooking()">
        </app-booking-modal>
      }

      <!-- Payment Modal with Mercado Pago -->
      @if (selectedPaymentTarget()) {
        <app-payment-modal
          [target]="selectedPaymentTarget()!"
          [whatsAppNumber]="agency()?.whatsappNumber || '51966380590'"
          (close)="closePaymentModal()">
        </app-payment-modal>
      }
    </main>
  `
})
export class HomeComponent implements OnInit {
  private tourService = inject(TourService);
  private hotelService = inject(HotelService);

  tours = signal<TourSummary[]>([]);
  categories = signal<Category[]>([]);
  testimonials = signal<Testimonial[]>([]);
  agency = signal<AgencyInfo | null>(null);
  hotelInfo = signal<HotelInfo | null>(null);

  selectedTourForBooking = signal<TourSummary | null>(null);
  selectedPaymentTarget = signal<PaymentTarget | null>(null);

  ngOnInit(): void {
    this.tourService.getTours().subscribe(data => this.tours.set(data));
    this.tourService.getCategories().subscribe(data => this.categories.set(data));
    this.tourService.getTestimonials().subscribe(data => this.testimonials.set(data));
    this.tourService.getAgencyInfo().subscribe(data => this.agency.set(data));
    this.hotelService.getHotelInfo().subscribe(data => this.hotelInfo.set(data));
  }

  openBooking(tour: TourSummary): void {
    this.selectedTourForBooking.set(tour);
  }

  closeBooking(): void {
    this.selectedTourForBooking.set(null);
  }

  openRoomPayment(event: { room: HotelRoom; amount: number }): void {
    this.selectedPaymentTarget.set({
      type: 'HotelRoom',
      id: event.room.id,
      title: `${event.room.title} (Hotel Punto Clave)`,
      unitPriceSoles: event.amount,
      subtitle: event.room.bedConfiguration,
      image: event.room.mainImage
    });
  }

  openTourPayment(tour: TourSummary): void {
    this.selectedTourForBooking.set(null);
    this.selectedPaymentTarget.set({
      type: 'Tour',
      id: tour.id,
      title: tour.title,
      unitPriceSoles: tour.priceSoles > 0 ? tour.priceSoles : 140,
      subtitle: tour.duration,
      image: tour.mainImageUrl
    });
  }

  closePaymentModal(): void {
    this.selectedPaymentTarget.set(null);
  }
}
