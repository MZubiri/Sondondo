import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { 
  AdminBooking, 
  AdminTour, 
  DashboardStats, 
  AdminContactMessage, 
  AdminTestimonial, 
  GalleryItem,
  PassengerManifestItem,
  HotelInfo,
  HotelRoom,
  HotelBooking
} from '../models/admin.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export const BOOKINGS_STORAGE_KEY = 'sondondo_admin_bookings_cache';
export const TOURS_STORAGE_KEY = 'sondondo_admin_tours_cache';
export const MESSAGES_STORAGE_KEY = 'sondondo_admin_messages_cache';
export const TESTIMONIALS_STORAGE_KEY = 'sondondo_admin_testimonials_cache';
export const GALLERY_STORAGE_KEY = 'sondondo_admin_gallery_cache';
export const HOTEL_STORAGE_KEY = 'sondondo_admin_hotel_cache';
export const HOTEL_BOOKINGS_STORAGE_KEY = 'sondondo_admin_hotel_bookings_cache';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
    return new HttpHeaders();
  }

  // Initial mock bookings with realistic Andean expedition data
  private initialMockBookings: AdminBooking[] = [
    {
      id: 1,
      voucherCode: 'VSE-2026-001',
      tourId: 1,
      tourTitle: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      fullName: 'Carlos Mendoza Ramos',
      email: 'carlos.mendoza@gmail.com',
      phone: '+51 984 123 456',
      numberOfPeople: 2,
      travelDate: '2026-10-15',
      message: 'Queremos ver el vuelo de cóndores temprano y visitar el templo de Aucará. ¿Tienen disponibilidad?',
      status: 'Pending',
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/51984123456?text=Hola%20Carlos,%20saludos%20de%20Valle%20del%20Sondondo%20Expeditions.',
      paymentMethod: 'Yape',
      paymentStatus: 'Adelanto 50%',
      totalAmount: 360,
      paidAmount: 180,
      guideName: 'Víctor Cárdenas (Guía Local Aucará)',
      driverName: 'Zenón Chauca',
      vehiclePlate: 'AY-4921',
      passengers: [
        {
          id: 'p1',
          fullName: 'Carlos Mendoza Ramos',
          documentType: 'DNI',
          documentNumber: '45892104',
          nationality: 'Peruana',
          age: 34,
          emergencyPhone: '+51 984 123 456'
        },
        {
          id: 'p2',
          fullName: 'Mariana Silva Gómez',
          documentType: 'DNI',
          documentNumber: '47120938',
          nationality: 'Peruana',
          age: 31,
          emergencyPhone: '+51 984 123 456'
        }
      ]
    },
    {
      id: 2,
      voucherCode: 'VSE-2026-002',
      tourId: 2,
      tourTitle: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
      fullName: 'Lucía Fernández Morales',
      email: 'lucia.fernandez@outlook.com',
      phone: '+51 966 789 012',
      numberOfPeople: 4,
      travelDate: '2026-11-02',
      message: 'Somos una familia de 4 personas interesada en la exhibición de danza de tijeras y las andenerías.',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/51966789012?text=Hola%20Lucia,%20saludos%20de%20Valle%20del%20Sondondo%20Expeditions.',
      paymentMethod: 'Transferencia BCP',
      paymentStatus: 'Pagado 100%',
      totalAmount: 780,
      paidAmount: 780,
      guideName: 'Víctor Cárdenas',
      driverName: 'Raúl Huarcaya',
      vehiclePlate: 'AY-7810',
      passengers: [
        {
          id: 'p1',
          fullName: 'Lucía Fernández Morales',
          documentType: 'DNI',
          documentNumber: '10948273',
          nationality: 'Peruana',
          age: 42,
          emergencyPhone: '+51 966 789 012'
        },
        {
          id: 'p2',
          fullName: 'Jorge Huamán Castro',
          documentType: 'DNI',
          documentNumber: '09837482',
          nationality: 'Peruana',
          age: 45,
          emergencyPhone: '+51 966 789 012'
        }
      ]
    },
    {
      id: 3,
      voucherCode: 'VSE-2026-003',
      tourId: 3,
      tourTitle: 'Minivolcanes de Pachapupum & Termas Medicinales',
      fullName: 'Marc Dupont',
      email: 'marc.dupont@voyage.fr',
      phone: '+33 612 345 678',
      numberOfPeople: 2,
      travelDate: '2026-10-28',
      message: 'Buscamos tour privado a las aguas termales de Sacsamarca y el cono de Pachapupum.',
      status: 'Confirmed',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/33612345678?text=Bonjour%20Marc,%20Valle%20del%20Sondondo%20Expeditions.',
      paymentMethod: 'MercadoPago',
      paymentStatus: 'Pagado 100%',
      totalAmount: 440,
      paidAmount: 440,
      guideName: 'Víctor Cárdenas',
      driverName: 'Zenón Chauca',
      vehiclePlate: 'AY-4921',
      passengers: [
        {
          id: 'p1',
          fullName: 'Marc Dupont',
          documentType: 'Pasaporte',
          documentNumber: '21AB94821',
          nationality: 'Francesa',
          age: 38,
          emergencyPhone: '+33 612 345 678'
        },
        {
          id: 'p2',
          fullName: 'Sophie Martin',
          documentType: 'Pasaporte',
          documentNumber: '19CD83721',
          nationality: 'Francesa',
          age: 36,
          emergencyPhone: '+33 612 345 678'
        }
      ]
    }
  ];

  private initialMockMessages: AdminContactMessage[] = [
    {
      id: 1,
      name: 'Dr. Alejandro Vargas',
      email: 'avargas@uni.edu.pe',
      phone: '+51 955 888 777',
      subject: 'Expedición académica sobre andenes de Andamarca',
      message: 'Buenas tardes, deseamos coordinar una salida de campo para 12 estudiantes de arqueología e ingeniería agrícola en noviembre.',
      createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      isRead: false
    },
    {
      id: 2,
      name: 'Silvia Huamán',
      email: 'silvia.huaman@viajesperu.pe',
      phone: '+51 999 444 333',
      subject: 'Alianza turística para grupos receptivos',
      message: 'Nos gustaría ofrecer sus circuitos del Valle del Sondondo en nuestro catálogo de turismo rural comunitario en Lima.',
      createdAt: new Date(Date.now() - 36 * 3600000).toISOString(),
      isRead: true
    }
  ];

  private initialTestimonials: AdminTestimonial[] = [
    {
      id: 1,
      authorName: 'Gabriel Sotomayor',
      authorCityOrCountry: 'Lima, Perú',
      rating: 5,
      comment: 'Ver más de 20 cóndores volar a metros de distancia en Mayobamba fue una de las experiencias más sobrecogedoras de mi vida. La atención de la agencia y el respeto a las comunidades locales es impecable.',
      tourName: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      date: 'Agosto 2026',
      avatarUrl: '/assets/images/condor_mayobamba.jpg',
      isApproved: true
    },
    {
      id: 2,
      authorName: 'Claire & Julien Becker',
      authorCityOrCountry: 'Ginebra, Suiza',
      rating: 5,
      comment: 'El volcán de Pachapupum y sus aguas termales en medio de la puna andina parecen sacados de otro planeta. Una ruta auténtica, alejada del turismo masivo.',
      tourName: 'Minivolcanes de Pachapupum & Termas Medicinales',
      date: 'Septiembre 2026',
      avatarUrl: '/assets/images/volcan_pachapupum.jpg',
      isApproved: true
    },
    {
      id: 3,
      authorName: 'Ing. Teresa Quispe',
      authorCityOrCountry: 'Arequipa, Perú',
      rating: 5,
      comment: 'La caminata entre las andenerías prehispánicas de Andamarca y la exhibición de la Danza de Tijeras me conmovió profundamente. Felicitaciones al equipo de guías.',
      tourName: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
      date: 'Julio 2026',
      avatarUrl: '/assets/images/andenes_andamarca.jpg',
      isApproved: true
    }
  ];

  private initialGallery: GalleryItem[] = [
    {
      id: 'g1',
      title: 'Cóndor Andino en Vuelo sobre el Cañón',
      category: 'Fauna',
      url: '/assets/images/condor_mayobamba.jpg',
      location: 'Mirador de Mayobamba, Aucará',
      altText: 'Vuelo del cóndor andino en Valle del Sondondo',
      uploadedAt: '2026-09-01'
    },
    {
      id: 'g2',
      title: 'Andenes Vivos Pre-Incas de Andamarca',
      category: 'Paisajes',
      url: '/assets/images/andenes_andamarca.jpg',
      location: 'Carmen Salcedo de Andamarca',
      altText: 'Anfiteatro de terrazas agrícolas andinas',
      uploadedAt: '2026-09-02'
    },
    {
      id: 'g3',
      title: 'Monumento Geotermal Volcán Pachapupum',
      category: 'Paisajes',
      url: '/assets/images/volcan_pachapupum.jpg',
      location: 'Sacsamarca / Huancasancos',
      altText: 'Cono volcánico de sal y termas medicinales',
      uploadedAt: '2026-09-03'
    },
    {
      id: 'g4',
      title: 'Vicuñas Silvestres en Bofedales',
      category: 'Fauna',
      url: '/assets/images/pampa_galeras_vicunas.jpg',
      location: 'Reserva Nacional Pampa Galeras Barbara D\'Achille',
      altText: 'Vicuñas en el altiplano de Lucanas',
      uploadedAt: '2026-09-04'
    },
    {
      id: 'g5',
      title: 'Pueblo Tradicional y Balcones de Piedra',
      category: 'Cultura',
      url: '/assets/images/pueblo_andamarca.jpg',
      location: 'Andamarca / Aucará',
      altText: 'Calles empedradas y arquitectura tradicional andina',
      uploadedAt: '2026-09-05'
    },
    {
      id: 'g6',
      title: 'Vista Panorámica del Valle del Sondondo',
      category: 'Paisajes',
      url: '/assets/images/hero_sondondo.jpg',
      location: 'Mirador Chauccalla, Aucará',
      altText: 'Paisaje cultural y río Sondondo',
      uploadedAt: '2026-09-06'
    }
  ];

  // In-memory signals
  bookingsSignal = signal<AdminBooking[]>(this.loadStoredBookings());
  messagesSignal = signal<AdminContactMessage[]>(this.loadStoredMessages());
  testimonialsSignal = signal<AdminTestimonial[]>(this.loadStoredTestimonials());
  gallerySignal = signal<GalleryItem[]>(this.loadStoredGallery());
  hotelInfoSignal = signal<HotelInfo>(this.loadStoredHotelInfo());
  hotelBookingsSignal = signal<HotelBooking[]>(this.loadStoredHotelBookings());

  private initialHotelInfo: HotelInfo = {
    name: 'Hotel Punto Clave',
    stars: 3,
    tagline: 'Alojamiento oficial y descanso confortable con balcón privado, terraza e hidromasaje',
    address: 'Mz.B - Lt.6 Calle Los Ficus',
    city: 'Ica',
    postalCode: '11004',
    description: 'Punto Clave, que cuenta con jardín, terraza y servicio de habitaciones, es un hotel de 3 estrellas en Ica. Ofrece recepción abierta las 24 horas, WiFi gratuito de alta velocidad en todo el establecimiento y estacionamiento privado gratuito. Cada habitación dispone de balcón privado con vistas, baño privado con ducha y artículos de aseo gratuitos, TV de pantalla plana, escritorio y ropa de cama.',
    whatsAppNumber: environment.fallbackWhatsApp || '51966380590',
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
          'Caja fuerte'
        ],
        highlights: ['1 cama doble', 'Balcón privado', 'Baño privado', 'WiFi gratis'],
        isActive: true,
        totalUnits: 3,
        floorOrZone: 'Piso 1 y 2'
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
        highlights: ['2 individuales + 1 doble', 'Capacidad 4 personas', 'Balcón exterior', 'Baño privado'],
        isActive: true,
        totalUnits: 2,
        floorOrZone: 'Piso 2'
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
        highlights: ['Cocina privada equipada', 'Bañera de hidromasaje', 'Terraza privada', 'Diseño dúplex'],
        isActive: true,
        totalUnits: 1,
        floorOrZone: 'Piso 3 Ático'
      }
    ]
  };

  private initialHotelBookings: HotelBooking[] = [
    {
      id: 1,
      voucherCode: 'HPC-2026-001',
      guestName: 'Eduardo Ramos Palomino',
      guestEmail: 'eduardo.ramos@outlook.com',
      guestPhone: '+51 984 567 890',
      guestDocumentType: 'DNI',
      guestDocumentNumber: '43892019',
      roomId: 1,
      roomTitle: 'Habitación Doble',
      checkInDate: '2026-10-14',
      checkOutDate: '2026-10-16',
      nights: 2,
      numberOfGuests: 2,
      totalPriceSoles: 170,
      paidAmountSoles: 170,
      paymentMethod: 'MercadoPago',
      paymentStatus: 'Pagado 100%',
      status: 'Confirmed',
      specialRequests: 'Llegada estimada a las 15:00 hrs. Cama matrimonial requerida.',
      createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/51984567890?text=Hola%20Eduardo,%20confirmamos%20tu%20estadia%20en%20Hotel%20Punto%20Clave.'
    },
    {
      id: 2,
      voucherCode: 'HPC-2026-002',
      guestName: 'Martina Valenzuela Soto',
      guestEmail: 'mvalenzuela@empresa.pe',
      guestPhone: '+51 966 234 111',
      guestDocumentType: 'DNI',
      guestDocumentNumber: '71209382',
      roomId: 3,
      roomTitle: 'Apartamento Dúplex',
      checkInDate: '2026-11-01',
      checkOutDate: '2026-11-04',
      nights: 3,
      numberOfGuests: 4,
      totalPriceSoles: 525,
      paidAmountSoles: 262.5,
      paymentMethod: 'Transferencia BCP',
      paymentStatus: 'Adelanto 50%',
      status: 'Pending',
      specialRequests: 'Solicitan preparación de jacuzzi y estacionamiento para camioneta 4x4.',
      createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
      whatsAppDirectUrl: 'https://wa.me/51966234111?text=Hola%20Martina,%20recibimos%20tu%20solicitud%20de%20reserva.'
    }
  ];

  private loadStoredHotelInfo(): HotelInfo {
    try {
      const stored = localStorage.getItem(HOTEL_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialHotelInfo;
  }

  private saveHotelInfoToStorage(info: HotelInfo): void {
    try {
      localStorage.setItem(HOTEL_STORAGE_KEY, JSON.stringify(info));
    } catch {}
    this.hotelInfoSignal.set(info);
  }

  private loadStoredHotelBookings(): HotelBooking[] {
    try {
      const stored = localStorage.getItem(HOTEL_BOOKINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialHotelBookings;
  }

  private saveHotelBookingsToStorage(bookings: HotelBooking[]): void {
    try {
      localStorage.setItem(HOTEL_BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {}
    this.hotelBookingsSignal.set(bookings);
  }

  private loadStoredBookings(): AdminBooking[] {
    try {
      const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialMockBookings;
  }

  private saveBookings(bookings: AdminBooking[]): void {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {}
    this.bookingsSignal.set(bookings);
  }

  private loadStoredMessages(): AdminContactMessage[] {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialMockMessages;
  }

  private saveMessages(messages: AdminContactMessage[]): void {
    try {
      localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    } catch {}
    this.messagesSignal.set(messages);
  }

  private loadStoredTestimonials(): AdminTestimonial[] {
    try {
      const stored = localStorage.getItem(TESTIMONIALS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialTestimonials;
  }

  private saveTestimonials(items: AdminTestimonial[]): void {
    try {
      localStorage.setItem(TESTIMONIALS_STORAGE_KEY, JSON.stringify(items));
    } catch {}
    this.testimonialsSignal.set(items);
  }

  private loadStoredGallery(): GalleryItem[] {
    try {
      const stored = localStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return this.initialGallery;
  }

  private saveGallery(items: GalleryItem[]): void {
    try {
      localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(items));
    } catch {}
    this.gallerySignal.set(items);
  }

  // --- STATS ---
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => {
        const bookings = this.bookingsSignal();
        const total = bookings.length;
        const pending = bookings.filter(b => b.status === 'Pending').length;
        const confirmed = bookings.filter(b => b.status === 'Confirmed').length;
        const unread = this.messagesSignal().filter(m => !m.isRead).length;
        const totalRev = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);

        const stats: DashboardStats = {
          totalBookings: total,
          pendingBookings: pending,
          confirmedBookings: confirmed,
          activeTours: 6,
          totalTours: 6,
          unreadMessages: unread,
          totalRevenueSoles: totalRev,
          recentBookings: bookings.slice(0, 5)
        };
        return of(stats);
      })
    );
  }

  // --- BOOKINGS ---
  getBookings(status?: string, search?: string): Observable<AdminBooking[]> {
    let url = `${this.apiUrl}/bookings`;
    const params: string[] = [];
    if (status && status !== 'all') params.push(`status=${encodeURIComponent(status)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<AdminBooking[]>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(items => {
        // Merge with local enriched data
        const local = this.bookingsSignal();
        const merged = items.map(apiItem => {
          const found = local.find(l => l.id === apiItem.id);
          return found ? { ...apiItem, ...found } : apiItem;
        });
        this.saveBookings(merged);
      }),
      catchError(() => {
        let list = this.bookingsSignal();
        if (status && status !== 'all') {
          list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(b => b.fullName.toLowerCase().includes(s) || 
                                  b.phone.includes(s) || 
                                  b.tourTitle.toLowerCase().includes(s) ||
                                  (b.voucherCode && b.voucherCode.toLowerCase().includes(s)));
        }
        return of(list);
      })
    );
  }

  updateBookingStatus(id: number, status: 'Pending' | 'Contacted' | 'Confirmed' | 'Cancelled'): Observable<boolean> {
    return this.http.patch<any>(`${this.apiUrl}/bookings/${id}/status`, { status }, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const updated = this.bookingsSignal().map(b => b.id === id ? { ...b, status } : b);
        this.saveBookings(updated);
      })
    );
  }

  updateBookingPayment(id: number, paymentData: {
    paymentMethod: AdminBooking['paymentMethod'];
    paidAmount: number;
    totalAmount: number;
    paymentStatus: AdminBooking['paymentStatus'];
    paymentReceiptUrl?: string;
  }): Observable<boolean> {
    const updated = this.bookingsSignal().map(b => {
      if (b.id === id) {
        return {
          ...b,
          ...paymentData
        };
      }
      return b;
    });
    this.saveBookings(updated);
    return of(true);
  }

  updateBookingManifest(id: number, manifestData: {
    passengers: PassengerManifestItem[];
    guideName?: string;
    driverName?: string;
    vehiclePlate?: string;
  }): Observable<boolean> {
    const updated = this.bookingsSignal().map(b => {
      if (b.id === id) {
        return {
          ...b,
          ...manifestData
        };
      }
      return b;
    });
    this.saveBookings(updated);
    return of(true);
  }

  deleteBooking(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/bookings/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const filtered = this.bookingsSignal().filter(b => b.id !== id);
        this.saveBookings(filtered);
      })
    );
  }

  exportBookingsCsv(): void {
    const bookings = this.bookingsSignal();
    const headers = [
      'ID',
      'Código Voucher',
      'Fecha Creación',
      'Fecha Tour',
      'Tour / Circuito',
      'Cliente',
      'Teléfono',
      'Email',
      'N° Pasajeros',
      'Estado Reserva',
      'Método de Pago',
      'Estado de Pago',
      'Total (S/)',
      'Pagado (S/)',
      'Saldo Pendiente (S/)',
      'Guía Asignado',
      'Conductor'
    ];

    const rows = bookings.map(b => {
      const total = b.totalAmount || 0;
      const paid = b.paidAmount || 0;
      const pending = Math.max(0, total - paid);
      return [
        b.id,
        b.voucherCode || `VSE-2026-${b.id.toString().padStart(3, '0')}`,
        new Date(b.createdAt).toLocaleDateString('es-PE'),
        b.travelDate || 'Por coordinar',
        `"${(b.tourTitle || '').replace(/"/g, '""')}"`,
        `"${(b.fullName || '').replace(/"/g, '""')}"`,
        b.phone,
        b.email,
        b.numberOfPeople,
        b.status,
        b.paymentMethod || 'Pendiente',
        b.paymentStatus || 'Pendiente',
        total,
        paid,
        pending,
        `"${(b.guideName || '').replace(/"/g, '""')}"`,
        `"${(b.driverName || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reservas_Valle_Sondondo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private sanitizeAdminTour(tour: AdminTour): AdminTour {
    let img = tour.mainImageUrl;
    if (img && (img.startsWith('data:image/') || img.startsWith('blob:'))) {
      return tour;
    }
    if (!img || img.includes('unsplash.com') || img.startsWith('http')) {
      const slug = (tour.slug || '').toLowerCase();
      const title = (tour.title || '').toLowerCase();
      if (slug.includes('condor') || title.includes('cóndor') || title.includes('condor') || slug.includes('mayobamba')) {
        img = '/assets/images/condor_mayobamba.jpg';
      } else if (slug.includes('andenes') || title.includes('andamarca') || title.includes('tijeras') || slug.includes('cultura')) {
        img = '/assets/images/andenes_andamarca.jpg';
      } else if (slug.includes('volcan') || slug.includes('pachapupum') || slug.includes('termal') || title.includes('termas') || title.includes('volcán')) {
        img = '/assets/images/volcan_pachapupum.jpg';
      } else if (slug.includes('qarhuarazo') || slug.includes('pampa') || slug.includes('galeras') || title.includes('qarhuarazo') || title.includes('vicuña')) {
        img = '/assets/images/pampa_galeras_vicunas.jpg';
      } else if (slug.includes('pueblo') || title.includes('pueblos') || title.includes('aucara') || title.includes('cabana') || title.includes('chipao')) {
        img = '/assets/images/pueblo_andamarca.jpg';
      } else {
        img = '/assets/images/hero_sondondo.jpg';
      }
    }
    return { 
      ...tour, 
      isActive: tour.isActive !== false,
      mainImageUrl: img 
    };
  }

  // Default initial tours
  private initialTours: AdminTour[] = [
    {
      id: 1,
      title: 'Kuntur Ñan: El Vuelo del Cóndor en Mayobamba',
      slug: 'vuelo-del-condor-mayobamba',
      subtitle: 'Avistamiento a 6:30 a.m. en el Cañón de Mayobamba, Aucará',
      description: 'Presencia el vuelo majestuoso del cóndor andino desde miradores naturales en Mayobamba.',
      categoryId: 1,
      categoryName: 'Aventura & Naturaleza',
      categorySlug: 'ruta-condor',
      duration: 'Full Day (8 horas)',
      durationDays: 1,
      priceSoles: 180,
      priceUsd: 48,
      difficulty: 'Moderada',
      altitudeMax: '3,450 msnm',
      startingPoint: 'Aucará / Puquio',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/condor_mayobamba.jpg',
      galleryImages: [
        '/assets/images/condor_mayobamba.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/pueblo_andamarca.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/rio_sondondo.jpg'
      ],
      displayOrder: 1
    },
    {
      id: 2,
      title: 'Gran Circuito Andenes Vivos de Andamarca & Danza de Tijeras',
      slug: 'andenes-andamarca-danza-tijeras',
      subtitle: 'Patrimonio de la Humanidad UNESCO, ingeniería pre-Inca y mística andina',
      description: 'Caminata por el anfiteatro de andenes agrícolas más extenso del Perú y exhibición de danzaq tradicional.',
      categoryId: 2,
      categoryName: 'Cultura & Arqueología',
      categorySlug: 'cultura-viva-andenes',
      duration: 'Full Day (9 horas)',
      durationDays: 1,
      priceSoles: 195,
      priceUsd: 52,
      difficulty: 'Fácil - Moderada',
      altitudeMax: '3,250 msnm',
      startingPoint: 'Andamarca',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/andenes_andamarca.jpg',
      galleryImages: [
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/pueblo_andamarca.jpg',
        '/assets/images/condor_mayobamba.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/rio_sondondo.jpg'
      ],
      displayOrder: 2
    },
    {
      id: 3,
      title: 'Minivolcanes de Pachapupum & Termas Medicinales',
      slug: 'volcan-pachapupum-termas',
      subtitle: 'Monumento geotermal de sal y azufre a 4,022 msnm en Sacsamarca',
      description: 'Visita el impresionante cono volcánico salino de 30 metros de altura y disfruta de sus pozas termales.',
      categoryId: 1,
      categoryName: 'Aventura & Naturaleza',
      categorySlug: 'aguas-termales-canones',
      duration: 'Full Day (10 horas)',
      durationDays: 1,
      priceSoles: 220,
      priceUsd: 59,
      difficulty: 'Moderada',
      altitudeMax: '4,022 msnm',
      startingPoint: 'Huancasancos / Sacsamarca',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/volcan_pachapupum.jpg',
      galleryImages: [
        '/assets/images/volcan_pachapupum.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/pueblo_andamarca.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/rio_sondondo.jpg'
      ],
      displayOrder: 3
    },
    {
      id: 4,
      title: 'Trek Pampa Galeras & Bofedales del Apu Qarhuarazo',
      slug: 'pampa-galeras-vicunas-apu-qarhuarazo',
      subtitle: 'Santuario de vicuñas silvestres y vistas al glaciar sagrado (5,112 msnm)',
      description: 'Safari andino por la Reserva Nacional Pampa Galeras y caminata hacia bofedales altoandinos.',
      categoryId: 1,
      categoryName: 'Aventura & Naturaleza',
      categorySlug: 'alta-montana-vicunas',
      duration: 'Full Day (8 horas)',
      durationDays: 1,
      priceSoles: 210,
      priceUsd: 56,
      difficulty: 'Moderada - Exigente',
      altitudeMax: '4,100 msnm',
      startingPoint: 'Puquio / Lucanas',
      featured: false,
      isActive: true,
      mainImageUrl: '/assets/images/pampa_galeras_vicunas.jpg',
      galleryImages: [
        '/assets/images/pampa_galeras_vicunas.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/bosque_piedras.jpg',
        '/assets/images/hero_sondondo.jpg'
      ],
      displayOrder: 4
    },
    {
      id: 5,
      title: 'Ruta de los Pueblos Mágicos: Aucará, Cabana Sur & Chipao',
      slug: 'pueblos-magicos-aucara-cabana-chipao',
      subtitle: 'Templos coloniales de piedra, mirador Chauccalla y la ruta de Guamán Poma',
      description: 'Recorrido por la arquitectura colonial andina, plazas históricas e iglesias de piedra.',
      categoryId: 2,
      categoryName: 'Cultura & Arqueología',
      categorySlug: 'pueblos-historicos',
      duration: 'Full Day (7 horas)',
      durationDays: 1,
      priceSoles: 160,
      priceUsd: 43,
      difficulty: 'Fácil',
      altitudeMax: '3,300 msnm',
      startingPoint: 'Aucará',
      featured: false,
      isActive: true,
      mainImageUrl: '/assets/images/pueblo_andamarca.jpg',
      galleryImages: [
        '/assets/images/pueblo_andamarca.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/rio_sondondo.jpg',
        '/assets/images/hero_sondondo.jpg'
      ],
      displayOrder: 5
    },
    {
      id: 6,
      title: 'Gran Travesía Valle del Sondondo (3 Días / 2 Noches)',
      slug: 'gran-travesia-valle-sondondo-3d2n',
      subtitle: 'El viaje definitivo: Cóndores, Andenes, Volcán Pachapupum y Pampa Galeras',
      description: 'Expedición completa con transporte privado, guías locales quechuahablantes y hospedaje rural.',
      categoryId: 3,
      categoryName: 'Expediciones Completas',
      categorySlug: 'expedicion-integral',
      duration: '3 Días / 2 Noches',
      durationDays: 3,
      priceSoles: 680,
      priceUsd: 182,
      difficulty: 'Moderada',
      altitudeMax: '4,022 msnm',
      startingPoint: 'Puquio / Aucará',
      featured: true,
      isActive: true,
      mainImageUrl: '/assets/images/hero_sondondo.jpg',
      galleryImages: [
        '/assets/images/hero_sondondo.jpg',
        '/assets/images/condor_mayobamba.jpg',
        '/assets/images/andenes_andamarca.jpg',
        '/assets/images/volcan_pachapupum.jpg',
        '/assets/images/pampa_galeras_vicunas.jpg',
        '/assets/images/pueblo_andamarca.jpg'
      ],
      displayOrder: 6
    }
  ];

  loadStoredTours(): AdminTour[] {
    try {
      const stored = localStorage.getItem(TOURS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AdminTour[];
        if (parsed && parsed.length > 0) {
          return parsed.map(t => {
            const initialMatch = this.initialTours.find(it => it.id === t.id);
            return {
              ...t,
              isActive: t.isActive !== false,
              galleryImages: t.galleryImages && t.galleryImages.length > 0
                ? t.galleryImages
                : (initialMatch?.galleryImages || [
                    t.mainImageUrl || '/assets/images/hero_sondondo.jpg',
                    '/assets/images/andenes_andamarca.jpg',
                    '/assets/images/pueblo_andamarca.jpg',
                    '/assets/images/bosque_piedras.jpg',
                    '/assets/images/rio_sondondo.jpg'
                  ])
            };
          });
        }
      }
    } catch {}
    try {
      localStorage.setItem(TOURS_STORAGE_KEY, JSON.stringify(this.initialTours));
    } catch {}
    return this.initialTours;
  }

  saveTours(tours: AdminTour[]): void {
    try {
      localStorage.setItem(TOURS_STORAGE_KEY, JSON.stringify(tours));
    } catch {}
  }

  // --- TOURS ---
  getTours(includeInactive = true): Observable<AdminTour[]> {
    return this.http.get<AdminTour[]>(`${this.apiUrl}/tours?includeInactive=${includeInactive}`, { headers: this.getAuthHeaders() }).pipe(
      map(tours => tours.map(t => this.sanitizeAdminTour(t))),
      tap(apiTours => {
        const stored = this.loadStoredTours();
        const merged = apiTours.map(apiTour => {
          const found = stored.find(s => s.id === apiTour.id);
          if (!found) return apiTour;
          return {
            ...apiTour,
            priceSoles: apiTour.priceSoles > 0 ? apiTour.priceSoles : (found.priceSoles || apiTour.priceSoles),
            priceUsd: apiTour.priceUsd > 0 ? apiTour.priceUsd : (found.priceUsd || apiTour.priceUsd),
            galleryImages: (found.galleryImages && found.galleryImages.length > 0) ? found.galleryImages : apiTour.galleryImages,
            mainImageUrl: found.mainImageUrl || apiTour.mainImageUrl
          };
        });
        this.saveTours(merged);
      }),
      catchError(() => {
        const stored = this.loadStoredTours();
        const filtered = includeInactive ? stored : stored.filter(t => t.isActive !== false);
        return of(filtered.map(t => this.sanitizeAdminTour(t)));
      })
    );
  }

  toggleTourActive(id: number): Observable<boolean> {
    const tours = this.loadStoredTours();
    const updated = tours.map(t => {
      if (t.id === id) {
        const currentActive = t.isActive !== false;
        return { ...t, isActive: !currentActive };
      }
      return t;
    });
    this.saveTours(updated);

    return this.http.patch<any>(`${this.apiUrl}/tours/${id}/toggle-active`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  saveTour(tour: AdminTour): Observable<AdminTour> {
    const tours = this.loadStoredTours();
    const isEdit = tour.id > 0;
    const finalTour: AdminTour = isEdit ? tour : { ...tour, id: Date.now() };

    let updated: AdminTour[];
    if (isEdit && tours.some(t => t.id === tour.id)) {
      updated = tours.map(t => t.id === tour.id ? finalTour : t);
    } else {
      updated = [finalTour, ...tours];
    }
    this.saveTours(updated);

    if (isEdit) {
      return this.http.put<any>(`${this.apiUrl}/tours/${tour.id}`, tour, { headers: this.getAuthHeaders() }).pipe(
        map(() => finalTour),
        catchError(() => of(finalTour))
      );
    } else {
      return this.http.post<any>(`${this.apiUrl}/tours`, tour, { headers: this.getAuthHeaders() }).pipe(
        map(res => ({ ...finalTour, id: res.id || finalTour.id })),
        catchError(() => of(finalTour))
      );
    }
  }

  deleteTour(id: number): Observable<boolean> {
    const tours = this.loadStoredTours();
    this.saveTours(tours.filter(t => t.id !== id));

    return this.http.delete<any>(`${this.apiUrl}/tours/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  // --- MESSAGES ---
  getContactMessages(): Observable<AdminContactMessage[]> {
    return this.http.get<AdminContactMessage[]>(`${this.apiUrl}/contact`, { headers: this.getAuthHeaders() }).pipe(
      tap(items => this.saveMessages(items)),
      catchError(() => of(this.messagesSignal()))
    );
  }

  toggleMessageRead(id: number): Observable<boolean> {
    return this.http.patch<any>(`${this.apiUrl}/contact/${id}/read`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const updated = this.messagesSignal().map(m => m.id === id ? { ...m, isRead: !m.isRead } : m);
        this.saveMessages(updated);
      })
    );
  }

  deleteMessage(id: number): Observable<boolean> {
    return this.http.delete<any>(`${this.apiUrl}/contact/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true)),
      tap(() => {
        const filtered = this.messagesSignal().filter(m => m.id !== id);
        this.saveMessages(filtered);
      })
    );
  }

  // --- TESTIMONIALS & REVIEWS ---
  getTestimonials(): Observable<AdminTestimonial[]> {
    return of(this.testimonialsSignal());
  }

  saveTestimonial(testimonial: AdminTestimonial): Observable<AdminTestimonial> {
    let list = this.testimonialsSignal();
    if (testimonial.id > 0) {
      list = list.map(t => t.id === testimonial.id ? testimonial : t);
    } else {
      testimonial.id = Date.now();
      list = [testimonial, ...list];
    }
    this.saveTestimonials(list);
    return of(testimonial);
  }

  toggleTestimonialApproved(id: number): Observable<boolean> {
    const list = this.testimonialsSignal().map(t => 
      t.id === id ? { ...t, isApproved: !t.isApproved } : t
    );
    this.saveTestimonials(list);
    return of(true);
  }

  deleteTestimonial(id: number): Observable<boolean> {
    const list = this.testimonialsSignal().filter(t => t.id !== id);
    this.saveTestimonials(list);
    return of(true);
  }

  // --- GALLERY ---
  getGalleryItems(): Observable<GalleryItem[]> {
    return of(this.gallerySignal());
  }

  addGalleryItem(item: GalleryItem): Observable<GalleryItem> {
    const list = [item, ...this.gallerySignal()];
    this.saveGallery(list);
    return of(item);
  }

  deleteGalleryItem(id: string): Observable<boolean> {
    const list = this.gallerySignal().filter(g => g.id !== id);
    this.saveGallery(list);
    return of(true);
  }

  // --- HOTEL & LODGING MANAGEMENT ---

  getHotelInfo(includeInactive = true): Observable<HotelInfo> {
    return this.http.get<HotelInfo>(`${this.apiUrl}/hotel?includeInactive=${includeInactive}`, { headers: this.getAuthHeaders() }).pipe(
      tap(apiInfo => {
        if (apiInfo && apiInfo.name) {
          this.saveHotelInfoToStorage(apiInfo);
        }
      }),
      catchError(() => {
        const stored = this.loadStoredHotelInfo();
        const res: HotelInfo = {
          ...stored,
          rooms: includeInactive ? stored.rooms : stored.rooms.filter(r => r.isActive !== false)
        };
        return of(res);
      })
    );
  }

  updateHotelInfo(info: HotelInfo): Observable<HotelInfo> {
    this.saveHotelInfoToStorage(info);

    return this.http.put<HotelInfo>(`${this.apiUrl}/hotel`, info, { headers: this.getAuthHeaders() }).pipe(
      tap(saved => this.saveHotelInfoToStorage(saved)),
      catchError(() => of(info))
    );
  }

  getHotelRooms(includeInactive = true): Observable<HotelRoom[]> {
    return this.http.get<HotelRoom[]>(`${this.apiUrl}/hotel/rooms?includeInactive=${includeInactive}`, { headers: this.getAuthHeaders() }).pipe(
      tap(rooms => {
        const current = this.loadStoredHotelInfo();
        current.rooms = rooms;
        this.saveHotelInfoToStorage(current);
      }),
      catchError(() => {
        const stored = this.loadStoredHotelInfo();
        const rooms = includeInactive ? stored.rooms : stored.rooms.filter(r => r.isActive !== false);
        return of(rooms);
      })
    );
  }

  saveHotelRoom(room: HotelRoom): Observable<HotelRoom> {
    const currentInfo = this.loadStoredHotelInfo();
    const rooms = [...currentInfo.rooms];
    const isEdit = room.id > 0;
    const finalRoom: HotelRoom = isEdit ? { ...room } : { ...room, id: Date.now() };

    if (isEdit && rooms.some(r => r.id === room.id)) {
      currentInfo.rooms = rooms.map(r => r.id === room.id ? finalRoom : r);
    } else {
      currentInfo.rooms = [finalRoom, ...rooms];
    }
    this.saveHotelInfoToStorage(currentInfo);

    if (isEdit) {
      return this.http.put<HotelRoom>(`${this.apiUrl}/hotel/rooms/${room.id}`, room, { headers: this.getAuthHeaders() }).pipe(
        map(() => finalRoom),
        catchError(() => of(finalRoom))
      );
    } else {
      return this.http.post<HotelRoom>(`${this.apiUrl}/hotel/rooms`, room, { headers: this.getAuthHeaders() }).pipe(
        map(res => ({ ...finalRoom, id: res.id || finalRoom.id })),
        catchError(() => of(finalRoom))
      );
    }
  }

  deleteHotelRoom(id: number): Observable<boolean> {
    const current = this.loadStoredHotelInfo();
    current.rooms = current.rooms.filter(r => r.id !== id);
    this.saveHotelInfoToStorage(current);

    return this.http.delete<any>(`${this.apiUrl}/hotel/rooms/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  toggleHotelRoomActive(id: number): Observable<boolean> {
    const current = this.loadStoredHotelInfo();
    current.rooms = current.rooms.map(r => {
      if (r.id === id) {
        return { ...r, isActive: r.isActive === false ? true : false };
      }
      return r;
    });
    this.saveHotelInfoToStorage(current);

    return this.http.patch<any>(`${this.apiUrl}/hotel/rooms/${id}/toggle-active`, {}, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  // --- HOTEL BOOKINGS ---

  getHotelBookings(status?: string, search?: string): Observable<HotelBooking[]> {
    let url = `${this.apiUrl}/hotel/bookings`;
    const params: string[] = [];
    if (status && status !== 'all') params.push(`status=${encodeURIComponent(status)}`);
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    return this.http.get<HotelBooking[]>(url, { headers: this.getAuthHeaders() }).pipe(
      tap(bookings => this.saveHotelBookingsToStorage(bookings)),
      catchError(() => {
        let list = this.loadStoredHotelBookings();
        if (status && status !== 'all') {
          list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
        }
        if (search) {
          const s = search.toLowerCase();
          list = list.filter(b => 
            b.guestName.toLowerCase().includes(s) ||
            b.guestPhone.includes(s) ||
            b.roomTitle.toLowerCase().includes(s) ||
            b.voucherCode.toLowerCase().includes(s)
          );
        }
        return of(list);
      })
    );
  }

  saveHotelBooking(booking: HotelBooking): Observable<HotelBooking> {
    const bookings = this.loadStoredHotelBookings();
    const isEdit = booking.id > 0;
    const finalBooking: HotelBooking = isEdit 
      ? { ...booking } 
      : { 
          ...booking, 
          id: Date.now(), 
          createdAt: new Date().toISOString(),
          voucherCode: booking.voucherCode || `HPC-2026-${(bookings.length + 1).toString().padStart(3, '0')}`
        };

    const cleanPhone = booking.guestPhone.replace(/\D/g, '');
    const phoneToUse = cleanPhone.length === 9 ? '51' + cleanPhone : cleanPhone;
    finalBooking.whatsAppDirectUrl = `https://wa.me/${phoneToUse || '51966380590'}?text=${encodeURIComponent(
      `Hola ${booking.guestName}, te saludamos de Hotel Punto Clave respecto a tu reserva ${finalBooking.voucherCode} para ${booking.roomTitle}.`
    )}`;

    let updated: HotelBooking[];
    if (isEdit && bookings.some(b => b.id === booking.id)) {
      updated = bookings.map(b => b.id === booking.id ? finalBooking : b);
    } else {
      updated = [finalBooking, ...bookings];
    }
    this.saveHotelBookingsToStorage(updated);

    return this.http.post<HotelBooking>(`${this.apiUrl}/hotel/bookings`, finalBooking, { headers: this.getAuthHeaders() }).pipe(
      catchError(() => of(finalBooking))
    );
  }

  updateHotelBookingStatus(id: number, status: HotelBooking['status']): Observable<boolean> {
    const bookings = this.loadStoredHotelBookings().map(b => b.id === id ? { ...b, status } : b);
    this.saveHotelBookingsToStorage(bookings);

    return this.http.patch<any>(`${this.apiUrl}/hotel/bookings/${id}/status`, { status }, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  deleteHotelBooking(id: number): Observable<boolean> {
    const filtered = this.loadStoredHotelBookings().filter(b => b.id !== id);
    this.saveHotelBookingsToStorage(filtered);

    return this.http.delete<any>(`${this.apiUrl}/hotel/bookings/${id}`, { headers: this.getAuthHeaders() }).pipe(
      map(() => true),
      catchError(() => of(true))
    );
  }

  exportHotelBookingsCsv(): void {
    const bookings = this.loadStoredHotelBookings();
    const headers = [
      'ID',
      'Código Voucher',
      'Huésped',
      'Teléfono',
      'Email',
      'Documento',
      'Habitación Reservada',
      'Fecha Check-In',
      'Fecha Check-Out',
      'Noches',
      'N° Huéspedes',
      'Total (S/)',
      'Pagado (S/)',
      'Saldo Pendiente (S/)',
      'Método de Pago',
      'Estado de Pago',
      'Estado Reserva',
      'Fecha Creación',
      'Peticiones Especiales'
    ];

    const rows = bookings.map(b => {
      const total = b.totalPriceSoles || 0;
      const paid = b.paidAmountSoles || 0;
      const pending = Math.max(0, total - paid);
      return [
        b.id,
        b.voucherCode,
        `"${(b.guestName || '').replace(/"/g, '""')}"`,
        b.guestPhone,
        b.guestEmail,
        `${b.guestDocumentType || 'DNI'}: ${b.guestDocumentNumber || '-'}`,
        `"${(b.roomTitle || '').replace(/"/g, '""')}"`,
        b.checkInDate,
        b.checkOutDate,
        b.nights,
        b.numberOfGuests,
        total,
        paid,
        pending,
        b.paymentMethod || 'Pendiente',
        b.paymentStatus || 'Pendiente',
        b.status,
        new Date(b.createdAt).toLocaleDateString('es-PE'),
        `"${(b.specialRequests || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reservas_Hospedaje_Punto_Clave_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

