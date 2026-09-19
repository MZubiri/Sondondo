import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { HotelInfo, HotelRoom } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private fallbackHotelInfo: HotelInfo = {
    name: 'Hotel Punto Clave',
    stars: 3,
    tagline: 'Alojamiento oficial y descanso confortable con balcón privado, terraza e hidromasaje',
    address: 'Mz.B - Lt.6 Calle Los Ficus',
    city: 'Ica',
    postalCode: '11004',
    description: 'Punto Clave, que cuenta con jardín, terraza y servicio de habitaciones, es un hotel de 3 estrellas ubicado en Ica. Ofrece recepción abierta las 24 horas, WiFi gratuito de alta velocidad en todo el establecimiento y estacionamiento privado gratuito. Cada habitación dispone de balcón privado con vistas, baño privado con ducha y artículos de aseo de cortesía, TV de pantalla plana, escritorio y ropa de cama de primera calidad.',
    whatsAppNumber: environment.fallbackWhatsApp,
    checkInTime: 'A partir de las 13:00 hrs',
    checkOutTime: 'Hasta las 12:00 hrs',
    featuredAmenities: [
      { name: 'WiFi Gratis', icon: 'wifi', description: 'Conexión de alta velocidad en todo el alojamiento' },
      { name: 'Parking Privado Gratis', icon: 'parking', description: 'Estacionamiento seguro en el establecimiento' },
      { name: 'Recepción 24 Horas', icon: 'clock', description: 'Atención continua y asistencia a huéspedes' },
      { name: 'Balcón en Cada Habitación', icon: 'sun', description: 'Vistas exteriores y ventilación natural' },
      { name: 'Bañera de Hidromasaje', icon: 'bath', description: 'Relax y descanso en apartamentos dúplex' },
      { name: 'Terraza & Jardín', icon: 'compass', description: 'Áreas al aire libre para relajarse' },
      { name: 'Cocina Privada (Dúplex)', icon: 'coffee', description: 'Equipada para estancias prolongadas' },
      { name: 'TV Pantalla Plana', icon: 'tv', description: 'Entretenimiento y confort en cada habitación' }
    ],
    rooms: [
      {
        id: 1,
        title: 'Habitación Doble',
        slug: 'habitacion-doble',
        shortDescription: 'Acogedora habitación matrimonial con balcón exterior, TV y baño privado.',
        description: 'Habitación privada con 1 cama doble matrimonial, balcón privado, televisión de pantalla plana, escritorio de trabajo y baño privado equipado con ducha y artículos de aseo gratuitos. Perfecta para parejas o viajeros que buscan confort y descanso reparador.',
        capacityText: '2 Adultos',
        capacityAdults: 2,
        bedConfiguration: '1 Cama Doble',
        pricePerNightSoles: 85,
        pricePerNightUsd: 23,
        mainImage: '/assets/images/hotel/room_double.jpg',
        gallery: [
          '/assets/images/hotel/room_double.jpg',
          '/assets/images/hotel/room_double_alt.jpg',
          '/assets/images/hotel/hotel_bathroom.jpg',
          '/assets/images/hotel/hotel_terrace.jpg',
          '/assets/images/hotel/hotel_main.jpg'
        ],
        amenities: [
          'WiFi de alta velocidad gratuito',
          'Balcón privado con vista',
          'Baño privado con ducha y agua caliente',
          'Artículos de aseo gratuitos y toallas',
          'TV de pantalla plana',
          'Escritorio de trabajo',
          'Ropa de cama hipoalergénica',
          'Caja fuerte y enchufes cerca de la cama'
        ],
        highlights: ['1 cama doble', 'Balcón privado', 'Baño privado', 'WiFi gratis']
      },
      {
        id: 2,
        title: 'Habitación Triple Estándar',
        slug: 'habitacion-triple-estandar',
        shortDescription: 'Habitación amplia con 3 camas (2 individuales + 1 doble), balcón y baño privado.',
        description: 'Espaciosa y funcional, ideal para familias o grupos de amigos. Equipada con 2 camas individuales confortables y 1 cama doble, balcón privado exterior, TV de pantalla plana, escritorio y baño privado completo con ducha y amenidades de cortesía.',
        capacityText: 'Hasta 4 Huéspedes',
        capacityAdults: 4,
        bedConfiguration: '2 Camas Individuales + 1 Cama Doble',
        pricePerNightSoles: 130,
        pricePerNightUsd: 35,
        mainImage: '/assets/images/hotel/room_triple.jpg',
        gallery: [
          '/assets/images/hotel/room_triple.jpg',
          '/assets/images/hotel/room_triple_alt.jpg',
          '/assets/images/hotel/hotel_bathroom.jpg',
          '/assets/images/hotel/hotel_terrace.jpg',
          '/assets/images/hotel/hotel_facade.jpg'
        ],
        amenities: [
          'WiFi de alta velocidad gratuito',
          'Balcón privado',
          'Baño privado con ducha y agua caliente',
          'Artículos de aseo gratuitos y toallas',
          'TV de pantalla plana',
          'Escritorio de trabajo',
          'Ropa de cama completa',
          'Caja fuerte'
        ],
        highlights: ['2 individuales + 1 doble', 'Capacidad 4 personas', 'Balcón exterior', 'Baño privado']
      },
      {
        id: 3,
        title: 'Apartamento Dúplex',
        slug: 'apartamento-duplex',
        shortDescription: 'Apartamento en dos plantas con cocina equipada, sala, terraza e hidromasaje.',
        description: 'La experiencia premium de Punto Clave. Diseñado en dos niveles, dispone de dormitorio principal con cama grande, zona de cocina privada equipada con electrodomésticos, sala de estar, terraza privada al aire libre, TV de pantalla plana y baño amplio con bañera de hidromasaje para relajación total.',
        capacityText: '3 a 4 Huéspedes',
        capacityAdults: 4,
        bedConfiguration: '1 Cama Doble Grande + Sala de Estar Dúplex',
        pricePerNightSoles: 175,
        pricePerNightUsd: 48,
        mainImage: '/assets/images/hotel/room_duplex.jpg',
        gallery: [
          '/assets/images/hotel/room_duplex.jpg',
          '/assets/images/hotel/room_duplex_alt.jpg',
          '/assets/images/hotel/hotel_kitchen.jpg',
          '/assets/images/hotel/hotel_terrace.jpg',
          '/assets/images/hotel/hotel_bathroom.jpg',
          '/assets/images/hotel/hotel_main.jpg'
        ],
        amenities: [
          'Bañera de hidromasaje / Jacuzzi',
          'Zona de cocina privada y equipada',
          'Terraza / balcón amplio con vistas',
          'WiFi de alta velocidad gratuito',
          'Sala de estar integrada',
          'TV de pantalla plana',
          'Baño privado de lujo con artículos de aseo',
          'Ropa de cama y toallas de algodón'
        ],
        highlights: ['Cocina privada equipada', 'Bañera de hidromasaje', 'Terraza privada', 'Diseño dúplex']
      }
    ]
  };

  getHotelInfo(): Observable<HotelInfo> {
    return this.http.get<HotelInfo>(`${this.apiUrl}/hotel`).pipe(
      catchError(() => of(this.fallbackHotelInfo))
    );
  }

  getRooms(): Observable<HotelRoom[]> {
    return of(this.fallbackHotelInfo.rooms);
  }

  getRoomBySlug(slug: string): Observable<HotelRoom | undefined> {
    const room = this.fallbackHotelInfo.rooms.find(r => r.slug === slug);
    return of(room);
  }
}
